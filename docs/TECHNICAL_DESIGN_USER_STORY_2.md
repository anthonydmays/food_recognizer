# Technical Design Document: Recipe Generation from Food Images

## User Story #2
> As a cook, I want to generate a recipe from a picture of food including the ingredients, title, and steps so that I can save time discovering the recipe.

## Overview

This feature enables users to upload a photograph of a dish and automatically receive a complete recipe, including the dish name, ingredients list, and cooking instructions. The solution combines computer vision for food recognition with AI-powered recipe generation, integrated into a modern web application.

## Architecture

### Technology Stack
- **Frontend:** React + Next.js + Tailwind CSS
- **Backend:** Next.js API routes
- **Recipe Generation:** OpenAI GPT-4 Vision API (for both image recognition and recipe generation)
- **File Storage:** Local temporary storage (no persistent storage needed)

### System Components

```
[User Interface] → [Next.js Frontend]
                      ↓
[API Routes] → [OpenAI GPT-4 Vision API]
                      ↓
[Generated Recipe] → [User Display]
```

## Detailed Design

### 1. Frontend Components

#### ImageUploadComponent
- Drag-and-drop interface using react-dropzone
- Image preview with crop/resize functionality
- Upload progress indicator
- File validation (format, size limits)

#### RecipeDisplayComponent
- Clean layout showing generated recipe
- Ingredients list with checkboxes
- Step-by-step instructions
- Copy recipe button (for users to save externally)
- Simple feedback form (optional rating)

### 2. Backend API Design

#### POST `/api/generate-recipe`
```typescript
interface RecipeRequest {
  imageBase64: string; // Base64 encoded image
}

interface RecipeResponse {
  success: boolean;
  recipe?: {
    title: string;
    ingredients: Array<{
      name: string;
      quantity: string;
      unit: string;
    }>;
    instructions: string[];
    cookingTime?: number;
    servings?: number;
    description?: string;
  };
  error?: string;
}
```

### 3. Recipe Generation Pipeline

#### Single-Step Process with OpenAI GPT-4 Vision
- Send image directly to OpenAI GPT-4 Vision API
- Use structured prompt to generate complete recipe
- Parse JSON response into recipe format
- Return formatted recipe to frontend

#### Prompt Engineering
```typescript
const RECIPE_PROMPT = `
Analyze this food image and generate a complete recipe. 
Respond with a JSON object containing:
- title: The name of the dish
- description: Brief description (1-2 sentences)
- ingredients: Array of {name, quantity, unit}
- instructions: Array of step-by-step cooking instructions
- cookingTime: Estimated time in minutes
- servings: Number of servings

Make reasonable assumptions about quantities and cooking methods based on what you can see in the image.
`;
```

### 4. OpenAI Integration Service

#### Recipe Generation with GPT-4 Vision
```typescript
async function generateRecipeFromImage(imageBase64: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: RECIPE_PROMPT
          },
          {
            type: "image_url",
            image_url: { 
              url: `data:image/jpeg;base64,${imageBase64}` 
            }
          }
        ]
      }
    ],
    max_tokens: 1000,
    temperature: 0.7
  });
  
  return parseRecipeFromResponse(response.choices[0].message.content);
}
```

#### Response Parsing
```typescript
function parseRecipeFromResponse(content: string): Recipe {
  try {
    const recipe = JSON.parse(content);
    return validateAndFormatRecipe(recipe);
  } catch (error) {
    // Fallback: extract recipe info using regex if JSON parsing fails
    return extractRecipeFromText(content);
  }
}
```

### 5. No Database Required

Since we're generating recipes on-demand for each image, no persistent storage is needed. This simplifies the architecture significantly:

- **No data persistence:** Each request generates a fresh recipe
- **No user accounts:** Stateless recipe generation
- **No caching:** Each image processed independently
- **Simplified deployment:** No database setup or migrations needed

Users can copy/paste or screenshot recipes if they want to save them externally.

## Implementation Flow

### 1. Image Upload Process
1. User selects/drops image file
2. Frontend validates file (type, size)
3. Convert image to base64 for API transmission
4. POST request sent to `/api/generate-recipe`

### 2. Recipe Generation Process
1. Backend receives base64 image data
2. Send image directly to OpenAI GPT-4 Vision API
3. Parse structured response from OpenAI
4. Validate recipe format and completeness
5. Return recipe to frontend for display

### 3. User Interaction Process
1. Display generated recipe to user
2. User can copy recipe text or take screenshot
3. Optional: User provides simple feedback rating
4. User can upload another image for a new recipe

## Technical Implementation Details

### Complete API Route Implementation
```typescript
// /pages/api/generate-recipe.ts
import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const RECIPE_PROMPT = `
Analyze this food image and generate a complete recipe. 
Respond with a JSON object containing:
- title: The name of the dish
- description: Brief description (1-2 sentences)
- ingredients: Array of {name, quantity, unit}
- instructions: Array of step-by-step cooking instructions
- cookingTime: Estimated time in minutes
- servings: Number of servings

Make reasonable assumptions about quantities and cooking methods based on what you can see in the image.
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data required' });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: RECIPE_PROMPT },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const content = response.choices[0].message.content;
    const recipe = JSON.parse(content);

    return res.status(200).json({ success: true, recipe });
  } catch (error) {
    console.error('Recipe generation error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to generate recipe' 
    });
  }
}
```

### Frontend Image Processing
```typescript
// Convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1]; // Remove data:image/jpeg;base64, prefix
      resolve(base64Data);
    };
    reader.onerror = reject;
  });
}

// Generate recipe from uploaded image
async function generateRecipe(file: File) {
  const imageBase64 = await fileToBase64(file);
  
  const response = await fetch('/api/generate-recipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64 })
  });
  
  const result = await response.json();
  return result;
}
```

## Performance Considerations

### Optimization Strategies
- **Request Size Optimization:** Compress images before base64 encoding
- **API Rate Limiting:** Implement client-side throttling for OpenAI API calls
- **Error Handling:** Graceful fallbacks for API failures
- **Loading States:** Show progress indicators during recipe generation
- **Image Validation:** Check file size and format before processing

### Cost Management
- **Image Compression:** Reduce image size to minimize API costs
- **Request Optimization:** Single API call per image (no separate recognition step)
- **Usage Monitoring:** Track OpenAI API usage and costs
- **Request Timeouts:** Set reasonable timeouts to prevent hanging requests

## Integration with Other User Stories

### Compatibility with Future Features
- **User Story #1:** Generated recipes can be manually saved by users (copy/paste)
- **User Story #3:** Ingredients from generated recipes can be used for store lookup
- **User Story #4:** Generated ingredients can populate delivery orders
- **User Story #5:** Recipe quantities can be converted to user's preferred units
- **User Story #6:** OpenAI can suggest alternatives for generated ingredients

### Future Database Integration
When ready to add persistence:
- Generated recipes can be stored with user consent
- User feedback can be collected to improve prompts
- Popular recipes can be cached for faster access
- User accounts can be added to save personal recipe collections

## Error Handling & Edge Cases

### Error Scenarios
- **Invalid image format:** Return user-friendly error message
- **Large file sizes:** Implement file size limits and compression
- **OpenAI API failures:** Retry logic with exponential backoff
- **Malformed API responses:** Fallback parsing methods
- **Rate limiting:** Queue requests or show "try again later" message

### Validation
- **Image quality checks:** Basic file validation (format, size)
- **Recipe completeness:** Ensure required fields are present in OpenAI response
- **Content safety:** Basic checks for appropriate food content
- **JSON parsing:** Robust parsing with fallback text extraction

## Testing Strategy

### Unit Tests
- Image to base64 conversion functions
- Recipe parsing and validation
- API endpoint responses
- Error handling scenarios

### Integration Tests
- End-to-end image upload and recipe generation flow
- OpenAI API integration with various image types
- Error handling with malformed responses

### Manual Testing
- Test with various food images (different cuisines, quality, angles)
- Verify recipe accuracy and completeness
- Test error scenarios (invalid files, network issues)
- Validate user experience and loading states

## Deployment & Monitoring

### Deployment Strategy
- **Environment Variables:** Secure OpenAI API key configuration
- **Vercel Deployment:** Simple deployment with built-in Next.js support
- **No Database Setup:** Significantly simplified deployment process
- **API Rate Limits:** Monitor OpenAI usage and implement client-side limits

### Monitoring & Analytics
- **API Usage Tracking:** Monitor OpenAI API calls and costs
- **Error Rate Monitoring:** Track failed recipe generations
- **User Engagement:** Upload frequency and success rates
- **Response Times:** Monitor API response latency

## Security Considerations

### Data Protection
- **Image Privacy:** No persistent storage of uploaded images
- **API Security:** Secure OpenAI API key management
- **Input Validation:** Sanitize all user inputs and uploaded files
- **HTTPS Only:** Ensure all API communications are encrypted

### Content Safety
- **Image Content Filtering:** Basic validation for appropriate food images
- **OpenAI Safety:** Leverage OpenAI's built-in content filtering
- **File Size Limits:** Prevent abuse with reasonable file size restrictions

## Success Metrics

### Key Performance Indicators
- **Recipe Quality:** User satisfaction with generated recipes (subjective feedback)
- **API Success Rate:** >95% successful recipe generations
- **User Engagement:** Recipe generation frequency and repeat usage
- **Performance:** <10 second average response time for recipe generation
- **Cost Efficiency:** Reasonable OpenAI API costs per recipe generated

## Timeline & Milestones

### Phase 1 (1 week)
- Set up basic image upload UI with drag-and-drop
- Implement OpenAI API integration
- Create recipe display component
- Basic error handling

### Phase 2 (1 week)
- Refine prompt engineering for better recipe quality
- Add image compression and validation
- Implement loading states and user feedback
- Comprehensive error handling and edge cases

### Phase 3 (2-3 days)
- Testing with various food images
- Performance optimization
- Security review
- Documentation completion

### Phase 4 (2-3 days)
- Deployment to production
- Monitoring setup
- User acceptance testing

## Future Enhancements

### Potential Improvements
- **Database Integration:** Add recipe storage when scaling up
- **User Accounts:** Save generated recipes to user profiles
- **Recipe Customization:** Allow users to modify generated recipes
- **Multi-language Support:** Generate recipes in different languages
- **Nutritional Information:** Add calorie and nutrition data using OpenAI
- **Cooking Tips:** Generate cooking tips and techniques
- **Video Instructions:** Generate cooking videos using AI tools
- **Mobile App:** Native mobile application with camera integration
- **Batch Processing:** Upload multiple images for meal planning

### OpenAI Feature Expansions
- **Dietary Restrictions:** Automatically adapt recipes for dietary needs
- **Cuisine Style Adaptation:** Convert recipes to different cuisine styles
- **Ingredient Substitutions:** Suggest alternatives for missing ingredients
- **Portion Scaling:** Automatically scale recipes for different serving sizes

This simplified technical design provides a streamlined approach focusing on OpenAI's capabilities while maintaining the flexibility to add complexity later as the application grows.
