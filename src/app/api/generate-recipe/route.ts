import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Recipe, RecipeRequest } from '@/types/recipe';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const RECIPE_PROMPT = `
Analyze this food image and generate a complete recipe. 
IMPORTANT: Respond ONLY with a valid JSON object. Do not include any markdown formatting, explanations, or other text.

The JSON object must contain exactly these fields:
{
  "title": "Name of the dish",
  "description": "Brief description (1-2 sentences)",
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": "amount",
      "unit": "measurement unit"
    }
  ],
  "instructions": ["step 1", "step 2", "step 3"],
  "cookingTime": 30,
  "servings": 4
}

Make reasonable assumptions about quantities and cooking methods based on what you can see in the image.
Response must be valid JSON only.
`;

function parseRecipeFromResponse(content: string): Recipe {
  // Log the content for debugging
  console.log('Parsing content:', content.substring(0, 200) + '...');
  
  try {
    // Try to parse as JSON first
    const recipe = JSON.parse(content);
    return validateAndFormatRecipe(recipe);
  } catch (jsonError) {
    console.log('JSON parsing failed, trying to extract JSON from text...');
    
    // If JSON parsing fails, try to extract JSON from the response
    try {
      // Look for JSON object in the response (sometimes AI wraps JSON in markdown)
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || 
                       content.match(/(\{[\s\S]*\})/);
      
      if (jsonMatch && jsonMatch[1]) {
        console.log('Found JSON in text, attempting to parse...');
        const recipe = JSON.parse(jsonMatch[1]);
        return validateAndFormatRecipe(recipe);
      }
      
      // Last resort: try to parse the entire content as JSON
      const recipe = JSON.parse(content.trim());
      return validateAndFormatRecipe(recipe);
    } catch (extractError) {
      console.log('All JSON parsing failed, extracting from text manually...');
      // If all JSON parsing fails, create a basic recipe from the text response
      return extractRecipeFromText(content);
    }
  }
}

function extractRecipeFromText(content: string): Recipe {
  // Fallback: Extract recipe information from plain text response
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let title = 'Recipe from Image';
  let description = '';
  const ingredients: { name: string; quantity: string; unit: string }[] = [];
  const instructions: string[] = [];
  
  // Try to extract title (usually the first line or after "Recipe:" or "Title:")
  const titleMatch = content.match(/(?:Recipe|Title|Dish):\s*(.+)/i) || 
                    content.match(/^(.+?)(?:\n|$)/);
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].trim();
  }
  
  // Extract ingredients (look for bullet points, numbers, or "Ingredients:" section)
  const ingredientSection = content.match(/Ingredients?:\s*([\s\S]*?)(?:\n\s*(?:Instructions?|Directions?|Steps?|Method):|$)/i);
  if (ingredientSection) {
    const ingredientLines = ingredientSection[1].split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && (line.match(/^[-•*]\s/) || line.match(/^\d+\.\s/) || line.match(/^[^:]+$/)));
    
    ingredientLines.forEach(line => {
      const cleaned = line.replace(/^[-•*]\s*|\d+\.\s*/, '').trim();
      if (cleaned) {
        // Try to parse quantity and ingredient
        const match = cleaned.match(/^(\d+(?:\/\d+)?)\s*(\w+)?\s*(.+)$/) || 
                     cleaned.match(/^(.+)$/);
        if (match) {
          ingredients.push({
            quantity: match[1] || '1',
            unit: match[2] || '',
            name: match[3] || match[1] || cleaned
          });
        }
      }
    });
  }
  
  // Extract instructions
  const instructionSection = content.match(/(?:Instructions?|Directions?|Steps?|Method):\s*([\s\S]*)/i);
  if (instructionSection) {
    const instructionLines = instructionSection[1].split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    instructionLines.forEach(line => {
      const cleaned = line.replace(/^\d+\.\s*/, '').trim();
      if (cleaned && cleaned.length > 10) { // Filter out very short lines
        instructions.push(cleaned);
      }
    });
  }
  
  // If no structured extraction worked, try to get basic info
  if (ingredients.length === 0 && instructions.length === 0) {
    // Split content into sentences and try to categorize
    const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);
    
    sentences.forEach(sentence => {
      if (sentence.toLowerCase().includes('ingredient') || 
          sentence.match(/\d+\s*(cup|tablespoon|teaspoon|pound|ounce|gram)/i)) {
        ingredients.push({
          quantity: '1',
          unit: '',
          name: sentence
        });
      } else if (sentence.toLowerCase().match(/(heat|cook|bake|mix|stir|add|combine)/i)) {
        instructions.push(sentence);
      }
    });
  }
  
  return {
    title,
    description: description || 'Recipe generated from image analysis',
    ingredients: ingredients.length > 0 ? ingredients : [
      { quantity: '1', unit: '', name: 'Ingredients could not be extracted from the image' }
    ],
    instructions: instructions.length > 0 ? instructions : [
      'Instructions could not be extracted. Please refer to the original AI response or try uploading a clearer image.'
    ],
    cookingTime: undefined,
    servings: undefined,
  };
}

function validateAndFormatRecipe(recipe: unknown): Recipe {
  // Basic validation and formatting
  const recipeObj = recipe as Record<string, unknown>;
  return {
    title: typeof recipeObj.title === 'string' ? recipeObj.title : 'Unknown Dish',
    description: typeof recipeObj.description === 'string' ? recipeObj.description : '',
    ingredients: Array.isArray(recipeObj.ingredients) ? recipeObj.ingredients : [],
    instructions: Array.isArray(recipeObj.instructions) ? recipeObj.instructions : [],
    cookingTime: typeof recipeObj.cookingTime === 'number' ? recipeObj.cookingTime : undefined,
    servings: typeof recipeObj.servings === 'number' ? recipeObj.servings : undefined,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: RecipeRequest = await request.json();
    const { imageBase64 } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: 'Image data required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_openai_api_key_here')) {
      // Return a sample recipe for testing when API key is not configured
      console.log('API key not configured, returning sample recipe for testing');
      const sampleRecipe: Recipe = {
        title: 'Sample Recipe (API Key Required)',
        description: 'This is a sample recipe. Please configure your OpenAI API key in .env.local to generate real recipes from images.',
        ingredients: [
          { name: 'Sample ingredient 1', quantity: '1', unit: 'cup' },
          { name: 'Sample ingredient 2', quantity: '2', unit: 'tablespoons' },
          { name: 'Sample ingredient 3', quantity: '1', unit: 'piece' }
        ],
        instructions: [
          'Configure your OpenAI API key in the .env.local file',
          'Replace "your_openai_api_key_here" with your actual API key',
          'Restart the development server',
          'Upload an image to generate a real recipe'
        ],
        cookingTime: 30,
        servings: 4
      };
      
      return NextResponse.json({ success: true, recipe: sampleRecipe });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Updated to use the latest GPT-4 with vision
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
      max_tokens: 1500,
      temperature: 0.3 // Lower temperature for more consistent JSON output
      // Note: response_format may not be supported with vision models
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    // Log the raw response for debugging
    console.log('OpenAI Raw Response:', content);

    const recipe = parseRecipeFromResponse(content);

    return NextResponse.json({ success: true, recipe });
  } catch (error) {
    console.error('Recipe generation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate recipe. Please try again.' 
      },
      { status: 500 }
    );
  }
}
