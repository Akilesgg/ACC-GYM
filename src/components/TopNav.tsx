import { Bell, Globe } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Language } from '../types';
import { Button } from '@/components/ui/button';

interface TopNavProps {
  userPhoto?: string;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function TopNav({ userPhoto, language, onLanguageChange }: TopNavProps) {
  return (
    <header className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl flex justify-between items-center px-6 py-4 border-b border-outline-variant/10">
      <div className="flex items-center gap-4">
        <Avatar className="w-10 h-10 border-2 border-primary">
          <AvatarImage src={userPhoto || "https://picsum.photos/seed/athlete/200/200"} />
          <AvatarFallback>AS</AvatarFallback>
        </Avatar>
        <div className="flex flex-col -gap-1">
          <h1 className="text-xl font-black italic text-primary tracking-tighter leading-none">
            ACF SPORT
          </h1>
          <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Elite Performance</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onLanguageChange(language === 'es' ? 'en' : 'es')}
          className="rounded-full h-8 px-3 text-[10px] font-bold flex items-center gap-2 bg-surface-variant/30 hover:bg-surface-variant/50"
        >
          <Globe size={14} />
          {language === 'es' ? 'ES' : 'EN'}
        </Button>
        <button className="text-primary hover:opacity-80 transition-opacity active:scale-95 duration-200 p-2">
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
}
