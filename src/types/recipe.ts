export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

export interface Recipe {
  title: string;
  description?: string;
  ingredients: Ingredient[];
  instructions: string[];
  cookingTime?: number;
  servings?: number;
}

export interface RecipeRequest {
  imageBase64: string;
}

export interface RecipeResponse {
  success: boolean;
  recipe?: Recipe;
  error?: string;
}
