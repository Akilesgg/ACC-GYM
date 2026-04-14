import { useState } from 'react';
import { UserProfile, TrainingPlan, Language } from '../types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell, Info, CheckCircle2, Trash2, Plus, RotateCcw, Activity, ChevronRight, Newspaper, Zap, TrendingUp, Share2, PlayCircle } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

interface DashboardProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onAddSport: () => void;
  onGoToTracking: () => void;
  onGoToProfile: () => void;
  onGoToNews: () => void;
  onGoToMovies: () => void;
  language: Language;
}

export default function Dashboard({ profile, onUpdateProfile, onAddSport, onGoToTracking, onGoToProfile, onGoToNews, onGoToMovies, language }: DashboardProps) {
  const t = useTranslation(language);
  const [selectedSportIndex, setSelectedSportIndex] = useState(0);

  // Use the global plan if available (combined plan), otherwise use the first sport's plan
  const plan = profile.plan || profile.selectedSports[selectedSportIndex]?.plan;
  const currentSportName = profile.plan ? t('planCombinado') : profile.selectedSports[selectedSportIndex]?.sport;

  const resetSports = () => {
    onUpdateProfile({ ...profile, selectedSports: [], plan: undefined });
  };

  return (
    <div className="space-y-12 pb-32">
      {/* Hero Section with Dynamic Image */}
      <section className="relative h-[500px] rounded-[40px] overflow-hidden group mb-12">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 grayscale bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        <div className="absolute bottom-12 left-12 right-12 z-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="font-headline text-secondary font-bold uppercase tracking-[0.4em] text-xs mb-4">
              {t('bienvenidoDashboard')}, {profile.username.split(' ')[0]}
            </p>
            <h2 className="font-headline text-6xl md:text-8xl font-black tracking-tighter leading-[0.8] mb-8">
              {t('forjaDestino').split(' ').slice(0, 2).join(' ')} <br />
              <span className="text-primary italic">{t('forjaDestino').split(' ').slice(2).join(' ')}.</span>
            </h2>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={onAddSport}
                className="bg-primary text-on-primary hover:bg-primary/90 h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-sm italic"
              >
                {t('añadirDeporte')}
              </Button>
              <Button 
                variant="outline"
                onClick={onGoToTracking}
                className="bg-surface/20 backdrop-blur-md border-outline-variant/20 hover:bg-surface/40 h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-sm italic"
              >
                {t('verProgreso')}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Plan and Stats */}
        <div className="lg:col-span-2 space-y-12">
          <section className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <p className="font-headline text-secondary font-bold uppercase tracking-widest text-sm mb-2">
                  {t('tuLaboratorio')}
                </p>
                <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-none">
                  ACC <span className="text-primary italic">SPORT.</span>
                </h2>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetSports}
                  className="rounded-full border-tertiary/30 text-tertiary hover:bg-tertiary/10"
                >
                  <RotateCcw size={16} className="mr-2" /> {t('resetear')}
                </Button>
              </div>
            </div>

            {/* Quick Tracking Link */}
            <Card className="bg-primary/10 border-none p-6 flex items-center justify-between group cursor-pointer hover:bg-primary/20 transition-all" onClick={onGoToTracking}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <Activity className="text-on-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg uppercase tracking-tight">{t('registroHoy')}</h3>
                  <p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest">{t('marcaEjercicios')}</p>
                </div>
              </div>
              <ChevronRight className="text-primary group-hover:translate-x-1 transition-transform" />
            </Card>

            {/* Plan Display */}
            {plan ? (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline text-2xl font-black uppercase tracking-tight">
                    {language === 'es' ? 'Tu Plan de' : 'Your Plan for'} <span className="text-primary">{currentSportName}</span>
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onGoToProfile}
                    className="text-[10px] font-black uppercase tracking-widest text-secondary"
                  >
                    {t('cambiarDeporte')}
                  </Button>
                </div>

                {/* Reasoning Card */}
                <Card className="bg-surface border-l-4 border-secondary p-8 relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-4">
                    <Info className="text-secondary" />
                    <h3 className="font-headline text-xl font-bold text-secondary uppercase tracking-widest">{t('razonamiento')}</h3>
                  </div>
                  <p className="text-on-surface leading-relaxed text-lg italic">
                    "{plan.reasoning}"
                  </p>
                  <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
                    <Dumbbell size={200} />
                  </div>
                </Card>

                {/* Training Table */}
                <div className="grid grid-cols-1 gap-6">
                  {plan.table.map((day, idx) => (
                    <Card key={idx} className="bg-surface border-none p-6 overflow-hidden">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="font-headline text-xl font-bold text-primary">{day.day}</h4>
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                          {day.exercises.length} {t('ejercicios')}
                        </span>
                      </div>
                      <div className="space-y-4">
                        {day.exercises.map((ex, exIdx) => (
                          <div key={exIdx} className="flex items-center gap-4 p-4 bg-background rounded-xl group hover:bg-surface-variant transition-all">
                            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-secondary font-bold">
                              {exIdx + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-on-surface">{ex.name}</p>
                              <p className="text-xs text-on-surface-variant">{ex.sets} x {ex.reps}</p>
                            </div>
                            <div className="text-right hidden md:block">
                              <p className="text-[10px] text-on-surface-variant italic">{ex.notes}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-surface/30 rounded-[40px] border border-dashed border-outline-variant/20">
                <Dumbbell size={64} className="mx-auto mb-6 opacity-10" />
                <p className="font-headline text-xl font-bold uppercase tracking-widest opacity-40 mb-8">{t('noDeportes')}</p>
                <Button onClick={onAddSport} className="bg-primary text-background font-black uppercase tracking-widest px-12 h-16 rounded-2xl text-lg italic">
                  {t('añadirDeporte')}
                </Button>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: News Previews */}
        <div className="space-y-8">
          {/* News Preview */}
          <Card className="bg-surface border-none p-8 space-y-6 group cursor-pointer hover:ring-2 ring-secondary transition-all" onClick={onGoToNews}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                  <Newspaper size={20} />
                </div>
                <h3 className="font-headline font-bold uppercase tracking-widest text-sm">{t('noticias')}</h3>
              </div>
              <ChevronRight size={16} className="text-on-surface-variant group-hover:translate-x-1 transition-transform" />
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-lg bg-background overflow-hidden shrink-0 grayscale">
                  <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-secondary uppercase">TECNOLOGÍA</p>
                  <p className="text-xs font-bold leading-tight line-clamp-2">Nueva tecnología de recuperación muscular...</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Movies Preview */}
          <Card className="bg-surface border-none p-8 space-y-6 group cursor-pointer hover:ring-2 ring-tertiary transition-all" onClick={onGoToMovies}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-tertiary/10 rounded-xl flex items-center justify-center text-tertiary">
                  <PlayCircle size={20} />
                </div>
                <h3 className="font-headline font-bold uppercase tracking-widest text-sm">ACC PELÍCULAS</h3>
              </div>
              <ChevronRight size={16} className="text-on-surface-variant group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden grayscale group-hover:grayscale-0 transition-all">
              <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center">
                <PlayCircle size={40} className="text-white drop-shadow-2xl" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
