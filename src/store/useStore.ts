import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, Screen, Language } from '../types';
import { User } from '../lib/firebase';

interface AppState {
  user: User | null;
  profile: UserProfile | null;
  activeScreen: Screen;
  onboardingStep: number;
  language: Language;
  loading: boolean;
  
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setActiveScreen: (screen: Screen) => void;
  setOnboardingStep: (step: number | ((prev: number) => number)) => void;
  setLanguage: (lang: Language) => void;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      activeScreen: 'login',
      onboardingStep: 1,
      language: 'es',
      loading: true,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setActiveScreen: (activeScreen) => set({ activeScreen }),
      setOnboardingStep: (onboardingStep) => set((state) => ({ 
        onboardingStep: typeof onboardingStep === 'function' ? onboardingStep(state.onboardingStep) : onboardingStep 
      })),
      setLanguage: (language) => set({ language }),
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'acc-sport-storage',
      partialize: (state) => ({ 
        activeScreen: state.activeScreen, 
        onboardingStep: state.onboardingStep,
        language: state.language,
        profile: state.profile
      }),
    }
  )
);
