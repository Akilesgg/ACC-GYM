import { useState } from 'react';
import { UserProfile, DailyProgress, TrainingPlan, Language } from '../types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Calendar as CalendarIcon, Trophy, Flame, TrendingUp, ArrowLeft } from 'lucide-react';
import { format, startOfToday, isSameDay, parseISO } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useTranslation } from '../lib/i18n';

interface TrackingProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onBack?: () => void;
  language: Language;
}

export default function Tracking({ profile, onUpdateProfile, onBack, language }: TrackingProps) {
  const t = useTranslation(language);
  const today = startOfToday();
  const dateKey = format(today, 'yyyy-MM-dd');
  const locale = language === 'es' ? es : enUS;

  const currentProgress = profile.progress?.[dateKey] || {
    date: dateKey,
    completedExercises: [],
  };

  const toggleExercise = (exerciseId: string) => {
    const completed = currentProgress.completedExercises.includes(exerciseId);
    const newCompleted = completed
      ? currentProgress.completedExercises.filter(id => id !== exerciseId)
      : [...currentProgress.completedExercises, exerciseId];

    const updatedProgress = {
      ...profile.progress,
      [dateKey]: {
        ...currentProgress,
        completedExercises: newCompleted,
      },
    };

    onUpdateProfile({ ...profile, progress: updatedProgress });
  };

  const [view, setView] = useState<'daily' | 'weekly'>('daily');

  const activePlans = profile.sports
    .map(s => s.plan)
    .filter((p): p is TrainingPlan => !!p);

  const todayName = format(today, 'EEEE', { locale }).toLowerCase();
  
  // Find exercises for today (simple matching for now)
  const todaysExercises = activePlans.flatMap(plan => 
    plan.table.find(day => day.day.toLowerCase().includes(todayName) || day.day.toLowerCase().includes('hoy'))?.exercises || []
  );

  const completionRate = todaysExercises.length > 0 
    ? Math.round((currentProgress.completedExercises.length / todaysExercises.length) * 100)
    : 0;

  return (
    <div className="space-y-12 pb-32">
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full bg-surface">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <p className="font-headline text-secondary font-bold uppercase tracking-widest text-sm mb-1">
                {t('registroRendimiento')}
              </p>
              <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-none">
                {t('tracking').toUpperCase()} <span className="text-primary italic">{t('trackingDiario').split(' ')[1].toUpperCase()}.</span>
              </h2>
            </div>
          </div>
          <div className="flex gap-2 bg-surface p-1 rounded-full border border-outline-variant/10">
            <Button 
              variant={view === 'daily' ? 'default' : 'ghost'} 
              onClick={() => setView('daily')}
              className="rounded-full px-6 font-bold uppercase text-xs"
            >
              {t('hoy')}
            </Button>
            <Button 
              variant={view === 'weekly' ? 'default' : 'ghost'} 
              onClick={() => setView('weekly')}
              className="rounded-full px-6 font-bold uppercase text-xs"
            >
              {t('semana')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-surface border-none p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Flame className="text-primary" size={24} />
            </div>
            <span className="text-4xl font-black text-on-surface">{profile.streak || 0}</span>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">{t('streak')}</span>
          </Card>
          <Card className="bg-surface border-none p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
              <Trophy className="text-secondary" size={24} />
            </div>
            <span className="text-4xl font-black text-on-surface">{completionRate}%</span>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">{t('completadoHoy')}</span>
          </Card>
          <Card className="bg-surface border-none p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-tertiary/10 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="text-tertiary" size={24} />
            </div>
            <span className="text-4xl font-black text-on-surface">{todaysExercises.length}</span>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">{t('ejerciciosHoy')}</span>
          </Card>
        </div>
      </section>

      <AnimatePresence mode="wait">
        {view === 'daily' ? (
          <motion.section 
            key="daily"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-2xl font-black uppercase italic tracking-tight">{t('rutinaHoy')}</h3>
              <p className="text-on-surface-variant font-medium">{format(today, 'PPP', { locale })}</p>
            </div>

            <div className="space-y-4">
              {todaysExercises.length > 0 ? (
                todaysExercises.map((ex, idx) => {
                  const isCompleted = currentProgress.completedExercises.includes(ex.id);
                  return (
                    <Card 
                      key={idx} 
                      onClick={() => toggleExercise(ex.id)}
                      className={`p-6 border-none cursor-pointer transition-all ${isCompleted ? 'bg-primary/10 opacity-60' : 'bg-surface hover:bg-surface-variant/50'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isCompleted ? 'bg-primary text-on-primary' : 'bg-background text-outline-variant'}`}>
                          {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-bold text-lg ${isCompleted ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>{ex.name}</h4>
                          <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">{ex.sets} x {ex.reps}</p>
                        </div>
                        <div className="text-right hidden md:block">
                          <p className="text-[10px] text-on-surface-variant italic max-w-[200px]">{ex.notes}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <Card className="p-12 text-center bg-surface border-none">
                  <p className="text-on-surface-variant italic">{t('noEjerciciosHoy')}</p>
                  <Button variant="link" className="mt-4 text-primary font-bold uppercase tracking-widest text-xs" onClick={() => setView('weekly')}>{t('verTodosPlanes')}</Button>
                </Card>
              )}
            </div>
          </motion.section>
        ) : (
          <motion.section 
            key="weekly"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {activePlans.map((plan, pIdx) => (
              <div key={pIdx} className="space-y-6">
                <h3 className="font-headline text-2xl font-black uppercase italic tracking-tight text-primary">{t('plan')}: {profile.sports[pIdx]?.sport}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {plan.table.map((day, dIdx) => (
                    <Card key={dIdx} className="bg-surface border-none p-6 space-y-4">
                      <h4 className="font-bold text-lg border-b border-outline-variant/10 pb-2">{day.day}</h4>
                      <div className="space-y-2">
                        {day.exercises.map((ex, eIdx) => (
                          <div key={eIdx} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                            <p className="text-xs font-medium truncate">{ex.name}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Progress Calendar Placeholder */}
      <section className="space-y-6">
        <h3 className="font-headline text-2xl font-black uppercase italic tracking-tight">{t('calendarioProgreso')}</h3>
        <Card className="bg-surface border-none p-8">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 31 }).map((_, i) => {
              const day = i + 1;
              const hasProgress = Math.random() > 0.5; // Placeholder logic
              return (
                <div 
                  key={i} 
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold ${hasProgress ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-background text-on-surface-variant opacity-30'}`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </Card>
      </section>
    </div>
  );
}
