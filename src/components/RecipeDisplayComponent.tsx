'use client';

import React, { useState } from 'react';
import { Recipe } from '@/types/recipe';

interface RecipeDisplayComponentProps {
  recipe: Recipe;
  onCopyRecipe?: () => void;
}

export default function RecipeDisplayComponent({ 
  recipe, 
  onCopyRecipe 
}: RecipeDisplayComponentProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [checkedInstructions, setCheckedInstructions] = useState<Set<number>>(new Set());
  const [copySuccess, setCopySuccess] = useState(false);

  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };

  const toggleInstruction = (index: number) => {
    const newChecked = new Set(checkedInstructions);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedInstructions(newChecked);
  };

  const formatRecipeText = () => {
    let text = `${recipe.title}\n\n`;
    
    if (recipe.description) {
      text += `${recipe.description}\n\n`;
    }

    if (recipe.servings || recipe.cookingTime) {
      text += 'DETAILS:\n';
      if (recipe.servings) text += `Servings: ${recipe.servings}\n`;
      if (recipe.cookingTime) text += `Cooking Time: ${recipe.cookingTime} minutes\n`;
      text += '\n';
    }

    text += 'INGREDIENTS:\n';
    recipe.ingredients.forEach(ingredient => {
      text += `• ${ingredient.quantity} ${ingredient.unit} ${ingredient.name}\n`;
    });

    text += '\nINSTRUCTIONS:\n';
    recipe.instructions.forEach((instruction, index) => {
      text += `${index + 1}. ${instruction}\n`;
    });

    return text;
  };

  const copyToClipboard = async () => {
    try {
      const recipeText = formatRecipeText();
      await navigator.clipboard.writeText(recipeText);
      setCopySuccess(true);
      onCopyRecipe?.();
      
      // Reset success message after 2 seconds
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy recipe:', err);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
        {recipe.description && (
          <p className="text-gray-600 text-sm leading-relaxed">{recipe.description}</p>
        )}
        
        {/* Recipe details */}
        {(recipe.servings || recipe.cookingTime || recipe.unitSystem) && (
          <div className="flex gap-4 mt-3 text-sm text-gray-500 flex-wrap">
            {recipe.servings && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{recipe.servings} servings</span>
              </div>
            )}
            {recipe.cookingTime && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{recipe.cookingTime} minutes</span>
              </div>
            )}
            {recipe.unitSystem && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l-3-3m3 3l3-3" />
                </svg>
                <span>{recipe.unitSystem === 'metric' ? 'Metric units' : 'Imperial units'}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ingredients */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Ingredients</h2>
        <div className="space-y-2">
          {recipe.ingredients.map((ingredient, index) => (
            <label key={index} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checkedIngredients.has(index)}
                onChange={() => toggleIngredient(index)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className={`text-sm ${
                checkedIngredients.has(index) 
                  ? 'line-through text-gray-400' 
                  : 'text-gray-700 group-hover:text-gray-900'
              }`}>
                {ingredient.quantity} {ingredient.unit} {ingredient.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h2>
        <div className="space-y-3">
          {recipe.instructions.map((instruction, index) => (
            <label key={index} className="flex gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checkedInstructions.has(index)}
                onChange={() => toggleInstruction(index)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mt-0.5 flex-shrink-0"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-blue-600 mr-2">
                  Step {index + 1}
                </span>
                <span className={`text-sm leading-relaxed ${
                  checkedInstructions.has(index)
                    ? 'line-through text-gray-400'
                    : 'text-gray-700 group-hover:text-gray-900'
                }`}>
                  {instruction}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Copy Button */}
      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={copyToClipboard}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            copySuccess
              ? 'bg-green-500 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {copySuccess ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Recipe Copied!
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Recipe
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
