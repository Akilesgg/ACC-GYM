import { useState, useEffect } from 'react';
import { UserProfile, TrainingPlan } from '../types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { generateTrainingPlan } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell, Info, CheckCircle2, Loader2 } from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
}

export default function Dashboard({ profile }: DashboardProps) {
  const [selectedSportIndex, setSelectedSportIndex] = useState(0);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const currentSportConfig = profile.selectedSports[selectedSportIndex];

  useEffect(() => {
    if (currentSportConfig) {
      setLoading(true);
      generateTrainingPlan(profile, currentSportConfig)
        .then(setPlan)
        .finally(() => setLoading(false));
    }
  }, [selectedSportIndex, profile]);

  return (
    <div className="space-y-12 pb-32">
      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <p className="font-headline text-secondary font-bold uppercase tracking-widest text-sm mb-2">
              Tu Laboratorio de Rendimiento
            </p>
            <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-none">
              PLAN <span className="text-primary italic">PERSONAL.</span>
            </h2>
            <p className="text-on-surface-variant font-bold mt-4">
              Objetivo: <span className="text-secondary">{currentSportConfig?.goal}</span>
            </p>
          </div>
          <div className="flex bg-surface p-1 rounded-full overflow-x-auto max-w-full">
            {profile.selectedSports.map((config, idx) => (
              <Button
                key={config.sport}
                variant="ghost"
                onClick={() => setSelectedSportIndex(idx)}
                className={`rounded-full px-6 transition-all whitespace-nowrap ${selectedSportIndex === idx ? 'bg-primary text-background' : 'text-on-surface-variant'}`}
              >
                {config.sport}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-on-surface-variant font-medium">Generando tu plan con IA...</p>
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
                <h3 className="font-headline text-xl font-bold text-secondary uppercase tracking-widest">Razonamiento Científico</h3>
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
              <h3 className="font-headline text-2xl font-black uppercase italic tracking-tighter">Tu Rutina Semanal</h3>
              <div className="grid grid-cols-1 gap-6">
                {plan.table.map((day, idx) => (
                  <Card key={idx} className="bg-surface border-none p-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="font-headline text-xl font-bold text-primary">{day.day}</h4>
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                        {day.exercises.length} Ejercicios
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
                          <Button variant="ghost" size="icon" className="text-on-surface-variant hover:text-primary">
                            <CheckCircle2 size={20} />
                          </Button>
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
