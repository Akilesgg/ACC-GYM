import { Home, Dumbbell, Utensils, Image, Activity } from 'lucide-react';
import { Screen, Language } from '../types';
import { cn } from '@/lib/utils';
import { useTranslation } from '../lib/i18n';

interface BottomNavProps {
  activeScreen: Screen;
  onScreenChange: (screen: Screen) => void;
  language: Language;
}

export default function BottomNav({ activeScreen, onScreenChange, language }: BottomNavProps) {
  const t = useTranslation(language);
  const navItems = [
    { id: 'dashboard', label: t('inicio'), icon: Home },
    { id: 'workout', label: t('deportes'), icon: Dumbbell },
    { id: 'tracking', label: 'Tracking', icon: Activity },
    { id: 'nutrition', label: t('nutricion'), icon: Utensils },
    { id: 'gallery', label: t('evolucion'), icon: Image },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-[#111318]/80 backdrop-blur-2xl flex justify-around items-center px-4 pt-3 pb-8 rounded-t-[1.5rem] shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeScreen === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onScreenChange(item.id)}
            className={cn(
              "flex flex-col items-center justify-center transition-all duration-300 ease-out active:scale-90",
              isActive 
                ? "text-primary bg-primary/10 rounded-full px-5 py-2" 
                : "text-on-surface-variant hover:text-secondary"
            )}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="font-headline text-[10px] font-bold uppercase tracking-widest mt-1">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
