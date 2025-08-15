# Food Recipe Generator

A Next.js application that generates recipes from food images using OpenAI's GPT-4 Vision API.

## Features

- **Image Upload**: Drag-and-drop interface for uploading food images
- **AI Recipe Generation**: Uses OpenAI GPT-4 Vision to analyze images and generate complete recipes
- **Recipe Display**: Clean, interactive interface showing ingredients and cooking instructions
- **Recipe Export**: Copy generated recipes to clipboard for external use
- **No Database Required**: Stateless recipe generation for simplified deployment

## Technology Stack

- **Frontend**: React + Next.js 15 + Tailwind CSS
- **Backend**: Next.js API routes
- **AI Integration**: OpenAI GPT-4 Vision API
- **File Handling**: React Dropzone with image compression
- **Styling**: Tailwind CSS with responsive design

## Getting Started

### Prerequisites

- Node.js 18 or later
- An OpenAI API key with access to GPT-4 Vision

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd food_recognizer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   - Edit `.env.local` and add your OpenAI API key:
   ```bash
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Upload an Image**: Drag and drop a food image or click to select a file
2. **Wait for Processing**: The AI will analyze your image and generate a recipe
3. **View Your Recipe**: See the generated recipe with ingredients and instructions
4. **Copy Recipe**: Use the copy button to save the recipe externally
5. **Generate Another**: Upload a new image to generate another recipe

## API Endpoints

### POST `/api/generate-recipe`

Generates a recipe from a base64-encoded image.

**Request Body:**
```json
{
  "imageBase64": "string"
}
```

**Response:**
```json
{
  "success": boolean,
  "recipe": {
    "title": "string",
    "description": "string",
    "ingredients": [
      {
        "name": "string",
        "quantity": "string",
        "unit": "string"
      }
    ],
    "instructions": ["string"],
    "cookingTime": number,
    "servings": number
  },
  "error": "string"
}
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── generate-recipe/
│   │       └── route.ts          # API route for recipe generation
│   ├── globals.css               # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main page component
├── components/
│   ├── ImageUploadComponent.tsx  # File upload interface
│   └── RecipeDisplayComponent.tsx # Recipe display interface
├── types/
│   └── recipe.ts                # TypeScript type definitions
└── utils/
    └── imageUtils.ts            # Image processing utilities

# Configuration files
.env.example                     # Environment variable template
.env.local                       # Your local environment variables (gitignored)
```

## Configuration

### Environment Variables

This project uses environment variables for configuration. A template file `.env.example` is provided with all required variables.

#### Required Variables:
- `OPENAI_API_KEY`: Your OpenAI API key (required for recipe generation)
- `NEXT_PUBLIC_APP_URL`: The base URL of your application (default: http://localhost:3000)

#### Optional Variables:
- `NODE_ENV`: Set to 'development' for additional debugging (default: development)

#### Setup Steps:
1. Copy the example file: `cp .env.example .env.local`
2. Edit `.env.local` with your actual values
3. Restart the development server

### OpenAI API Setup

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Generate an API key
4. Add the key to your `.env.local` file

### Image Processing

- **Supported formats**: JPEG, PNG, WebP
- **File size limit**: 10MB
- **Automatic compression**: Images are compressed to 1024px width for optimal API performance

## Performance Considerations

- **Image Compression**: Images are automatically compressed before sending to the API
- **Error Handling**: Comprehensive error handling for API failures and network issues
- **Loading States**: Visual feedback during recipe generation
- **Cost Optimization**: Single API call per image to minimize OpenAI usage costs

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Add Environment Variables** in Vercel dashboard:
   - `OPENAI_API_KEY`: Your OpenAI API key
4. **Deploy**

### Other Platforms

The application can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- Digital Ocean App Platform
- AWS Amplify

Make sure to set the `OPENAI_API_KEY` environment variable in your deployment platform.

## Security

- **API Key Protection**: OpenAI API key is server-side only
- **File Validation**: Client-side validation for file types and sizes
- **No Data Persistence**: Images and recipes are not stored
- **HTTPS Required**: Use HTTPS in production for secure API communication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Set up your environment:
   ```bash
   cp .env.example .env.local
   # Add your OpenAI API key to .env.local
   ```
4. Make your changes
5. Add tests if applicable
6. Submit a pull request

**Note**: Never commit your `.env.local` file or real API keys to the repository.

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the [Issues](../../issues) page
2. Review the OpenAI API documentation
3. Ensure your API key has proper permissions for GPT-4 Vision

## Future Enhancements

- User accounts and recipe saving
- Nutritional information generation
- Recipe customization (dietary restrictions, serving sizes)
- Multiple language support
- Mobile app version
- Batch recipe generation
