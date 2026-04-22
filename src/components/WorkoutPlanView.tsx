import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfToday, isSameDay, startOfWeek, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  CheckCircle2, Circle, Trophy, Dumbbell, X, Zap, Target, 
  Clock, Calendar, ClipboardList, MapPin, Save, Info, ChevronRight, 
  Trash2, Plus, LayoutGrid, UserCircle2, Settings2, Sparkles,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { TrainingPlan, SportConfig, DailyProgress, Language, UserProfile } from '../types';
import * as Icons from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { generateCombinedTrainingPlan } from '@/src/services/geminiService';

const ExerciseAnimation = ({ type, isDone }: { type: string, isDone: boolean }) => {
  const isBoxing = type.toLowerCase().includes('box') || type.toLowerCase().includes('jab') || type.toLowerCase().includes('hook');
  const isLifting = type.toLowerCase().includes('press') || type.toLowerCase().includes('pesa') || type.toLowerCase().includes('mancuerna') || type.toLowerCase().includes('sentadilla') || type.toLowerCase().includes('squat');
  const isRunning = type.toLowerCase().includes('run') || type.toLowerCase().includes('correr') || type.toLowerCase().includes('rodaje') || type.toLowerCase().includes('sprint');
  
  return (
    <div className={`relative w-24 h-24 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center shrink-0 ${isDone ? 'opacity-30 grayscale' : ''}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
      
      {isBoxing && (
        <div className="relative">
          <motion.div
            animate={{ 
              x: [0, 40, 0],
              scale: [1, 1.2, 1],
              rotate: [0, -10, 0]
            }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "circOut" }}
            className="text-primary"
          >
            <Icons.Zap size={32} />
          </motion.div>
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary/20 animate-ping" />
        </div>
      )}

      {isLifting && (
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ 
              y: [10, -10, 10],
              scaleY: [0.9, 1.1, 0.9]
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-secondary"
          >
            <Dumbbell size={32} />
          </motion.div>
          <motion.div 
            animate={{ width: [20, 40, 20], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-1 bg-secondary/30 rounded-full mt-2" 
          />
        </div>
      )}

      {isRunning && (
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ 
                y: [0, -15, 0],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{ 
                duration: 0.6, 
                repeat: Infinity, 
                delay: i * 0.2,
                ease: "easeInOut" 
              }}
              className="w-2 h-8 bg-primary rounded-full"
            />
          ))}
        </div>
      )}

      {!isBoxing && !isLifting && !isRunning && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="text-white/20"
        >
          <Icons.Activity size={32} />
        </motion.div>
      )}
      
      <div className="absolute bottom-1 right-2">
        <span className="text-[6px] font-black uppercase tracking-widest opacity-40">Guía Visual</span>
      </div>
    </div>
  );
};

interface WorkoutPlanViewProps {
  sport: SportConfig;
  allSports: SportConfig[];
  profile: UserProfile;
  progress: Record<string, DailyProgress>;
  onToggleExercise: (exerciseId: string, dateKey: string) => void;
  onUpdateProfile: (profile: UserProfile) => void;
  onClose: () => void;
  language: Language;
  globalPlan?: TrainingPlan;
}

export default function WorkoutPlanView({ 
  sport, 
  allSports, 
  profile,
  progress, 
  onToggleExercise, 
  onUpdateProfile,
  onClose, 
  language,
  globalPlan
}: WorkoutPlanViewProps) {
  const t = useTranslation(language);
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'schedule' | 'resources'>('today');
  const [selectedDayDetail, setSelectedDayDetail] = useState<Date | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const today = startOfToday();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const dayNames = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SAB', 'DOM'];

  // Local State
  const [localSchedule, setLocalSchedule] = useState(sport.schedule || {});
  const [localEquipment, setLocalEquipment] = useState(sport.equipment || '');
  const [hasInstructor, setHasInstructor] = useState(sport.hasInstructor || false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  useEffect(() => {
    setLocalSchedule(sport.schedule || {});
    setLocalEquipment(sport.equipment || '');
    setHasInstructor(sport.hasInstructor || false);
  }, [sport.schedule, sport.equipment, sport.hasInstructor]);

  useEffect(() => {
    console.log('[WorkoutPlanView] sport.plan:', sport.plan?.table?.length, 'días');
    console.log('[WorkoutPlanView] globalPlan:', globalPlan?.table?.length, 'días');
    console.log('[WorkoutPlanView] activePlan usado:', (sport.plan || globalPlan)?.table?.length, 'días');
  }, [sport, globalPlan]);

  const normalizeText = (text: string) => {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  const getWorkoutForDay = (date: Date) => {
    const dayLabel = format(date, 'EEEE', { locale: es }).toLowerCase();
    const normalizedDayLabel = normalizeText(dayLabel);
    const dNum = date.getDay() === 0 ? 7 : date.getDay();
    
    // Si hay instructor, no devolvemos lista de ejercicios, sino una sesión genérica
    if (hasInstructor) {
      return [{
        id: 'instructor_session',
        name: `Sesión de ${sport.sport} con Instructor`,
        sets: '1',
        reps: 'Sesión',
        notes: 'Sigue las instrucciones directas de tu profesor durante la clase.',
        isInstructorLed: true
      }];
    }

    const activePlan = sport.plan || globalPlan;
    if (!activePlan?.table) return [];

    const workouts = activePlan.table.filter(t => {
      const d = normalizeText(t.day);
      return d.includes(normalizedDayLabel) || 
             d.includes('hoy') || 
             d.includes(`dia ${dNum}`) || 
             d.includes(`día ${dNum}`) ||
             (normalizedDayLabel === 'lunes' && d.includes('lun')) ||
             (normalizedDayLabel === 'martes' && d.includes('mar')) ||
             (normalizedDayLabel === 'miercoles' && d.includes('mie')) ||
             (normalizedDayLabel === 'jueves' && d.includes('jue')) ||
             (normalizedDayLabel === 'viernes' && d.includes('vie')) ||
             (normalizedDayLabel === 'sabado' && d.includes('sab')) ||
             (normalizedDayLabel === 'domingo' && d.includes('dom'));
    });

    if (workouts.length === 0) return [];
    
    const allExercises = workouts.reduce((acc, curr) => [...acc, ...curr.exercises], [] as any[]);
    
    // If it's the sport's OWN plan, we don't filter by name as it's specifically for this sport
    if (sport.plan) {
      return allExercises;
    }

    // Otherwise (globalPlan), filter by current sport name
    const sName = normalizeText(sport.sport);
    return allExercises.filter(ex => 
      !ex.sport || 
      normalizeText(ex.sport).includes(sName) ||
      sName.includes(normalizeText(ex.sport))
    );
  };

  const handleSaveSettings = () => {
    const updatedSports = profile.sports.map(s => 
      s.sport === sport.sport ? { ...s, schedule: localSchedule, equipment: localEquipment, hasInstructor } : s
    );
    onUpdateProfile({ ...profile, sports: updatedSports });
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      // First save the equipment
      const updatedSportWithEquipment = { ...sport, equipment: localEquipment };
      
      // We regenerate ONLY this sport's plan or all combined?
      // User says "adecuandose a sus limitaciones de equipo"
      // If we are in a single sport view, we regenerate the plan for that sport
      const newPlan = await generateCombinedTrainingPlan(
        profile, 
        [updatedSportWithEquipment], 
        language
      );
      
      const finaleSports = profile.sports.map(s => 
        s.sport === sport.sport ? { ...s, equipment: localEquipment, plan: newPlan } : s
      );
      
      onUpdateProfile({ ...profile, sports: finaleSports, plan: finaleSports.length === 1 ? newPlan : profile.plan });
      // Logic: if it's the only sport, also update global plan. If not, only this sport's plan.
    } catch (e) {
      console.error(e);
    } finally {
      setIsRegenerating(false);
    }
  };

  const updateScheduleItem = (day: string, field: string, value: string) => {
    setLocalSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const activePlan = sport.plan || globalPlan;
  const isFallbackPlan = (activePlan as any)?.isFallback === true ||
    activePlan?.reasoning?.includes('[Plan local') ||
    (activePlan?.table?.every(d => d.exercises.length <= 1) && activePlan?.table?.some(d => d.exercises.length > 0));

  useEffect(() => {
    if (isFallbackPlan && !isRegenerating) {
      // Pequeño delay para que el usuario vea la interfaz primero
      const timer = setTimeout(() => handleRegenerate(), 1500);
      return () => clearTimeout(timer);
    }
  }, []); // Solo al montar

  // Si no hay plan, mostrar pantalla de generación automática
  if (!activePlan && !isRegenerating) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center gap-8 p-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center"
        >
          <Dumbbell size={48} className="text-primary" />
        </motion.div>
        <div className="text-center space-y-2">
          <h3 className="text-3xl font-headline font-black uppercase italic">{sport.sport}</h3>
          <p className="text-on-surface-variant">No hay plan generado para este deporte todavía.</p>
        </div>
        <Button
          onClick={handleRegenerate}
          className="bg-primary text-on-primary font-black uppercase tracking-widest px-12 h-16 rounded-2xl shadow-2xl shadow-primary/20"
        >
          <Zap size={20} className="mr-2" /> Generar Plan de Entrenamiento
        </Button>
        <Button variant="ghost" onClick={onClose} className="text-on-surface-variant">
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-6 md:p-12 space-y-8 relative">
      {/* Dynamic Visual Backdrop */}
      <div className="absolute top-0 left-0 w-full h-[60vh] opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0c]/80 to-[#0a0a0c] z-10" />
        <motion.img 
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.15 }}
          transition={{ duration: 2 }}
          src={`https://picsum.photos/seed/${sport.sport}/1920/1080`}
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover grayscale"
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-[#0a0a0c]/80 backdrop-blur-xl z-[100] py-4 -mx-6 px-6 -mt-6">
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
      <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/5 max-w-lg mx-auto">
        {(['week', 'today', 'schedule', 'resources'] as const).map(tab => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'ghost'}
            onClick={() => setActiveTab(tab)}
            className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest h-10 px-0"
          >
            {tab === 'week' ? 'Semana' : tab === 'today' ? 'Hoy' : tab === 'schedule' ? 'Horario' : 'Recursos'}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {isRegenerating ? (
           <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 gap-6"
           >
              <Icons.Loader2 className="animate-spin text-primary" size={64} />
              <div className="text-center">
                <h3 className="text-2xl font-headline font-black uppercase italic">Reajustando tu plan...</h3>
                <p className="text-on-surface-variant font-medium mt-2">Personalizando ejercicios según tus recursos disponibles.</p>
              </div>
           </motion.div>
        ) : (
          <>
            {activeTab === 'week' && (
          <motion.div
            key="week"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {isFallbackPlan && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl max-w-4xl mx-auto w-full"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle size={18} className="text-amber-400 shrink-0" />
                  <p className="text-xs text-amber-400 font-bold">
                    Plan básico activo. Genera el plan personalizado con IA para ejercicios adaptados a tu objetivo.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="shrink-0 bg-amber-500 text-black font-black text-xs uppercase px-4 h-8 rounded-xl ml-4"
                >
                  {isRegenerating ? <Icons.Loader2 size={12} className="animate-spin" /> : <Zap size={12} className="mr-1" />}
                  Mejorar
                </Button>
              </motion.div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
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
          </div>
        </motion.div>
      )}

        {activeTab === 'today' && (
          <motion.div
            key="today"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl mx-auto w-full space-y-8"
          >
            {isFallbackPlan && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle size={18} className="text-amber-400 shrink-0" />
                  <p className="text-xs text-amber-400 font-bold">
                    Plan básico activo. Genera el plan personalizado con IA para ejercicios adaptados a tu objetivo.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="shrink-0 bg-amber-500 text-black font-black text-xs uppercase px-4 h-8 rounded-xl ml-4"
                >
                  {isRegenerating ? <Icons.Loader2 size={12} className="animate-spin" /> : <Zap size={12} className="mr-1" />}
                  Mejorar
                </Button>
              </motion.div>
            )}

            {/* Today Progress Overview */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                <Button 
                  variant={viewMode === 'cards' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  onClick={() => setViewMode('cards')}
                  className="rounded-lg text-[10px] uppercase font-black px-4 h-8"
                >
                  <Icons.Layout size={14} className="mr-2" /> Fichas
                </Button>
                <Button 
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  onClick={() => setViewMode('table')}
                  className="rounded-lg text-[10px] uppercase font-black px-4 h-8"
                >
                  <Icons.Table size={14} className="mr-2" /> Tabla
                </Button>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase opacity-40 block">Progreso Diario</span>
                <span className="text-sm font-black text-primary italic uppercase">En Acción</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-2">Estado</span>
                <Sparkles className="text-primary mb-2" size={16} />
                <span className="text-xs font-black uppercase tracking-tight">Activo</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-2">Duración</span>
                <Clock className="text-secondary mb-2" size={16} />
                <span className="text-xs font-black uppercase tracking-tight">~{sport.durationPerSession || 60}m</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-2">Día</span>
                <Calendar className="text-white mb-2" size={16} />
                <span className="text-xs font-black uppercase tracking-tight">{format(today, 'EEEE', { locale: es }).split('-')[0]}</span>
              </div>
            </div>

            {/* Instructor Quick Toggle Prompt */}
            {!hasInstructor && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-secondary/5 rounded-3xl border border-secondary/20 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center text-secondary">
                    <UserCircle2 size={20} />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-secondary leading-none">¿Entrenas con profesor?</h5>
                    <p className="text-[9px] font-medium opacity-60 mt-1 leading-tight">Si tienes instructor de {sport.sport}, no necesitas tabla de ejercicios.</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setActiveTab('resources')}
                  className="h-8 text-[9px] font-black uppercase tracking-widest rounded-lg border-secondary/30 text-secondary hover:bg-secondary/10 shrink-0"
                >
                  Configurar
                </Button>
              </motion.div>
            )}

            <ExerciseList 
              date={today} 
              exercises={getWorkoutForDay(today)} 
              progress={progress} 
              onToggle={onToggleExercise}
              language={language}
              viewMode={viewMode}
            />

            <div className="h-20" /> {/* Extra space to avoid cut-off */}
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
              <Button onClick={handleSaveSettings} className="bg-secondary text-background hover:bg-secondary/90 font-black uppercase tracking-widest px-8 rounded-xl h-12 shadow-xl shadow-secondary/20">
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

        {activeTab === 'resources' && (
          <motion.div
            key="resources"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-3xl font-headline font-black uppercase italic tracking-tight">Recursos y Equipamiento</h3>
                <p className="text-on-surface-variant font-medium mt-1">Dime qué equipo tienes para adaptar los ejercicios.</p>
              </div>
              <Button 
                onClick={handleRegenerate} 
                className="bg-primary text-on-primary hover:bg-primary/90 font-black uppercase tracking-widest px-8 rounded-2xl h-16 shadow-2xl shadow-primary/20 group"
              >
                <Icons.Zap size={20} className="mr-2 group-hover:scale-125 transition-transform" /> Regenerar Plan Adaptado
              </Button>
            </div>

            <Card className="bg-[#111318] border-none p-8 rounded-[2.5rem] space-y-8">
              {/* Instructor Toggle */}
              <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary">
                      <UserCircle2 size={24} />
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-lg uppercase leading-none">Entrenamiento con Instructor</h4>
                      <p className="text-xs text-on-surface-variant mt-1">Marca esta opción si sigues las clases de un profesor.</p>
                    </div>
                  </div>
                  <Switch 
                    checked={hasInstructor}
                    onCheckedChange={(val) => {
                      setHasInstructor(val);
                      // Auto-save instructor state to profile
                      const updatedSports = profile.sports.map(s => 
                        s.sport === sport.sport ? { ...s, hasInstructor: val } : s
                      );
                      onUpdateProfile({ ...profile, sports: updatedSports });
                    }}
                    className="data-[state=checked]:bg-secondary"
                  />
                </div>

                {hasInstructor && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-start gap-3 p-4 bg-secondary/5 rounded-xl border border-secondary/20"
                  >
                    <AlertCircle size={16} className="text-secondary shrink-0 mt-0.5" />
                    <p className="text-[10px] text-secondary font-medium leading-relaxed">
                      Al tener un instructor, el sistema dejará de generar tablas de ejercicios automáticas para este deporte, ya que tu profesor es quien dicta la rutina.
                    </p>
                  </motion.div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-secondary">Tu Equipamiento Actual</label>
                  {!hasInstructor && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleRegenerate} 
                      disabled={isRegenerating}
                      className="h-8 text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <Icons.Zap size={12} className="mr-1" /> Regenerar con este equipo
                    </Button>
                  )}
                </div>
                <textarea
                  value={localEquipment}
                  onChange={(e) => setLocalEquipment(e.target.value)}
                  placeholder="Ej: Solo tengo mancuernas de 5kg y una banda elástica. Mi gimnasio no tiene máquinas de pierna..."
                  className="w-full bg-background/50 border border-white/5 rounded-3xl p-6 min-h-[160px] text-lg font-medium focus:border-primary/50 outline-none transition-all placeholder:opacity-20"
                />
                <Button 
                  onClick={handleSaveSettings}
                  className="w-full bg-white/5 border border-white/5 hover:bg-white/10 h-14 rounded-2xl font-black uppercase tracking-widest"
                >
                  Guardar Recursos
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-background/30 rounded-2xl border border-white/5 flex items-start gap-4">
                  <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary shrink-0"><Icons.Info size={20} /></div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Al regenerar el plan, la IA buscará alternativas biomecánicamente similares que puedas realizar con lo que tienes.
                  </p>
                </div>
                <div className="p-6 bg-background/30 rounded-2xl border border-white/5 flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0"><Icons.Target size={20} /></div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Mantendremos el mismo objetivo (Fuerza, Hipertrofia...) pero cambiando las herramientas de ejecución.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
          </>
        )}
      </AnimatePresence>

      {/* Exercise Detail Drawer */}
      <AnimatePresence>
        {selectedDayDetail && (
          <div className="fixed inset-0 z-[400] flex items-end justify-center sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDayDetail(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl bg-[#0a0a0c] sm:rounded-[3rem] border-t sm:border border-white/10 shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden h-[92vh] sm:h-[88vh]"
            >
              {/* Drawer Handle */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/10 rounded-full z-10" />

              <div className="h-full flex flex-col pt-10">
                <div className="px-8 pb-6 flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="text-4xl font-headline font-black uppercase italic leading-none tracking-tight">
                      {format(selectedDayDetail, 'EEEE', { locale: es })}
                    </h3>
                    <p className="text-secondary font-black uppercase text-xs tracking-widest mt-2 flex items-center gap-2">
                      <Calendar size={14} /> {format(selectedDayDetail, 'd MMMM, yyyy', { locale: es })}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedDayDetail(null)} className="rounded-full bg-white/5 hover:bg-white/10 w-12 h-12">
                    <X size={24} />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto px-8 pb-12 custom-scrollbar">
                  <ExerciseList 
                    date={selectedDayDetail} 
                    exercises={getWorkoutForDay(selectedDayDetail)} 
                    progress={progress} 
                    onToggle={onToggleExercise}
                    language={language}
                    viewMode={viewMode}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExerciseList({ date, exercises, progress, onToggle, language, viewMode = 'cards' }: { 
  date: Date, 
  exercises: any[], 
  progress: Record<string, DailyProgress>, 
  onToggle: (id: string, d: string) => void,
  language: Language,
  viewMode?: 'cards' | 'table'
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

  if (viewMode === 'table') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
           <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary"><Icons.Table size={20} /></div>
            <span className="font-black uppercase text-sm tracking-widest">Vista de Tabla Dinámica</span>
          </div>
        </div>
        
        <Card className="bg-[#111318] border border-white/5 rounded-[2rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest opacity-40">Estado</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest opacity-40">Ejercicio</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest opacity-40">Secuencia</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest opacity-40">Grupo</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest opacity-40">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {exercises.map((ex, i) => {
                  const isDone = completed.includes(ex.id);
                  return (
                    <motion.tr 
                      key={ex.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => onToggle(ex.id, dateKey)}
                      className={`cursor-pointer hover:bg-white/[0.02] transition-colors ${isDone ? 'opacity-40' : ''}`}
                    >
                      <td className="p-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isDone ? 'bg-secondary border-secondary' : 'border-white/10'}`}>
                          {isDone && <CheckCircle2 size={12} className="text-background" />}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <ExerciseAnimation type={ex.name} isDone={isDone} />
                          <div>
                            <span className="text-sm font-black uppercase italic block">{ex.name}</span>
                            <span className="text-[10px] opacity-40 font-bold">{ex.equipment || 'Sin material'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                           <span className="text-xs font-black text-secondary">{ex.sets} <span className="text-[8px] opacity-40">SETS</span></span>
                           <span className="text-xs font-black text-primary">{ex.reps} <span className="text-[8px] opacity-40">REPS</span></span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-white/5 rounded-md text-[8px] font-black uppercase whitespace-nowrap">{ex.muscleGroup}</span>
                      </td>
                      <td className="p-4 max-w-xs">
                        <p className="text-[10px] font-medium opacity-60 line-clamp-2 italic">"{ex.notes}"</p>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
        
        {isFinished && (
           <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="p-6 bg-secondary/10 border border-secondary/20 rounded-3xl text-center">
              <Trophy size={32} className="mx-auto text-secondary mb-2" />
              <h5 className="font-headline font-black uppercase italic text-secondary">¡Entrenamiento de hoy Finalizado!</h5>
           </motion.div>
        )}
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

      <div className="space-y-4 pb-32">
        {exercises.map((ex, i) => {
          const isDone = completed.includes(ex.id);
          const isInstructor = ex.isInstructorLed;

          if (isInstructor) {
            return (
              <motion.div
                key={ex.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onToggle(ex.id, dateKey)}
                className={`flex flex-col p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer ${
                  isDone ? 'bg-secondary/10 border-secondary/40' : 'bg-primary/5 border-primary/20 hover:border-primary/40'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                    <UserCircle2 size={32} />
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${isDone ? 'bg-secondary border-secondary text-background' : 'border-white/10'}`}>
                    {isDone ? <CheckCircle2 size={24} /> : <Circle size={24} className="opacity-10" />}
                  </div>
                </div>
                <h4 className="text-2xl font-headline font-black uppercase italic leading-none">{ex.name}</h4>
                <p className="text-sm font-medium opacity-60 mt-2">{ex.notes}</p>
                <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-4">
                  <div className="px-4 py-2 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest">Presencial</div>
                  <div className="px-4 py-2 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-secondary">Instructor Titular</div>
                </div>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                delay: i * 0.1,
                type: "spring",
                damping: 20,
                stiffness: 100
              }}
              onClick={() => onToggle(ex.id, dateKey)}
              className={`group relative overflow-hidden rounded-[2.5rem] border-2 transition-all cursor-pointer ${
                isDone 
                  ? 'bg-secondary/10 border-secondary/40 opacity-80' 
                  : 'bg-[#111318] border-white/5 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10'
              }`}
            >
              <div className="p-8 flex flex-col lg:flex-row lg:items-center gap-8 relative z-10">
                {/* Exercise Animation / Visual Guide */}
                <ExerciseAnimation type={ex.name} isDone={isDone} />

                {/* Exercise Progress / Icon (Desktop simple) */}
                <div className="hidden lg:flex flex-col items-center justify-center gap-2 shrink-0 px-4 border-r border-white/5">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">ORDEN</span>
                   <p className="font-headline font-black text-4xl italic text-primary">{i + 1}</p>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className={`text-4xl font-headline font-black uppercase italic tracking-tight leading-none ${isDone ? 'line-through opacity-50' : ''}`}>
                          {ex.name}
                        </h4>
                        {ex.muscleGroup && (
                          <span className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-wider text-primary shrink-0">
                            {ex.muscleGroup}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-6 mt-4">
                         <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                            <Icons.Layers size={16} className="text-secondary" />
                            <div className="flex flex-col">
                              <span className="text-[8px] font-black opacity-40 uppercase leading-none">Series</span>
                              <span className="text-lg font-headline font-black italic leading-none">{ex.sets}</span>
                            </div>
                         </div>
                         <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                            <Zap size={16} className="text-primary" />
                            <div className="flex flex-col">
                              <span className="text-[8px] font-black opacity-40 uppercase leading-none">Reps</span>
                              <span className="text-lg font-headline font-black italic leading-none">{ex.reps}</span>
                            </div>
                         </div>
                         {ex.equipment && (
                           <div className="flex items-center gap-2 opacity-60">
                             <Icons.Box size={14} />
                             <span className="text-[10px] font-black uppercase tracking-widest">{ex.equipment}</span>
                           </div>
                         )}
                      </div>
                    </div>

                    <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all shrink-0 ${
                      isDone 
                        ? 'bg-secondary border-secondary text-background shadow-lg shadow-secondary/40' 
                        : 'border-white/10 group-hover:border-primary/50 text-white/20'
                    }`}>
                      {isDone ? <CheckCircle2 size={32} /> : <Dumbbell size={32} className="opacity-40" />}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-background/50 rounded-3xl border border-white/5 relative group-hover:border-primary/20 transition-all flex items-start gap-4 h-full">
                      <Icons.Text size={18} className="text-primary/40 shrink-0 mt-1" />
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-40 block mb-1">Ejecución</span>
                        <p className="text-sm font-medium leading-relaxed opacity-80 group-hover:opacity-100 italic">
                          "{ex.notes}"
                        </p>
                      </div>
                    </div>

                    {ex.executionTip && (
                      <div className="p-5 bg-secondary/5 rounded-3xl border border-secondary/20 relative transition-all flex items-start gap-4 h-full">
                        <Sparkles size={18} className="text-secondary shrink-0 mt-1" />
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-secondary block mb-1">Tip de Instructor</span>
                          <p className="text-sm font-black italic leading-relaxed text-secondary/80">
                            {ex.executionTip || ex.notes}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
