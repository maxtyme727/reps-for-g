
export interface Ingredient {
  name: string;
  amount: string;
  notes?: string;
}

export interface Step {
  order: number;
  description: string;
}

export type ImageSize = '1K' | '2K' | '4K';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: string;
  servings: string;
  rating: string;
  reviewCount: string;
  thumbnailUrl: string;
  videoUrl: string;
  ingredients: Ingredient[];
  steps: Step[];
  timestamp: number;
  aiGeneratedImage?: string;
}

export type AppScreen = 'home' | 'import' | 'recipe-detail' | 'settings';
