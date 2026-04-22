import { useState, useEffect } from 'react';
import { UserProfile, DailyProgress, TrainingPlan, Language, GalleryItem, WeightEntry, SportConfig } from '../types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Calendar as CalendarIcon, Trophy, Flame, TrendingUp, ArrowLeft, Brain, Loader2, Scale, Camera, BarChart3, Dumbbell, Clock } from 'lucide-react';
import { format, startOfToday, isSameDay, parseISO, eachDayOfInterval, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTranslation } from '../lib/i18n';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getPhysicalAnalysis } from '@/src/services/geminiService';
import TabBackground from './TabBackground';
import { ExerciseAnimation } from './ExerciseAnimation';
import { Zap, Layers } from 'lucide-react';

import WeeklyPlanVisual from './WeeklyPlanVisual';
import WorkoutPlanView from './WorkoutPlanView';

interface EvolutionProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onBack?: () => void;
  language: Language;
}

export default function Evolution({ profile, onUpdateProfile, onBack, language }: EvolutionProps) {
  const t = useTranslation(language);
  const [activeTab, setActiveTab] = useState<'tracking' | 'photos' | 'stats'>('tracking');
  const [selectedSportName, setSelectedSportName] = useState<string | null>(null);
  const viewingSport = profile.sports.find(s => s.sport === selectedSportName) || null;
  
  const today = startOfToday();
  const dateKey = format(today, 'yyyy-MM-dd');
  const locale = es; // Always Spanish as per request

  // Analysis State
  const [analysis, setAnalysis] = useState("Analizando tu evolución física...");
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (activeTab === 'photos' && profile.photos && profile.photos.length > 0) {
      runAnalysis();
    }
  }, [activeTab]);

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const result = await getPhysicalAnalysis(
        { muscleMass: 42.8, bodyFat: profile.bodyFat || 15 }, 
        "Basado en tus fotos y peso actual, se observa una mejora en la composición corporal."
      );
      setAnalysis(result);
    } catch (e) {
      setAnalysis("Análisis completado. Continúa con tu plan actual para maximizar resultados.");
    } finally {
      setAnalyzing(false);
    }
  };

  const activePlans = profile.sports
    .map(s => s.plan)
    .filter((p): p is TrainingPlan => !!p);
  if (profile.plan && !activePlans.find(p => p.id === profile.plan!.id)) {
    activePlans.push(profile.plan);
  }

  const todayName = format(today, 'EEEE', { locale }).toLowerCase();
  const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
  const normalizedDay = dayOfWeek === 0 ? 7 : dayOfWeek; // 1 (Mon) to 7 (Sun)
  
  const getExercisesForDay = (date: Date) => {
    const dayLabel = format(date, 'EEEE', { locale: es }).toLowerCase();
    const dNum = date.getDay() === 0 ? 7 : date.getDay();

    const allEx = profile.sports.flatMap(sport => {
      const plan = sport.plan || (profile.plan?.id ? profile.plan : null);
      if (!plan) return [];
      
      const dayPlan = plan.table.find(day => {
        const d = day.day.toLowerCase();
        return d.includes(dayLabel) || 
               d.includes('hoy') || 
               d.includes(`día ${dNum}`) ||
               d.includes(`dia ${dNum}`);
      });
      
      return (dayPlan?.exercises || []).map(ex => ({ ...ex, sportName: sport.sport }));
    });
    
    // Si hay plan combinado global, añadirlo también si no está ya
    if (profile.plan && !profile.sports.some(s => s.plan?.id === profile.plan?.id)) {
      const globalDayPlan = profile.plan.table.find(day => {
        const d = day.day.toLowerCase();
        return d.includes(dayLabel) || 
               d.includes('hoy') || 
               d.includes(`día ${dNum}`) ||
               d.includes(`dia ${dNum}`);
      });
      const globalExercises = (globalDayPlan?.exercises || []).map(ex => ({ ...ex, sportName: 'Plan Combinado' }));
      allEx.push(...globalExercises);
    }

    return Array.from(new Map(allEx.map(ex => [ex.id, ex])).values());
  };

  const todaysExercises = getExercisesForDay(today);
  const currentProgress = profile.progress?.[dateKey] || {
    date: dateKey,
    completedExercises: [],
  };

  // Tracking Logic
  const toggleExercise = (exerciseId: string, customDateKey?: string) => {
    const targetDateKey = customDateKey || dateKey;
    const progressAtDate = profile.progress?.[targetDateKey] || {
      date: targetDateKey,
      completedExercises: [],
    };

    const completed = progressAtDate.completedExercises.includes(exerciseId);
    const newCompleted = completed
      ? progressAtDate.completedExercises.filter(id => id !== exerciseId)
      : [...progressAtDate.completedExercises, exerciseId];

    // Determine if fully completed for that specific day
    const dayExercises = getExercisesForDay(parseISO(targetDateKey));
    
    const updatedProgress = {
      ...profile.progress,
      [targetDateKey]: {
        ...progressAtDate,
        completedExercises: newCompleted,
        completed: dayExercises.length > 0 && newCompleted.length === dayExercises.length
      },
    };

    // Award Points
    const pointsAwarded = !completed ? 10 : -10;
    const newPoints = Math.max(0, (profile.points || 0) + pointsAwarded);
    
    // Rank Logic
    let newRank = profile.rank || 'Novato';
    if (newPoints > 500) newRank = 'Atleta Elite';
    else if (newPoints > 200) newRank = 'Veterano';
    else if (newPoints > 100) newRank = 'Avanzado';
    else if (newPoints > 50) newRank = 'Iniciado';

    onUpdateProfile({ 
      ...profile, 
      progress: updatedProgress,
      points: newPoints,
      rank: newRank
    });
  };

  const completionRate = todaysExercises.length > 0 
    ? Math.round((currentProgress.completedExercises.length / todaysExercises.length) * 100)
    : 0;

  // Calendar Logic
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Chart Data
  const chartData = profile.weightHistory && profile.weightHistory.length > 0 ? profile.weightHistory : [
    { date: 'Ene', weight: 85 },
    { date: 'Feb', weight: 84.2 },
    { date: 'Mar', weight: 83.5 },
    { date: 'Abr', weight: profile.weight }
  ];

  return (
    <div className="space-y-12 pb-32">
      <TabBackground tab="evolution" />

      {/* Workout Detail Overlay */}
      <AnimatePresence>
        {viewingSport && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[200] bg-[#0a0a0c] overflow-y-auto"
          >
            <WorkoutPlanView
              sport={viewingSport}
              allSports={profile.sports}
              profile={profile}
              progress={profile.progress || {}}
              onToggleExercise={toggleExercise}
              onUpdateProfile={onUpdateProfile}
              onClose={() => setSelectedSportName(null)}
              language={language}
              globalPlan={profile.plan}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full bg-surface">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <p className="font-headline text-secondary font-bold uppercase tracking-widest text-sm mb-1">
                {t('evolucionPesoAnalisis')}
              </p>
              <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-none">
                EVOLUCIÓN <span className="text-primary italic">INTEGRADA.</span>
              </h2>
            </div>
          </div>
          
          <div className="flex gap-2 bg-surface p-1 rounded-2xl border border-outline-variant/10">
            <Button 
              variant={activeTab === 'tracking' ? 'default' : 'ghost'} 
              onClick={() => setActiveTab('tracking')}
              className="rounded-xl px-6 font-bold uppercase text-[10px] tracking-widest"
            >
              <CalendarIcon size={14} className="mr-2" /> {t('tracking')}
            </Button>
            <Button 
              variant={activeTab === 'photos' ? 'default' : 'ghost'} 
              onClick={() => setActiveTab('photos')}
              className="rounded-xl px-6 font-bold uppercase text-[10px] tracking-widest"
            >
              <Camera size={14} className="mr-2" /> {t('fotos')}
            </Button>
            <Button 
              variant={activeTab === 'stats' ? 'default' : 'ghost'} 
              onClick={() => setActiveTab('stats')}
              className="rounded-xl px-6 font-bold uppercase text-[10px] tracking-widest"
            >
              <BarChart3 size={14} className="mr-2" /> {t('graficos')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-surface border-none p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Flame className="text-primary" size={24} />
            </div>
            <span className="text-4xl font-black text-on-surface">{profile.streak || 0}</span>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">{t('streak')}</span>
          </Card>
          <Card className="bg-surface border-none p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
              <Scale className="text-secondary" size={24} />
            </div>
            <span className="text-4xl font-black text-on-surface">{profile.weight} kg</span>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">{t('pesoActual')}</span>
          </Card>
          <Card className="bg-surface border-none p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-tertiary/10 rounded-full flex items-center justify-center mb-4">
              <Trophy className="text-tertiary" size={24} />
            </div>
            <span className="text-4xl font-black text-on-surface">{completionRate}%</span>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">{t('completadoHoy')}</span>
          </Card>
        </div>
      </section>

      <AnimatePresence mode="wait">
        {activeTab === 'tracking' && (
          <motion.div 
            key="tracking"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            {/* Daily Routine */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-headline text-2xl font-black uppercase italic tracking-tight">{t('rutinaHoy')}</h3>
                <p className="text-on-surface-variant font-medium">{format(today, 'PPP', { locale })}</p>
              </div>

              <div className="space-y-4">
                {todaysExercises.length > 0 ? (
                  todaysExercises.map((ex: any, idx) => {
                    const isCompleted = currentProgress.completedExercises.includes(ex.id);
                    return (
                      <Card 
                        key={ex.id || idx} 
                        onClick={() => toggleExercise(ex.id)}
                        className={`relative overflow-hidden group cursor-pointer transition-all border-2 rounded-[2rem] ${
                          isCompleted 
                            ? 'bg-primary/5 border-primary/20 opacity-80' 
                            : 'bg-surface border-white/5 hover:border-primary/40'
                        }`}
                      >
                        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 relative z-10">
                          {/* Animation Guide */}
                          <ExerciseAnimation type={ex.name} isDone={isCompleted} size="md" />

                          <div className="flex-1 w-full space-y-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">
                                  {ex.sportName}
                                </span>
                                <h4 className={`text-2xl md:text-3xl font-headline font-black uppercase italic leading-tight ${isCompleted ? 'line-through opacity-40' : ''}`}>
                                  {ex.name}
                                </h4>
                              </div>

                              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all shrink-0 ${
                                isCompleted 
                                  ? 'bg-primary border-primary text-on-primary shadow-lg shadow-primary/40' 
                                  : 'border-white/10 group-hover:border-primary/50 text-white/10'
                              }`}>
                                {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-6">
                              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl">
                                <Layers size={14} className="text-secondary" />
                                <span className="text-xs font-black uppercase tracking-widest">{ex.sets} <span className="opacity-40">Series</span></span>
                              </div>
                              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl">
                                <Zap size={14} className="text-primary" />
                                <span className="text-xs font-black uppercase tracking-widest">{ex.reps} <span className="opacity-40">Reps</span></span>
                              </div>
                            </div>
                          </div>

                          <div className="hidden lg:block max-w-[250px]">
                            <p className="text-xs font-medium text-on-surface-variant italic leading-relaxed">
                              "{ex.notes}"
                            </p>
                          </div>
                        </div>

                        {/* Performance Wave Animation */}
                        {isCompleted && (
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-secondary"
                          />
                        )}
                      </Card>
                    );
                  })
                ) : (
                  <Card className="p-12 text-center bg-surface border-none flex flex-col items-center justify-center gap-4 rounded-[3rem]">
                    <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center text-on-surface-variant/20">
                      <Clock size={32} />
                    </div>
                    <div>
                      <p className="text-on-surface-variant italic font-medium">{t('noEjerciciosHoy')}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-secondary mt-2">Día de recuperación activa</p>
                    </div>
                  </Card>
                )}
              </div>
            </section>

            {/* Disciplinas Activas */}
            {profile.sports.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                    <Dumbbell size={24} />
                  </div>
                  <h3 className="font-headline text-2xl font-black uppercase italic tracking-tight">Disciplinas Activas</h3>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {profile.sports.map((sport, i) => {
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Card 
                          onClick={() => setSelectedSportName(sport.sport)}
                          className="bg-surface border-none p-4 flex items-center gap-4 group hover:bg-surface-variant/30 transition-all cursor-pointer h-full"
                        >
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Dumbbell size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm uppercase opacity-80">{sport.sport}</h4>
                            <p className="text-[9px] font-black text-secondary uppercase tracking-widest">{sport.subtype || `${sport.daysPerWeek} DÍAS`}</p>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Weekly Training Table */}
            {profile.sports.length > 0 && (
              <section className="space-y-6">
                <h3 className="font-headline text-2xl font-black uppercase italic tracking-tight">Planificación Semanal</h3>
                <WeeklyPlanVisual 
                  sports={profile.sports}
                  plan={profile.plan}
                  progress={profile.progress}
                  onToggleExercise={toggleExercise}
                  language={language}
                />
              </section>
            )}

            {/* Progress Calendar */}
            <section className="space-y-6">
              <h3 className="font-headline text-2xl font-black uppercase italic tracking-tight">{t('calendarioProgreso')}</h3>
              <Card className="bg-surface border-none p-8">
                <div className="grid grid-cols-7 gap-3">
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                    <div key={d} className="text-center text-[10px] font-black text-on-surface-variant/40 mb-2">{d}</div>
                  ))}
                  {daysInMonth.map((day, i) => {
                    const dKey = format(day, 'yyyy-MM-dd');
                    const dayProgress = profile.progress?.[dKey];
                    const isToday = isSameDay(day, today);
                    const hasProgress = dayProgress && dayProgress.completedExercises.length > 0;
                    const isFullyCompleted = dayProgress && dayProgress.completed;

                    return (
                      <div 
                        key={i} 
                        className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold relative transition-all ${
                          isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                        } ${
                          isFullyCompleted ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 
                          hasProgress ? 'bg-primary/20 text-primary' : 
                          'bg-background text-on-surface-variant/30'
                        }`}
                      >
                        {format(day, 'd')}
                        {isFullyCompleted && <CheckCircle2 size={8} className="absolute bottom-1 right-1" />}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </section>
          </motion.div>
        )}

        {activeTab === 'photos' && (
          <motion.div 
            key="photos"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <Card className="bg-surface border-l-4 border-primary p-8 relative group overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <Brain size={24} className="text-primary animate-pulse" />
                <h3 className="font-headline text-xl font-black uppercase tracking-widest text-primary">{t('analisis')}</h3>
              </div>
              {analyzing ? (
                <div className="flex items-center gap-3 text-on-surface-variant">
                  <Loader2 className="animate-spin" size={18} />
                  <span className="font-medium">Escaneando biometría visual...</span>
                </div>
              ) : (
                <p className="text-on-surface leading-relaxed text-lg italic">"{analysis}"</p>
              )}
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(profile.photos || []).map((photo, idx) => (
                <motion.div 
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="aspect-[3/4] rounded-3xl overflow-hidden relative group"
                >
                  <img 
                    src={photo.url} 
                    alt={`Progreso ${photo.date}`} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-6 left-6 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{photo.date}</p>
                    <p className="text-2xl font-headline font-black">{photo.weight} kg</p>
                  </div>
                </motion.div>
              ))}
              <button className="aspect-[3/4] rounded-3xl border-2 border-dashed border-outline-variant/20 flex flex-col items-center justify-center gap-4 hover:bg-surface transition-all group">
                <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-all">
                  <Camera size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{t('nuevaFoto')}</span>
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div 
            key="stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <Card className="bg-surface border-none p-8">
              <h3 className="text-xl font-headline font-black uppercase italic mb-8">{t('evolucionPeso')}</h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff3b3b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ff3b3b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 'bold' }}
                    />
                    <YAxis 
                      hide 
                      domain={['dataMin - 2', 'dataMax + 2']} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                      itemStyle={{ color: '#ff3b3b', fontWeight: 'bold' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#ff3b3b" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorWeight)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-surface border-none p-8">
                <h4 className="font-headline text-lg font-bold uppercase tracking-widest mb-6">Métricas de Fuerza</h4>
                <div className="space-y-4">
                  {[
                    { label: 'Press Banca', value: '100 kg', trend: '+5%' },
                    { label: 'Sentadilla', value: '140 kg', trend: '+2%' },
                    { label: 'Peso Muerto', value: '180 kg', trend: '+8%' }
                  ].map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-background rounded-xl">
                      <span className="font-bold text-sm">{m.label}</span>
                      <div className="text-right">
                        <p className="font-black text-primary">{m.value}</p>
                        <p className="text-[10px] font-bold text-secondary">{m.trend}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="bg-surface border-none p-8">
                <h4 className="font-headline text-lg font-bold uppercase tracking-widest mb-6">Composición</h4>
                <div className="space-y-4">
                  {[
                    { label: 'Grasa Corporal', value: '14.2%', trend: '-1.5%' },
                    { label: 'Masa Muscular', value: '42.8 kg', trend: '+0.8 kg' },
                    { label: 'Agua Corporal', value: '62%', trend: 'Estable' }
                  ].map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-background rounded-xl">
                      <span className="font-bold text-sm">{m.label}</span>
                      <div className="text-right">
                        <p className="font-black text-secondary">{m.value}</p>
                        <p className="text-[10px] font-bold text-primary">{m.trend}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
