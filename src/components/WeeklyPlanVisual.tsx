import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfToday, isSameDay, startOfWeek, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, Circle, Trophy, Dumbbell, X, Target, Clock, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TrainingPlan, SportConfig, DailyProgress, Language } from '../types';
import * as Icons from 'lucide-react';
import { ExerciseAnimation } from './ExerciseAnimation';
import { Zap, Layers } from 'lucide-react';

interface WeeklyPlanVisualProps {
  sports: SportConfig[];
  plan?: TrainingPlan; // Global plan fallback
  progress?: Record<string, DailyProgress>;
  onToggleExercise: (exerciseId: string, dateKey: string) => void;
  language: Language;
}

export default function WeeklyPlanVisual({ sports, plan, progress, onToggleExercise, language }: WeeklyPlanVisualProps) {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const today = startOfToday();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const dayNames = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SAB', 'DOM'];

  // Helper to find workout for a specific day
  const getWorkoutForDay = (date: Date) => {
    const dayLabel = format(date, 'EEEE', { locale: es }).toLowerCase();
    const normalizedDay = date.getDay() === 0 ? 7 : date.getDay();
    
    // Combine all plans (global and per-sport)
    const activePlans = sports
      .map(s => s.plan)
      .filter((p): p is TrainingPlan => !!p);
    
    if (plan && !activePlans.find(p => p.id === plan.id)) {
      activePlans.push(plan);
    }

    const workouts = activePlans.flatMap(p => p.table).filter(t => {
      const d = t.day.toLowerCase();
      return d.includes(dayLabel) || 
             d.includes('hoy') || 
             d.includes(`día ${normalizedDay}`) ||
             d.includes(`dia ${normalizedDay}`);
    });

    if (workouts.length === 0) return null;

    // Merge multiple workouts if they occur on the same day
    return {
      exercises: Array.from(new Map(workouts.flatMap(w => w.exercises).map(ex => [ex.id, ex])).values()),
      sportNames: sports.filter(s => s.plan && workouts.some(w => s.plan?.table.includes(w))).map(s => s.sport)
    };
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-7 gap-2 md:gap-4 h-full">
        {weekDays.map((date, idx) => {
          const isToday = isSameDay(date, today);
          const workout = getWorkoutForDay(date);
          const dateKey = format(date, 'yyyy-MM-dd');
          const dayProgress = progress?.[dateKey];
          const completedCount = dayProgress?.completedExercises.length || 0;
          const totalCount = workout?.exercises.length || 0;
          const isFullyCompleted = totalCount > 0 && completedCount === totalCount;
          
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedDay(date)}
              className={`relative flex flex-col bg-[#111318] rounded-2xl border transition-all cursor-pointer overflow-hidden p-2 md:p-4 min-h-[120px] md:min-h-[160px] ${
                isToday 
                  ? 'border-primary ring-1 ring-primary/30 bg-primary/5' 
                  : isFullyCompleted
                    ? 'border-secondary/30 bg-secondary/5'
                    : 'border-white/5 hover:border-white/20'
              }`}
            >
              {/* Header */}
              <div className="flex flex-col items-center mb-3">
                <span className={`text-[10px] font-black tracking-widest ${isToday ? 'text-primary' : 'text-on-surface-variant/40'}`}>
                  {dayNames[idx]}
                </span>
                <span className={`text-lg font-black ${isToday ? 'text-white' : 'text-on-surface-variant/60'}`}>
                  {format(date, 'd')}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                {workout ? (
                  <div className="space-y-2 w-full">
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto ${isToday ? 'bg-primary/20 text-primary' : 'bg-white/5 text-on-surface-variant'}`}>
                      <Dumbbell size={16} />
                    </div>
                    {/* Badge count */}
                    <div className="flex items-center justify-center gap-1">
                       <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/5 text-on-surface-variant border border-white/5">
                        {totalCount} EX
                       </span>
                    </div>
                    {/* First exercise hint */}
                    <p className="text-[9px] font-bold text-on-surface-variant truncate w-full hidden md:block">
                      {workout.exercises[0]?.name.split(' ')[0]}
                    </p>
                  </div>
                ) : (
                  <div className="opacity-10 py-4">
                    <Clock size={20} />
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {totalCount > 0 && (
                <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedCount / totalCount) * 100}%` }}
                    className={`h-full ${isFullyCompleted ? 'bg-secondary' : 'bg-primary'}`}
                  />
                </div>
              )}

              {/* Today indicator */}
              {isToday && (
                <div className="absolute top-1 right-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Detail Drawer Replacement */}
      <AnimatePresence>
        {selectedDay && (
          <div className="fixed inset-0 z-[300] flex items-end justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDay(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-[#0a0a0c] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <Zap size={28} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-headline font-black uppercase italic leading-none">
                        {format(selectedDay, 'EEEE', { locale: es })}
                      </h2>
                      <p className="text-secondary font-black uppercase text-xs tracking-widest mt-1">
                        {format(selectedDay, 'd MMMM, yyyy', { locale: es })}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSelectedDay(null)}
                    className="rounded-full bg-white/5 hover:bg-white/10"
                  >
                    <X size={24} />
                  </Button>
                </div>

                {/* Workout Card */}
                {(() => {
                  const workout = getWorkoutForDay(selectedDay);
                  const dateKey = format(selectedDay, 'yyyy-MM-dd');
                  const dayProgress = progress?.[dateKey];
                  const completed = dayProgress?.completedExercises || [];
                  const isFinished = workout && workout.exercises.length > 0 && workout.exercises.length === completed.length;

                  return workout ? (
                    <div className="space-y-6">
                      {/* Sport Badges */}
                      <div className="flex flex-wrap gap-2">
                        {workout.sportNames.map(name => (
                          <span key={name} className="px-4 py-1.5 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            {name}
                          </span>
                        ))}
                        {isFinished && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-secondary text-background px-4 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                          >
                            <Trophy size={14} /> 🏆 COMPLETADO
                          </motion.div>
                        )}
                      </div>

                      {/* Exercises List */}
                      <div className="space-y-3">
                        {workout.exercises.map((ex, idx) => {
                          const isDone = completed.includes(ex.id);
                          return (
                            <motion.div
                              key={ex.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              onClick={() => onToggleExercise(ex.id, dateKey)}
                              className={`group relative flex flex-col md:flex-row items-center gap-6 p-6 rounded-[2rem] cursor-pointer border-2 transition-all ${
                                isDone 
                                  ? 'bg-secondary/5 border-secondary/20 opacity-80' 
                                  : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-primary/40'
                              }`}
                            >
                              {/* Animation Guide */}
                              <ExerciseAnimation type={ex.name} isDone={isDone} size="sm" />

                              {/* Info */}
                              <div className="flex-1 min-w-0 w-full">
                                <h4 className={`text-xl font-headline font-black uppercase italic truncate transition-all ${isDone ? 'line-through text-on-surface-variant' : 'text-white'}`}>
                                  {ex.name}
                                </h4>
                                <div className="flex items-center gap-4 mt-1">
                                  <div className="flex items-center gap-1.5 text-[10px] font-black text-secondary uppercase tracking-widest">
                                    <Layers size={12} />
                                    <span>{ex.sets} SERIES</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest">
                                    <Zap size={12} />
                                    <span>{ex.reps} REPS</span>
                                  </div>
                                </div>
                                <p className="text-[11px] text-on-surface-variant italic mt-2 opacity-60 group-hover:opacity-100 transition-opacity line-clamp-2">
                                  "{ex.notes}"
                                </p>
                              </div>

                              {/* Checkbox */}
                              <motion.div 
                                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                                  isDone 
                                    ? 'bg-secondary border-secondary text-background shadow-lg shadow-secondary/40' 
                                    : 'border-white/10 group-hover:border-primary/50'
                                }`}
                                animate={isDone ? { scale: [1, 1.2, 1] } : {}}
                              >
                                {isDone ? <CheckCircle2 size={24} strokeWidth={3} /> : <Circle size={24} className="opacity-20" />}
                              </motion.div>

                              {/* Performance Wave Animation */}
                              {isDone && (
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: '100%' }}
                                  className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-secondary"
                                />
                              )}
                            </motion.div>
                          );
                        })}
                      </div>

                      {isFinished && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="py-12 flex flex-col items-center justify-center text-center space-y-4"
                        >
                          <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center text-secondary relative">
                            <Trophy size={48} />
                            <motion.div 
                              animate={{ 
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 0, 0.5]
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute inset-0 rounded-full border-4 border-secondary/30"
                            />
                          </div>
                          <h3 className="text-3xl font-headline font-black uppercase tracking-tighter">¡ENTRENAMIENTO COMPLETADO!</h3>
                          <p className="text-on-surface-variant font-medium">Has cumplido con todos los objetivos de hoy.</p>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                        <Clock size={40} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-headline font-black uppercase italic tracking-tight">DÍA DE RECUPERACIÓN</h3>
                        <p className="font-medium mt-2">No hay ejercicios planificados para hoy. Descansa y recupera.</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
