import { create } from 'zustand';
import { UserProfile, Screen, Language } from '../types';
import { User } from '../lib/firebase';

interface AppState {
  user: User | null;
  profile: UserProfile | null;
  activeScreen: Screen;
  language: Language;
  loading: boolean;
  
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setActiveScreen: (screen: Screen) => void;
  setLanguage: (lang: Language) => void;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  profile: null,
  activeScreen: 'login',
  language: 'es',
  loading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setActiveScreen: (activeScreen) => set({ activeScreen }),
  setLanguage: (language) => set({ language }),
  setLoading: (loading) => set({ loading }),
}));
