export type UnitSystem = 'metric' | 'imperial';

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
  unitSystem?: UnitSystem;
}

export interface RecipeRequest {
  imageBase64: string;
  unitSystem?: UnitSystem;
}

export interface RecipeResponse {
  success: boolean;
  recipe?: Recipe;
  error?: string;
}
