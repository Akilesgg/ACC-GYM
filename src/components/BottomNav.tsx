import { Home, Dumbbell, Utensils, Activity, Users, Watch, User, Pill, Shield } from 'lucide-react';
import { Screen, Language, UserProfile } from '../types';
import { cn } from '@/lib/utils';
import { useTranslation } from '../lib/i18n';

interface BottomNavProps {
  activeScreen: Screen;
  onScreenChange: (screen: Screen) => void;
  language: Language;
  profile?: UserProfile | null;
}

export default function BottomNav({ activeScreen, onScreenChange, language, profile }: BottomNavProps) {
  const t = useTranslation(language);
  const navItems = [
    { id: 'dashboard', label: t('inicio'), icon: Home },
    { id: 'workout', label: t('deportes'), icon: Dumbbell },
    { id: 'supplements', label: 'Suplementos', icon: Pill },
    { id: 'evolution', label: t('evolucion'), icon: Activity },
    { id: 'nutrition', label: t('nutricion'), icon: Utensils },
    { id: 'profile', label: t('perfil'), icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-[100] bg-[#111318]/80 backdrop-blur-2xl flex flex-col items-center">
      {profile?.role === 'admin' && (
        <div className="w-full flex justify-center py-2 bg-red-500/10 border-t border-b border-red-500/20">
          <button 
            onClick={() => onScreenChange('admin')}
            className={cn(
              "flex items-center gap-2 px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all",
              activeScreen === 'admin' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-red-400 hover:bg-red-500/10"
            )}
          >
            <Shield size={14} /> Admin Panel
          </button>
        </div>
      )}
      <div className="w-full flex justify-around items-center px-4 pt-3 pb-8 rounded-t-[1.5rem] shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onScreenChange(item.id as Screen)}
              className={cn(
                "flex flex-col items-center justify-center transition-all duration-300 ease-out active:scale-90",
                isActive 
                  ? "text-primary bg-primary/10 rounded-full px-5 py-2" 
                  : "text-on-surface-variant hover:text-secondary"
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="font-headline text-[9px] font-bold uppercase tracking-widest mt-1">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
