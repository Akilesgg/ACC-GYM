export type Screen = 'dashboard' | 'nutrition' | 'gallery' | 'workout' | 'login' | 'onboarding';
export type Language = 'es' | 'en';

export interface SportConfig {
  sport: string;
  goal?: string;
  daysPerWeek?: number;
  experienceLevel?: 'principiante' | 'intermedio' | 'avanzado' | 'elite';
  plan?: TrainingPlan;
  isCombined?: boolean;
}

export interface NutritionPlan {
  reasoning: string;
  meals: {
    type: string;
    name: string;
    ingredients: string[];
    macros: { p: number, c: number, f: number, kcal: number };
  }[];
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface UserProfile {
  username: string;
  age: number;
  gender: 'masculino' | 'femenino' | 'otro';
  weight: number;
  height: number;
  bodyFat?: number;
  experienceLevel: 'sedentario' | 'activo' | 'atleta';
  injuries: string;
  daysPerWeek: number;
  selectedSports: SportConfig[];
  // Nutrition
  nutritionGoal?: string;
  nutritionTimeframe?: string;
  allergies?: string;
  nutritionPlan?: NutritionPlan;
  // Evolution
  weightHistory?: WeightEntry[];
  photos?: GalleryItem[];
}

export interface TrainingPlan {
  reasoning: string;
  table: {
    day: string;
    exercises: {
      name: string;
      sets: string;
      reps: string;
      notes: string;
    }[];
  }[];
}

export interface Metric {
  label: string;
  value: string | number;
  unit?: string;
  target?: number;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  time: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  imageUrl: string;
}

export interface Exercise {
  id: string;
  name: string;
  target: string;
  sets: Set[];
}

export interface Set {
  id: string;
  previous: string;
  lbs?: number;
  reps?: number;
  completed: boolean;
}

export interface GalleryItem {
  id: string;
  url: string;
  date: string;
  weight: number;
  location: string;
  isPrivate: boolean;
  author?: {
    name: string;
    role: string;
    photoUrl: string;
  };
  likes?: number;
  comments?: number;
  caption?: string;
}
