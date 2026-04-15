export type Screen = 'dashboard' | 'nutrition' | 'evolution' | 'workout' | 'login' | 'onboarding' | 'news' | 'tracking' | 'profile' | 'community' | 'devices' | 'movies';
export type Language = 'es' | 'en';
export type UserRole = 'user' | 'admin' | 'trainer';

export interface Sport {
  id: string;
  name: string;
  icon: string;
  category: string;
  imageUrl?: string;
  subtypes?: string[];
}

export interface SportConfig {
  sport: string;
  goal?: string;
  daysPerWeek?: number;
  durationPerSession?: number;
  experienceLevel?: 'principiante' | 'intermedio' | 'avanzado' | 'elite';
  plan?: TrainingPlan;
  isCombined?: boolean;
  subtype?: string;
}

export interface NutritionPlan {
  id: string;
  name?: string;
  reasoning: string;
  meals: {
    id: string;
    type: string;
    name: string;
    ingredients: string[];
    preparation: string;
    macros: { p: number, c: number, f: number, kcal: number };
    imageUrl?: string;
  }[];
  weeklySchedule?: {
    day: string;
    meals: string[]; // Names or IDs of meals for that day
  }[];
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface DailyProgress {
  date: string;
  completedExercises: string[]; // IDs of exercises completed
  caloriesBurned?: number;
  steps?: number;
  heartRate?: number;
  completed?: boolean;
}

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  role: UserRole;
  age: number;
  gender: 'masculino' | 'femenino' | 'otro';
  weight: number;
  height: number;
  bodyFat?: number;
  experienceLevel: 'sedentario' | 'activo' | 'atleta';
  injuries: string;
  daysPerWeek: number;
  sports: SportConfig[];
  // Nutrition
  nutritionGoal?: string;
  nutritionTimeframe?: string;
  allergies?: string;
  nutritionPlan?: NutritionPlan;
  diets?: NutritionPlan[];
  // Evolution
  weightHistory?: WeightEntry[];
  photos?: GalleryItem[];
  // Tracking
  progress?: Record<string, DailyProgress>; // Key is YYYY-MM-DD
  streak?: number;
  status?: 'online' | 'offline' | 'invisible';
  lastSeen?: string;
  // Plan
  plan?: TrainingPlan;
  // Device Sync
  deviceData?: {
    steps: number;
    calories: number;
    heartRate: number;
    lastSync: string;
    connectedDevices: string[];
  };
}

export interface TrainingPlan {
  id: string;
  createdAt: string;
  reasoning: string;
  table: {
    day: string;
    exercises: {
      id: string;
      name: string;
      sets: string;
      reps: string;
      notes: string;
      completed?: boolean;
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

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: string;
}
