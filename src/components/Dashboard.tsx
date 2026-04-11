import { useState } from 'react';
import { UserProfile, TrainingPlan, Language } from '../types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell, Info, CheckCircle2, Trash2, Plus, RotateCcw, Activity, ChevronRight } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

interface DashboardProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onAddSport: () => void;
  onGoToTracking: () => void;
  language: Language;
}

export default function Dashboard({ profile, onUpdateProfile, onAddSport, onGoToTracking, language }: DashboardProps) {
  const t = useTranslation(language);
  const [selectedSportIndex, setSelectedSportIndex] = useState(0);

  const currentSportConfig = profile.selectedSports[selectedSportIndex];
  const plan = currentSportConfig?.plan;

  const removeSport = (index: number) => {
    const updatedSports = profile.selectedSports.filter((_, i) => i !== index);
    onUpdateProfile({ ...profile, selectedSports: updatedSports });
    if (selectedSportIndex >= updatedSports.length) {
      setSelectedSportIndex(Math.max(0, updatedSports.length - 1));
    }
  };

  const resetSports = () => {
    onUpdateProfile({ ...profile, selectedSports: [] });
  };

  return (
    <div className="space-y-12 pb-32">
      {/* Hero Section with Dynamic Image */}
      <section className="relative h-[400px] rounded-[40px] overflow-hidden group mb-12">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 grayscale bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        <div className="absolute bottom-12 left-12 right-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="font-headline text-secondary font-bold uppercase tracking-[0.4em] text-xs mb-4">
              {t('bienvenido').toUpperCase()}, {profile.username.split(' ')[0]}
            </p>
            <h2 className="font-headline text-6xl md:text-8xl font-black tracking-tighter leading-[0.8] mb-8">
              FORJA TU <br />
              <span className="text-primary italic">DESTINO.</span>
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

      <section className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <p className="font-headline text-secondary font-bold uppercase tracking-widest text-sm mb-2">
              {t('tuLaboratorio')}
            </p>
            <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-none">
              ACF <span className="text-primary italic">SPORT.</span>
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
              <h3 className="font-headline font-bold text-lg uppercase tracking-tight">Registro de Hoy</h3>
              <p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest">Marca tus ejercicios completados</p>
            </div>
          </div>
          <ChevronRight className="text-primary group-hover:translate-x-1 transition-transform" />
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-xl font-black uppercase tracking-tight">{t('tusDeportes')}</h3>
            <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">
              {profile.selectedSports.length} {t('activos')}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {profile.selectedSports.map((config, idx) => (
              <div key={config.sport} className="group relative">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedSportIndex(idx)}
                  className={`rounded-full px-6 h-12 transition-all whitespace-nowrap pr-12 ${selectedSportIndex === idx ? 'bg-primary text-background' : 'bg-surface text-on-surface-variant'}`}
                >
                  {config.sport}
                </Button>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeSport(idx); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant/40 hover:text-tertiary transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <Button 
              variant="outline" 
              className="rounded-full w-12 h-12 p-0 border-dashed border-primary/30 text-primary hover:bg-primary/10 shrink-0"
              onClick={onAddSport}
            >
              <Plus size={20} />
            </Button>
          </div>
        </div>
      </section>

      <AnimatePresence mode="wait">
        {profile.selectedSports.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="py-20 text-center space-y-4"
          >
            <Dumbbell size={48} className="mx-auto text-outline-variant opacity-20" />
            <p className="text-on-surface-variant font-medium">No tienes deportes seleccionados.<br/>Añade uno para ver tu plan.</p>
          </motion.div>
        ) : plan ? (
          <motion.div
            key={currentSportConfig?.sport || 'plan'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
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
            <section className="space-y-6">
              <h3 className="font-headline text-2xl font-black uppercase italic tracking-tighter">{t('rutinaSemanal')}</h3>
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
            </section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
