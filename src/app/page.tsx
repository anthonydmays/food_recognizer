'use client';

import React, { useState, useEffect } from 'react';
import ImageUploadComponent from '@/components/ImageUploadComponent';
import RecipeDisplayComponent from '@/components/RecipeDisplayComponent';
import { Recipe, RecipeResponse, UnitSystem } from '@/types/recipe';
import { detectUserUnitSystem } from '@/utils/unitUtils';

export default function Home() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial');

  // Detect user's preferred unit system on mount
  useEffect(() => {
    setUnitSystem(detectUserUnitSystem());
  }, []);

  const handleImageUpload = async (base64: string) => {
    setIsGenerating(true);
    setError(null);
    setRecipe(null);

    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imageBase64: base64,
          unitSystem: unitSystem
        }),
      });

      const result: RecipeResponse = await response.json();

      if (result.success && result.recipe) {
        setRecipe(result.recipe);
      } else {
        setError(result.error || 'Failed to generate recipe');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Recipe generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewRecipe = () => {
    setRecipe(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Food Recipe Generator</h1>
            <p className="text-gray-600 mt-2">
              Upload a photo of food and get an instant recipe with ingredients and instructions
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {!recipe ? (
          <div className="space-y-8">
            {/* Upload Section */}
            <section>
              <ImageUploadComponent 
                onImageUpload={handleImageUpload}
                isUploading={isGenerating}
                unitSystem={unitSystem}
                onUnitSystemChange={setUnitSystem}
              />
            </section>

            {/* Error Display */}
            {error && (
              <div className="max-w-md mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* How it works */}
            <section className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">How it works</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">1</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Upload your food image</h3>
                      <p className="text-sm text-gray-600">Take a photo or upload an image of any dish and choose your preferred units</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">2</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">AI analyzes the image</h3>
                      <p className="text-sm text-gray-600">Our AI identifies the dish and its components</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">3</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Get your recipe</h3>
                      <p className="text-sm text-gray-600">Receive complete ingredients list and cooking instructions in your preferred units</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Recipe Display */}
            <RecipeDisplayComponent recipe={recipe} />
            
            {/* Try Another Button */}
            <div className="text-center">
              <button
                onClick={handleNewRecipe}
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Generate Another Recipe
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500">
            Powered by OpenAI GPT-4 Vision • Upload food images to generate recipes instantly
          </p>
        </div>
      </footer>
    </div>
  );
}
