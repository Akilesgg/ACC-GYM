import { UserProfile, Language } from '../types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { User, Mail, Shield, Scale, Ruler, Calendar, ArrowLeft, LogOut, Watch } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { logout } from '../services/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useStore } from '../store/useStore';

interface ProfileProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onBack: () => void;
  language: Language;
}

export default function Profile({ profile, onBack, language }: ProfileProps) {
  const t = useTranslation(language);
  const { setActiveScreen } = useStore();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="space-y-12 pb-32">
      <section>
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full bg-surface">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <p className="font-headline text-secondary font-bold uppercase tracking-widest text-sm mb-1">
              {t('tuLaboratorio')}
            </p>
            <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-none">
              MI <span className="text-primary italic">{t('perfil').toUpperCase()}.</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <Card className="md:col-span-2 bg-surface border-none p-8 space-y-8">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24 border-4 border-primary">
                <AvatarImage src={profile.photos?.[0]?.url || "https://picsum.photos/seed/athlete/200/200"} />
                <AvatarFallback className="text-3xl font-black">AS</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-3xl font-headline font-black uppercase tracking-tight">{profile.username}</h3>
                <p className="text-on-surface-variant flex items-center gap-2">
                  <Mail size={14} /> {profile.email}
                </p>
                <div className="flex gap-2 mt-3">
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    {profile.role}
                  </span>
                  <span className="bg-secondary/10 text-secondary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    {profile.experienceLevel}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-outline-variant/10">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest flex items-center gap-1">
                  <Scale size={10} /> {t('peso')}
                </p>
                <p className="text-2xl font-headline font-black">{profile.weight} kg</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest flex items-center gap-1">
                  <Ruler size={10} /> {t('altura')}
                </p>
                <p className="text-2xl font-headline font-black">{profile.height} cm</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest flex items-center gap-1">
                  <Calendar size={10} /> {t('edad')}
                </p>
                <p className="text-2xl font-headline font-black">{profile.age}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest flex items-center gap-1">
                  <Shield size={10} /> {t('lesiones')}
                </p>
                <p className="text-sm font-bold truncate">{profile.injuries || (language === 'es' ? 'Ninguna' : 'None')}</p>
              </div>
            </div>
          </Card>

          {/* Stats/Actions */}
          <div className="space-y-6">
            <Card className="bg-primary p-8 text-on-primary">
              <h4 className="font-headline font-black text-xl uppercase tracking-tight mb-2">{language === 'es' ? 'Racha Actual' : 'Current Streak'}</h4>
              <p className="text-6xl font-headline font-black italic">{profile.streak || 0}</p>
              <p className="text-xs font-bold uppercase tracking-widest mt-2 opacity-80">{language === 'es' ? 'Días consecutivos' : 'Consecutive days'}</p>
            </Card>

            <Button 
              className="w-full h-16 rounded-2xl bg-secondary text-background font-bold uppercase tracking-widest shadow-lg shadow-secondary/20 hover:scale-105 transition-transform"
              onClick={() => setActiveScreen('devices')}
            >
              <Watch className="mr-2" size={20} /> {t('dispositivos')}
            </Button>

            <Button 
              variant="outline" 
              className="w-full h-16 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/10 font-bold uppercase tracking-widest"
              onClick={handleLogout}
            >
              <LogOut className="mr-2" size={20} /> {t('cerrarSesion')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
