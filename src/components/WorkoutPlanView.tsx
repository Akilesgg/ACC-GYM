import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfToday, isSameDay, startOfWeek, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  CheckCircle2, Circle, Trophy, Dumbbell, X, Zap, Target, 
  Clock, Calendar, ClipboardList, MapPin, Save, Info, ChevronRight, ChevronDown, 
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
import { ExerciseAnimation } from './ExerciseAnimation';
import { ExerciseCard } from './ExerciseCard';
import { Table as TableIcon } from 'lucide-react';

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

  const [editTab, setEditTab] = useState<string>('Lunes');
  const [editExercises, setEditExercises] = useState<any[]>([]);
  const [newExName, setNewExName] = useState('');
  const [newExSets, setNewExSets] = useState('3');
  const [newExReps, setNewExReps] = useState('12');

  const [isCombinedView, setIsCombinedView] = useState(false);
  const activePlan = sport.plan || globalPlan;
  const [showImportModal, setShowImportModal] = useState(false);
  const [focusedExercise, setFocusedExercise] = useState<any | null>(null);

  const handleSwapExercise = (exerciseId: string, forceNoEquipment: boolean = false) => {
    // Basic swapping logic: find an exercise with the same muscle group from the active plan or global pool
    const planToSearch = sport.plan || globalPlan;
    if (!planToSearch) return;

    // We can swap in the current edit context or in the whole plan
    // If we are in 'edit' tab, we swap in editExercises
    const exToSwap = editExercises.find(ex => ex.id === exerciseId) || 
                   activePlan.table.flatMap(d => d.exercises).find(ex => ex.id === exerciseId);
    
    if (exToSwap) {
      const pool = planToSearch.table.flatMap(d => d.exercises);
      let alternatives = pool.filter(ex => 
        (ex.muscleGroup === exToSwap.muscleGroup || ex.sport === exToSwap.sport) && 
        ex.name !== exToSwap.name
      );

      if (forceNoEquipment) {
        // Try to find one with no equipment in pool or use existing alternatives field
        const bodyweightShorthand = ['flexion', 'sentadilla', 'plancha', 'core', 'calistenia', 'push up', 'squat', 'plank'];
        alternatives = alternatives.filter(ex => 
          bodyweightShorthand.some(term => ex.name.toLowerCase().includes(term)) ||
          ex.equipment?.toLowerCase().includes('ninguno') ||
          ex.equipment?.toLowerCase().includes('propio')
        );
      }

      if (alternatives.length > 0) {
        const randomAlternative = alternatives[Math.floor(Math.random() * alternatives.length)];
        
        // If we are in edit mode, update editExercises
        if (activeTab === 'edit') {
          setEditExercises(prev => prev.map(ex => 
            ex.id === exerciseId ? { ...randomAlternative, id: `swap-${Date.now()}`, sport: exToSwap.sport || sport.sport } : ex
          ));
        } else {
          // In daily view, we update the whole activePlan and profile
          const updatedTable = activePlan.table.map(d => ({
            ...d,
            exercises: d.exercises.map(ex => 
              ex.id === exerciseId ? { ...randomAlternative, id: `swap-${Date.now()}`, sport: exToSwap.sport || sport.sport } : ex
            )
          }));
          const updatedPlan = { ...activePlan, table: updatedTable };
          const updatedSports = profile.sports.map(s => 
            s.sport === sport.sport ? { ...s, plan: updatedPlan } : s
          );
          onUpdateProfile({ ...profile, sports: updatedSports, plan: updatedPlan });
        }
      } else {
        alert("No se encontraron ejercicios similares. Prueba regenerando el plan con IA especificando tu material.");
      }
    } else {
      alert("No se pudo encontrar el ejercicio para cambiar.");
    }
  };

  const importRoutine = (sourceSportName: string, sourceDay: string) => {
    const sourceSport = allSports.find(s => s.sport === sourceSportName);
    const sourcePlan = sourceSport?.plan || globalPlan;
    const sourceData = sourcePlan?.table.find(d => d.day === sourceDay);
    
    if (sourceData?.exercises) {
      setEditExercises(prev => [
        ...prev, 
        ...sourceData.exercises.map(ex => ({ ...ex, id: `${ex.id}-copy-${Date.now()}`, sport: sourceSportName }))
      ]);
    }
    setShowImportModal(false);
  };

  const duplicateDay = (sourceDay: string) => {
    const sourceData = activePlan?.table.find(d => d.day === sourceDay);
    if (sourceData?.exercises) {
      setEditExercises(sourceData.exercises.map(ex => ({ ...ex, id: `${ex.id}-dup-${Date.now()}` })));
    }
  };

  useEffect(() => {
    const dayData = activePlan?.table.find(d => d.day === editTab);
    setEditExercises(dayData?.exercises || []);
  }, [editTab, activePlan]);

  const saveEditedDay = () => {
    if (!activePlan) return;
    const updatedTable = activePlan.table.map(d =>
      d.day === editTab ? { ...d, exercises: editExercises } : d
    );
    const updatedPlan = { ...activePlan, table: updatedTable };
    const updatedSports = profile.sports.map(s =>
      s.sport === sport.sport ? { ...s, plan: updatedPlan } : s
    );
    onUpdateProfile({ ...profile, sports: updatedSports, plan: updatedPlan });
  };

  const addExercise = () => {
    if (!newExName.trim()) return;
    const newEx = {
      id: `custom-${Date.now()}`,
      name: newExName,
      sets: newExSets,
      reps: newExReps,
      notes: 'Ejercicio personalizado',
      muscleGroup: '',
    };
    setEditExercises(prev => [...prev, newEx]);
    setNewExName('');
  };

  useEffect(() => {
    setLocalSchedule(sport.schedule || {});
    setLocalEquipment(sport.equipment || '');
    setHasInstructor(sport.hasInstructor || false);
  }, [sport.schedule, sport.equipment, sport.hasInstructor]);

  const normalizeText = (text: string) => {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  const getWorkoutForDay = (date: Date, forceAll: boolean = false) => {
    const dayLabel = format(date, 'EEEE', { locale: es }).toLowerCase();
    const normalizedDayLabel = normalizeText(dayLabel);
    const dNum = date.getDay() === 0 ? 7 : date.getDay();
    
    const sportsToQuery = (isCombinedView || forceAll) ? allSports : [sport];
    let allExercisesResults: any[] = [];

    sportsToQuery.forEach(s => {
      // Si hay instructor, no devolvemos lista de ejercicios, sino una sesión genérica
      if (s.hasInstructor) {
        allExercisesResults.push({
          id: `instructor_session_${s.sport}`,
          name: `Sesión de ${s.sport} con Instructor`,
          sets: '1',
          reps: 'Sesión',
          notes: 'Sigue las instrucciones directas de tu profesor durante la clase.',
          isInstructorLed: true,
          sport: s.sport
        });
        return;
      }

      const planToUse = s.plan || globalPlan;
      if (!planToUse?.table) return;

      const dailyWorkouts = planToUse.table.filter(t => {
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

      dailyWorkouts.forEach(dw => {
        dw.exercises.forEach((ex: any) => {
          // If it's the sport's OWN plan, we add it with the sport name
          if (s.plan) {
            allExercisesResults.push({ ...ex, sport: s.sport });
          } else {
            // Para globalPlan: incluir ejercicio si:
            // 1. No tiene campo sport asignado (ejercicios sin asignar van al primer deporte)
            // 2. O el sport del ejercicio coincide con este deporte
            // 3. O solo hay un deporte activo (en ese caso todos los ejercicios son suyos)
            const sName = normalizeText(s.sport);
            const exSport = normalizeText(ex.sport || '');
            const isMatch = !ex.sport || 
                            exSport.includes(sName) || 
                            sName.includes(exSport) ||
                            sportsToQuery.length === 1;  // <- LÍNEA CLAVE
            if (isMatch) {
              allExercisesResults.push({ ...ex, sport: s.sport });
            }
          }
        });
      });
    });

    // Fallback: si no hay ejercicios para hoy pero el plan existe,
    // mostrar los del primer día con ejercicios disponible
    if (allExercisesResults.length === 0 && !forceAll) {
      const planToUse = sport.plan || globalPlan;
      if (planToUse?.table) {
        const firstDayWithExercises = planToUse.table.find(d => d.exercises.length > 0);
        if (firstDayWithExercises) {
          allExercisesResults = firstDayWithExercises.exercises.map(ex => ({
            ...ex, sport: sport.sport
          }));
        }
      }
    }

    return allExercisesResults;
  };

  const handleSaveSettings = () => {
    const updatedSports = profile.sports.map(s => 
      s.sport === sport.sport ? { ...s, schedule: localSchedule, equipment: localEquipment, hasInstructor } : s
    );
    onUpdateProfile({ ...profile, sports: updatedSports });
  };

  const handleEditExercise = (exerciseId: string, field: string, value: string) => {
    const activePlan = sport.plan || globalPlan;
    if (!activePlan) return;
    const updatedTable = activePlan.table.map(day => ({
      ...day,
      exercises: day.exercises.map(ex =>
        ex.id === exerciseId ? { ...ex, [field]: value } : ex
      )
    }));
    const updatedPlan = { ...activePlan, table: updatedTable };
    const updatedSports = profile.sports.map(s =>
      s.sport === sport.sport ? { ...s, plan: updatedPlan } : s
    );
    onUpdateProfile({ ...profile, sports: updatedSports, plan: updatedPlan });
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

  const isFallbackPlan = useMemo(() => {
    return (activePlan as any)?.isFallback === true ||
      activePlan?.reasoning?.includes('[Plan local') ||
      (activePlan?.table?.every(d => d.exercises.length <= 1) && activePlan?.table?.some(d => d.exercises.length > 0));
  }, [activePlan]);

  useEffect(() => {
    if (isFallbackPlan && !isRegenerating) {
      // Trigger regeneration immediately if it's a fallback plan
      console.log("[WorkoutPlanView] Detected fallback plan, triggering AI generation...");
      handleRegenerate();
    }
  }, [isFallbackPlan]); // Trigger if plan changes to fallback

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
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <div className="flex flex-col gap-2 p-1 bg-white/5 rounded-2xl border border-white/5 md:flex-row md:items-center">
          <div className="flex gap-1 flex-1">
            {(['week', 'today', 'schedule', 'resources', 'edit'] as const).map(tab => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'default' : 'ghost'}
                onClick={() => setActiveTab(tab)}
                className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest h-10 px-4 min-w-fit"
              >
                {tab === 'week' ? 'Semana' : tab === 'today' ? 'Hoy' : tab === 'schedule' ? 'Horario' : tab === 'edit' ? 'Editar' : 'Recursos'}
              </Button>
            ))}
          </div>
          {allSports.length > 1 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-xl border border-white/5 overflow-hidden">
               <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isCombinedView ? 'text-primary' : 'opacity-30'}`}>Global</span>
               <Switch 
                checked={isCombinedView}
                onCheckedChange={setIsCombinedView}
                className="scale-75 data-[state=checked]:bg-primary"
              />
            </div>
          )}
        </div>

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

                <div className="flex flex-col gap-2">
                  <ExerciseList 
                    date={today} 
                    exercises={getWorkoutForDay(today)} 
                    progress={progress} 
                    onToggle={onToggleExercise}
                    language={language}
                    viewMode={viewMode}
                    sportName={sport.sport}
                    onEditExercise={handleEditExercise}
                    onSwap={handleSwapExercise}
                    onFocus={setFocusedExercise}
                  />
                </div>

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

        {activeTab === 'edit' && (
          <motion.div
            key="edit"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-3xl font-headline font-black uppercase italic tracking-tight">Editar Tabla</h3>
                <p className="text-on-surface-variant font-medium mt-1">Personaliza manualmente tus rutinas diarias.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setShowImportModal(true)}
                  className="rounded-xl font-black uppercase text-[10px] tracking-widest border-secondary/30 text-secondary h-12"
                >
                  <Plus size={14} className="mr-2" /> Importar / Combinar
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => { if(confirm('¿Generar tabla nueva con IA? Se perderán manuales.')) handleRegenerate(); }}
                  className="rounded-xl font-black uppercase text-[10px] tracking-widest border-primary/30 text-primary h-12"
                >
                  <Sparkles size={14} className="mr-2" /> Regenerar con IA
                </Button>
                <Button 
                  onClick={saveEditedDay}
                  className="bg-secondary text-background font-black uppercase text-[10px] tracking-widest px-8 rounded-xl h-12 shadow-xl shadow-secondary/20"
                >
                  <Save size={14} className="mr-2" /> Guardar Cambios
                </Button>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => (
                <div key={day} className="flex flex-col gap-1 items-center">
                  <Button
                    variant={editTab === day ? 'default' : 'outline'}
                    onClick={() => setEditTab(day)}
                    className={`rounded-full px-6 font-black uppercase text-[10px] tracking-widest h-10 shrink-0 ${editTab === day ? 'bg-primary' : 'border-white/10'}`}
                  >
                    {day}
                  </Button>
                  {editTab !== day && (
                    <button 
                      onClick={() => duplicateDay(day)}
                      className="text-[8px] font-black uppercase opacity-40 hover:opacity-100 transition-opacity"
                    >
                      Copiar aquí
                    </button>
                  )}
                </div>
              ))}
            </div>

            {showImportModal && (
              <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <Card className="w-full max-w-lg bg-[#111318] border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
                  <div className="flex justify-between items-center mb-8">
                    <h4 className="text-2xl font-headline font-black uppercase italic tracking-tight">Importar Rutina</h4>
                    <Button variant="ghost" size="icon" onClick={() => setShowImportModal(false)}><X /></Button>
                  </div>
                  
                  <div className="space-y-6">
                    <p className="text-sm text-on-surface-variant font-medium">Elige de qué deporte y día quieres importar ejercicios:</p>
                    
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {allSports.map(s => (
                        <div key={s.sport} className="space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{s.sport}</span>
                          <div className="grid grid-cols-4 gap-2">
                            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => (
                              <button
                                key={`${s.sport}-${d}`}
                                onClick={() => importRoutine(s.sport, d)}
                                className="px-2 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[9px] font-bold uppercase transition-colors"
                              >
                                {d.slice(0, 3)}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            )}

            <Card className="bg-[#111318] border-none p-8 rounded-[2.5rem] space-y-6">
              <div className="space-y-4">
                {editExercises.map((ex, idx) => (
                  <div key={ex.id} className="flex flex-col md:flex-row gap-4 items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4 flex-1 w-full">
                       <span className="text-xs font-black text-white/20">{idx + 1}</span>
                       <div className="w-12 h-12 rounded-lg overflow-hidden bg-black shrink-0 border border-white/5">
                         <ExerciseAnimation type={ex.name} isDone={false} size="sm" muscleGroup={ex.muscleGroup} className="w-full h-full" />
                       </div>
                       <Input 
                        value={ex.name} 
                        onChange={(e) => {
                          const updated = [...editExercises];
                          updated[idx].name = e.target.value;
                          setEditExercises(updated);
                        }}
                        className="bg-transparent border-none text-xl font-headline font-black uppercase italic p-0 h-auto focus-visible:ring-0"
                      />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                      <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-xl">
                        <span className="text-[8px] font-black uppercase text-white/40">Sets</span>
                        <Input 
                          value={ex.sets}
                          onChange={(e) => {
                            const updated = [...editExercises];
                            updated[idx].sets = e.target.value;
                            setEditExercises(updated);
                          }}
                          className="bg-transparent border-none w-10 text-center font-black p-0 h-auto focus-visible:ring-0"
                        />
                      </div>
                      <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-xl">
                        <span className="text-[8px] font-black uppercase text-white/40">Reps</span>
                        <Input 
                          value={ex.reps}
                          onChange={(e) => {
                            const updated = [...editExercises];
                            updated[idx].reps = e.target.value;
                            setEditExercises(updated);
                          }}
                          className="bg-transparent border-none w-16 text-center font-black p-0 h-auto focus-visible:ring-0"
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setEditExercises(prev => prev.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:bg-red-500/10 rounded-full"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row gap-4">
                <Input 
                  placeholder="Nombre del ejercicio..." 
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  className="flex-1 bg-white/5 border-white/10 rounded-xl h-12 font-black uppercase px-6"
                />
                <div className="flex gap-4">
                   <Input 
                    placeholder="Series" 
                    value={newExSets}
                    onChange={(e) => setNewExSets(e.target.value)}
                    className="w-20 bg-white/5 border-white/10 rounded-xl h-12 text-center font-black"
                  />
                  <Input 
                    placeholder="Reps" 
                    value={newExReps}
                    onChange={(e) => setNewExReps(e.target.value)}
                    className="w-24 bg-white/5 border-white/10 rounded-xl h-12 text-center font-black"
                  />
                  <Button onClick={addExercise} className="bg-primary text-on-primary font-black uppercase tracking-widest px-8 rounded-xl h-12">
                    <Plus size={18} className="mr-2" /> Añadir
                  </Button>
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
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full bg-primary text-black"
                      >
                        {sport.sport}
                      </span>
                      {sport.subtype && (
                        <span className="text-[9px] font-bold uppercase text-primary/60 border border-primary/20 px-2 py-1 rounded-full">
                          {sport.subtype}
                        </span>
                      )}
                    </div>
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
                      sportName={sport.sport}
                      onEditExercise={handleEditExercise}
                      onSwap={handleSwapExercise}
                      onFocus={setFocusedExercise}
                    />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Exercise Focus Modal */}
      <AnimatePresence>
        {focusedExercise && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFocusedExercise(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl bg-[#111318] rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setFocusedExercise(null)} 
                className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-black/40 hover:bg-white/10"
              >
                <X size={24} />
              </Button>

              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="aspect-square bg-black relative">
                  <ExerciseAnimation 
                    type={focusedExercise.name} 
                    muscleGroup={focusedExercise.muscleGroup} 
                    isDone={false} 
                    size="lg" 
                    className="w-full h-full" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111318] via-transparent to-transparent hidden lg:block" />
                </div>
                
                <div className="p-8 lg:p-12 space-y-8">
                  <div>
                    <span className="text-secondary font-black uppercase text-[10px] tracking-widest bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                      {focusedExercise.muscleGroup || 'Full Body'}
                    </span>
                    <h3 className="text-4xl font-headline font-black uppercase italic leading-none tracking-tight mt-4">
                      {focusedExercise.name}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
                      <p className="text-[10px] font-black uppercase text-white/40 mb-2">Series</p>
                      <p className="text-4xl font-black text-primary">{focusedExercise.sets}</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
                      <p className="text-[10px] font-black uppercase text-white/40 mb-2">Repeticiones</p>
                      <p className="text-4xl font-black text-secondary">{focusedExercise.reps}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                        <Icons.BookOpen size={14} /> Instrucciones de Ejecución
                      </h4>
                      <p className="text-on-surface-variant font-medium leading-relaxed italic border-l-2 border-primary/30 pl-4">
                        {focusedExercise.notes}
                      </p>
                    </div>

                    {focusedExercise.equipment && (
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 flex items-center gap-2">
                          <Icons.Package size={14} /> Equipamiento Necesario
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {focusedExercise.equipment.split(',').map((eq: string, idx: number) => (
                            <span key={idx} className="text-xs px-3 py-1 bg-amber-400/10 border border-amber-400/20 rounded-full text-amber-400 font-bold italic">
                              {eq.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {focusedExercise.executionTip && (
                      <div className="bg-primary/5 border border-primary/20 p-6 rounded-3xl flex items-start gap-4">
                        <Icons.Lightbulb className="text-primary shrink-0" size={24} />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Biomecánica Pro Tip</p>
                          <p className="text-sm font-bold text-white/80 leading-relaxed italic">"{focusedExercise.executionTip}"</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
                    <Button 
                      onClick={() => { handleSwapExercise(focusedExercise.id, true); setFocusedExercise(null); }}
                      className="w-full bg-white/5 border border-white/10 hover:bg-white/10 h-14 rounded-2xl font-black uppercase tracking-widest text-xs"
                    >
                      <Icons.RefreshCw size={14} className="mr-2" /> No tengo este material (Cambiar)
                    </Button>
                    <p className="text-[9px] text-center text-white/20 font-medium">Pulsa fuera o en la X para volver a la tabla</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ExerciseListProps {
  date: Date;
  exercises: any[];
  progress: Record<string, DailyProgress>;
  onToggle: (id: string, dateKey: string) => void;
  language: Language;
  sportName: string;
  onEditExercise: (id: string, field: string, value: string) => void;
  viewMode?: 'cards' | 'table';
  isCombined?: boolean;
  onSwap?: (id: string, forceNoEquipment?: boolean) => void;
  onFocus?: (ex: any) => void;
}

function ExerciseList({ 
  date, 
  exercises, 
  progress, 
  onToggle, 
  language, 
  sportName, 
  onEditExercise, 
  viewMode = 'cards',
  isCombined,
  onSwap,
  onFocus
}: ExerciseListProps) {
  const dateKey = format(date, 'yyyy-MM-dd');
  const dayProgress = progress[dateKey];
  const completed = dayProgress?.completedExercises || [];
  const isFinished = exercises.length > 0 && exercises.length === completed.length;

  if (exercises.length === 0) {
    return (
      <div className="bg-[#111318] border border-white/5 rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 text-white/20">
          <Clock size={32} />
        </div>
        <h4 className="text-xl font-headline font-black uppercase italic text-white/40">Día de Descanso / Actividad Libre</h4>
        <p className="text-sm text-on-surface-variant max-w-xs mt-2">Aprovecha hoy para recuperar o realizar alguna actividad ligera de movilidad.</p>
      </div>
    );
  }

  if (viewMode === 'table') {
    return (
      <Card className="bg-[#111318] border-none overflow-hidden rounded-[2.5rem] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/40 border-b border-white/5">
              <tr>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary">Visual</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary">Estado</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary">Deporte</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary">Ejercicio</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary text-center">Sets</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary text-center">Reps</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {exercises.map((ex, i) => {
                const isDone = completed.includes(ex.id);
                return (
                  <tr 
                    key={ex.id} 
                    onClick={() => onToggle(ex.id, dateKey)}
                    className={`group hover:bg-white/[0.02] transition-colors cursor-pointer ${isDone ? 'opacity-40' : ''}`}
                  >
                    <td className="p-4">
                      <div 
                        className="w-20 h-20 overflow-hidden rounded-xl bg-black border border-white/5 cursor-zoom-in hover:scale-105 active:scale-95 transition-transform"
                        onClick={(e) => { e.stopPropagation(); onFocus?.(ex); }}
                      >
                        <ExerciseAnimation 
                          type={ex.name} 
                          isDone={isDone} 
                          size="sm" 
                          muscleGroup={ex.muscleGroup} 
                          className="w-full h-full"
                        />
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex gap-2 justify-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => { e.stopPropagation(); onSwap?.(ex.id); }}
                            className="text-white/20 hover:text-primary transition-all"
                          >
                            <Icons.RefreshCw size={16} />
                          </Button>
                          {isDone ? <CheckCircle2 className="text-secondary" size={20} /> : <Circle className="text-white/20 group-hover:text-primary transition-colors" size={20} />}
                        </div>
                      </td>
                    <td className="p-6">
                      <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-tighter shrink-0 whitespace-nowrap">
                        {ex.sport || sportName}
                      </span>
                    </td>
                    <td className="p-6">
                      <h5 className={`font-headline font-black uppercase italic text-sm ${isDone ? 'line-through' : ''}`}>
                        {ex.name}
                      </h5>
                      <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest">{ex.muscleGroup}</span>
                    </td>
                    <td className="p-6 text-center">
                      <Input 
                        value={ex.sets}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onEditExercise(ex.id, 'sets', e.target.value)}
                        className="bg-transparent border-none text-center font-black p-0 h-auto w-10 focus-visible:ring-0"
                      />
                    </td>
                    <td className="p-6 text-center">
                       <Input 
                        value={ex.reps}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onEditExercise(ex.id, 'reps', e.target.value)}
                        className="bg-transparent border-none text-center font-black p-0 h-auto w-16 focus-visible:ring-0"
                      />
                    </td>
                    <td className="p-6 max-w-xs">
                      <p className="text-[10px] italic leading-tight text-on-surface-variant line-clamp-2">
                        {ex.notes || '-'}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 pb-32">
      {exercises.map((ex, i) => {
        const isDone = completed.includes(ex.id);
        const isInstructor = ex.isInstructorLed;

        return (
          <motion.div
            key={ex.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onToggle(ex.id, dateKey)}
            className="group relative bg-[#1a1614] border border-[#2d2420] rounded-2xl overflow-hidden hover:border-[#22c55e]/50 transition-all cursor-pointer shadow-xl mb-2 last:mb-0"
          >
            <div className="flex flex-col lg:flex-row p-6 gap-6">
              {/* Visual Animado — Larger and more prominent */}
              <div className="relative w-full lg:w-72 shrink-0">
                <ExerciseAnimation 
                  type={ex.name} 
                  isDone={isDone} 
                  muscleGroup={ex.muscleGroup}
                  size="lg"
                  className="rounded-2xl border border-white/5 shadow-2xl bg-black/40"
                />
                <div className="absolute top-2 left-2 flex gap-2">
                  <span className="bg-black/80 text-white text-[10px] font-black px-2 py-0.5 rounded-md border border-white/10">
                    #{i + 1}
                  </span>
                  <span className="bg-[#22c55e] text-black text-[10px] font-black px-2 py-0.5 rounded-md shadow-[0_2px_10px_rgba(34,197,94,0.3)] uppercase tracking-tighter">
                    {ex.sport || sportName || 'FITNESS'}
                  </span>
                </div>
                {ex.muscleGroup && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/10 uppercase tracking-tighter">
                      {ex.muscleGroup}
                    </span>
                  </div>
                )}
              </div>

              {/* Info Detallada */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-xl font-black text-white leading-tight uppercase group-hover:text-[#22c55e] transition-colors">
                      {ex.name}
                    </h4>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => { e.stopPropagation(); onSwap?.(ex.id); }}
                        className="w-8 h-8 rounded-full bg-white/5 text-white/40 hover:text-[#22c55e] hover:bg-[#22c55e]/10 transition-all"
                      >
                        <Icons.RefreshCw size={14} />
                      </Button>
                      <div
                        className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          isDone 
                            ? 'bg-[#22c55e] border-[#22c55e] text-black scale-110 shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                            : 'border-[#2d2420] text-transparent hover:border-[#22c55e]/50'
                        }`}
                      >
                        <CheckCircle2 size={18} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                      <span className="block text-[9px] text-[#8e7b71] font-bold uppercase mb-0.5">Series y Reps</span>
                      <span className="text-sm font-black text-white">{ex.sets} x {ex.reps}</span>
                    </div>
                    <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                      <span className="block text-[9px] text-[#8e7b71] font-bold uppercase mb-0.5">Descanso</span>
                      <span className="text-sm font-black text-[#22c55e]">{ex.restTime}s</span>
                    </div>
                  </div>
                </div>

                {/* Sección informativa enriquecida */}
                <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                  <details className="group/details">
                    <summary className="list-none cursor-pointer flex items-center justify-between text-xs font-bold text-[#8e7b71] hover:text-white transition-colors">
                      <div className="flex items-center gap-2">
                        <Info size={14} className="text-[#22c55e]" />
                        <span>CÓMO EJECUTAR</span>
                      </div>
                      <ChevronDown size={14} className="group-open/details:rotate-180 transition-transform" />
                    </summary>
                    <div className="mt-2 text-xs leading-relaxed text-[#b4a59d] bg-black/40 p-3 rounded-xl border border-white/5 animate-in fade-in slide-in-from-top-1">
                      <p className="mb-2 italic border-l-2 border-[#22c55e] pl-2">
                        {ex.notes || "Mantén el control en todo momento y no descuides la técnica."}
                      </p>
                      {ex.executionTip && (
                        <div className="flex gap-2">
                          <div className="w-1 h-auto bg-[#22c55e] rounded-full" />
                          <p className="text-[11px] leading-relaxed">
                            <span className="text-[#22c55e] font-black block mb-0.5 text-[9px]">TIP PRO:</span>
                            {ex.executionTip || ex.execution}
                          </p>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
      
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
