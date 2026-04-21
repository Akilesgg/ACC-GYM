import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfToday, isSameDay, startOfWeek, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  CheckCircle2, Circle, Trophy, Dumbbell, X, Zap, Target, 
  Clock, Calendar, ClipboardList, MapPin, Save, Info, ChevronRight, 
  Trash2, Plus, LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TrainingPlan, SportConfig, DailyProgress, Language, UserProfile } from '../types';
import * as Icons from 'lucide-react';
import { useTranslation } from '../lib/i18n';

interface WorkoutPlanViewProps {
  sport: SportConfig;
  allSports: SportConfig[];
  profile: UserProfile;
  progress: Record<string, DailyProgress>;
  onToggleExercise: (exerciseId: string, dateKey: string) => void;
  onUpdateProfile: (profile: UserProfile) => void;
  onClose: () => void;
  language: Language;
}

export default function WorkoutPlanView({ 
  sport, 
  allSports, 
  profile,
  progress, 
  onToggleExercise, 
  onUpdateProfile,
  onClose, 
  language 
}: WorkoutPlanViewProps) {
  const t = useTranslation(language);
  const [activeTab, setActiveTab] = useState<'week' | 'today' | 'schedule'>('week');
  const [selectedDayDetail, setSelectedDayDetail] = useState<Date | null>(null);
  const today = startOfToday();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const dayNames = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SAB', 'DOM'];

  // Schedule State Local
  const [localSchedule, setLocalSchedule] = useState(sport.schedule || {});

  const getWorkoutForDay = (date: Date) => {
    const dayLabel = format(date, 'EEEE', { locale: es }).toLowerCase();
    const dNum = date.getDay() === 0 ? 7 : date.getDay();
    
    const workouts = (sport.plan?.table || []).filter(t => {
      const d = t.day.toLowerCase();
      return d.includes(dayLabel) || d.includes('hoy') || d.includes(`día ${dNum}`) || d.includes(`dia ${dNum}`);
    });

    return workouts.length > 0 ? workouts[0].exercises : [];
  };

  const handleSaveSchedule = () => {
    const updatedSports = profile.sports.map(s => 
      s.sport === sport.sport ? { ...s, schedule: localSchedule } : s
    );
    onUpdateProfile({ ...profile, sports: updatedSports });
  };

  const updateScheduleItem = (day: string, field: string, value: string) => {
    setLocalSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-6 md:p-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-[#0a0a0c]/80 backdrop-blur-xl z-50 py-4 -mx-6 px-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Dumbbell size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-headline font-black uppercase italic leading-none">{sport.sport}</h2>
            <p className="text-secondary font-black uppercase text-[10px] tracking-widest mt-1">Plan de Entrenamiento</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-white/5 lg:w-12 lg:h-12">
          <X size={24} />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/5 max-w-md mx-auto">
        {(['week', 'today', 'schedule'] as const).map(tab => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'ghost'}
            onClick={() => setActiveTab(tab)}
            className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest h-10 px-0"
          >
            {tab === 'week' ? 'Semana' : tab === 'today' ? 'Hoy' : 'Horario'}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'week' && (
          <motion.div
            key="week"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4"
          >
            {weekDays.map((date, i) => {
              const exercises = getWorkoutForDay(date);
              const isToday = isSameDay(date, today);
              const dateKey = format(date, 'yyyy-MM-dd');
              const dayProgress = progress[dateKey];
              const completedCount = dayProgress?.completedExercises.length || 0;
              const totalCount = exercises.length;
              const ratio = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

              return (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedDayDetail(date)}
                  className={`relative flex flex-col p-6 rounded-[2rem] border cursor-pointer transition-all min-h-[180px] ${
                    isToday ? 'bg-primary/5 border-primary shadow-lg shadow-primary/10' : 'bg-[#111318] border-white/5 hover:border-white/10'
                  }`}
                >
                  <label className={`text-[10px] font-black tracking-widest ${isToday ? 'text-primary' : 'text-white/40'}`}>
                    {dayNames[i]}
                  </label>
                  <span className="text-3xl font-headline font-black mt-1 leading-none">{format(date, 'd')}</span>
                  
                  <div className="flex-1 flex flex-col items-center justify-center py-4">
                    {totalCount > 0 ? (
                      <div className="space-y-3 w-full text-center">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto ${isToday ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/40'}`}>
                          <Dumbbell size={20} />
                        </div>
                        <span className="text-[10px] font-black bg-white/5 px-3 py-1 rounded-full">{totalCount} EJERCICIOS</span>
                      </div>
                    ) : (
                      <div className="opacity-10">
                        <Clock size={24} />
                      </div>
                    )}
                  </div>

                  {totalCount > 0 && (
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-2">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${ratio}%` }}
                        className={`h-full ${ratio === 100 ? 'bg-secondary' : 'bg-primary'}`}
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {activeTab === 'today' && (
          <motion.div
            key="today"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl mx-auto w-full"
          >
            <ExerciseList 
              date={today} 
              exercises={getWorkoutForDay(today)} 
              progress={progress} 
              onToggle={onToggleExercise}
              language={language}
            />
          </motion.div>
        )}

        {activeTab === 'schedule' && (
          <motion.div
            key="schedule"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-headline font-black uppercase italic tracking-tight">Horario Semanal</h3>
              <Button onClick={handleSaveSchedule} className="bg-secondary text-background hover:bg-secondary/90 font-black uppercase tracking-widest px-8 rounded-xl h-12 shadow-xl shadow-secondary/20">
                <Save size={18} className="mr-2" /> Guardar Horario
              </Button>
            </div>

            <Card className="bg-[#111318] border-none overflow-hidden rounded-[2.5rem]">
              <div className="divide-y divide-white/5">
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => (
                  <div key={day} className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center hover:bg-white/[0.02] transition-colors">
                    <span className="font-headline font-bold text-lg uppercase">{day}</span>
                    <div className="relative group">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-40 group-hover:opacity-100 transition-opacity" size={16} />
                      <Input 
                        placeholder="HH:MM" 
                        value={localSchedule[day]?.time || ''} 
                        onChange={(e) => updateScheduleItem(day, 'time', e.target.value)}
                        className="bg-background/50 border-white/5 pl-10 h-12 rounded-xl font-bold font-mono"
                      />
                    </div>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary opacity-40 group-hover:opacity-100 transition-opacity" size={16} />
                      <Input 
                        placeholder="Ubicación" 
                        value={localSchedule[day]?.location || ''} 
                        onChange={(e) => updateScheduleItem(day, 'location', e.target.value)}
                        className="bg-background/50 border-white/5 pl-10 h-12 rounded-xl font-bold"
                      />
                    </div>
                    <div className="relative group">
                      <Info className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-white/40 transition-colors" size={16} />
                      <Input 
                        placeholder="Notas/Profesor" 
                        value={localSchedule[day]?.notes || ''} 
                        onChange={(e) => updateScheduleItem(day, 'notes', e.target.value)}
                        className="bg-background/50 border-white/5 pl-10 h-12 rounded-xl text-xs font-medium italic"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise Detail Drawer */}
      <AnimatePresence>
        {selectedDayDetail && (
          <div className="fixed inset-0 z-[300] flex items-end justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDayDetail(null)}
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
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-headline font-black uppercase italic leading-none">{format(selectedDayDetail, 'EEEE', { locale: es })}</h3>
                    <p className="text-secondary font-black uppercase text-xs tracking-widest mt-1">{format(selectedDayDetail, 'd MMMM, yyyy', { locale: es })}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedDayDetail(null)} className="rounded-full bg-white/5 hover:bg-white/10">
                    <X size={24} />
                  </Button>
                </div>

                <ExerciseList 
                  date={selectedDayDetail} 
                  exercises={getWorkoutForDay(selectedDayDetail)} 
                  progress={progress} 
                  onToggle={onToggleExercise}
                  language={language}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExerciseList({ date, exercises, progress, onToggle, language }: { 
  date: Date, 
  exercises: any[], 
  progress: Record<string, DailyProgress>, 
  onToggle: (id: string, d: string) => void,
  language: Language
}) {
  const dateKey = format(date, 'yyyy-MM-dd');
  const dayProgress = progress[dateKey];
  const completed = dayProgress?.completedExercises || [];
  const isFinished = exercises.length > 0 && exercises.length === completed.length;

  if (exercises.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center opacity-30 space-y-6">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center"><Clock size={40} /></div>
        <div>
          <h4 className="text-2xl font-headline font-black uppercase italic">Día de Recuperación</h4>
          <p className="font-medium mt-2">Cuerpo y mente necesitan descanso para crecer.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Exercise Count Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary"><ClipboardList size={20} /></div>
          <span className="font-black uppercase text-sm tracking-widest">{exercises.length} Ejercicios</span>
        </div>
        {isFinished && (
           <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2 text-secondary font-black text-xs uppercase bg-secondary/10 px-4 py-2 rounded-full border border-secondary/20">
             <Trophy size={14} /> ¡COMPLETADO!
           </motion.div>
        )}
      </div>

      <div className="space-y-4">
        {exercises.map((ex, i) => {
          const isDone = completed.includes(ex.id);
          return (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onToggle(ex.id, dateKey)}
              className={`group flex items-center gap-6 p-6 rounded-[2rem] border cursor-pointer transition-all ${
                isDone ? 'bg-secondary/5 border-secondary/20 opacity-70' : 'bg-white/5 border-white/5 hover:border-white/10'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${isDone ? 'bg-secondary text-background' : 'bg-background group-hover:bg-primary/20 group-hover:text-primary'}`}>
                {i + 1}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className={`text-xl font-headline font-bold truncate ${isDone ? 'line-through text-on-surface-variant' : 'text-white'}`}>{ex.name}</h4>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-secondary uppercase"><Target size={14} />{ex.sets} s</div>
                  <div className="flex items-center gap-1.5 text-xs font-black text-primary uppercase"><Zap size={14} />{ex.reps} r</div>
                </div>
                <p className="text-[10px] text-on-surface-variant italic mt-2 opacity-60 line-clamp-1 group-hover:line-clamp-none transition-all">{ex.notes}</p>
              </div>

              <motion.div 
                animate={isDone ? { scale: [1, 1.2, 1] } : {}}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 ${isDone ? 'bg-secondary border-secondary text-background' : 'border-white/10 group-hover:border-primary/50'}`}
              >
                {isDone ? <CheckCircle2 size={24} /> : <Circle size={24} className="opacity-10" />}
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {isFinished && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="flex flex-col items-center justify-center py-12 gap-4"
        >
          <motion.div
            animate={{ 
              rotate: [0, -10, 10, -10, 10, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 0.6, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
            className="w-24 h-24 bg-secondary/20 rounded-full flex items-center justify-center text-secondary border-2 border-secondary/50 shadow-2xl shadow-secondary/20"
          >
            <Trophy size={48} />
          </motion.div>
          <div className="text-center">
            <h5 className="text-2xl font-headline font-black uppercase italic text-secondary">¡OBJETIVO CUMPLIDO!</h5>
            <p className="text-on-surface-variant font-medium mt-1">Has finalizado la rutina de este deporte.</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
