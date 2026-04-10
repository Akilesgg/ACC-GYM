export type Screen = 'dashboard' | 'nutrition' | 'gallery' | 'workout' | 'login' | 'onboarding';

export interface SportConfig {
  sport: string;
  goal?: string;
  experienceLevel?: 'principiante' | 'intermedio' | 'avanzado' | 'elite';
  plan?: TrainingPlan;
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
