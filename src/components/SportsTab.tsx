import { useState, useEffect } from 'react';
import { UserProfile, SportConfig, TrainingPlan, Language, Sport } from '../types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateTrainingPlan, generateCombinedTrainingPlan } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, Target, Loader2, Search, ChevronRight, Info, 
  ArrowLeft, Bike, Waves, Zap, Heart, Activity, 
  Flame, Timer, Trophy, Calendar, Footprints, Sword, 
  Mountain, Wind, Anchor, MountainSnow, Palette,
  Plus, Trash2, RotateCcw, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTranslation } from '../lib/i18n';
import { subscribeToSports } from '../services/sports';
import SportsList from './SportsList';
import { useStore } from '../store/useStore';
import TabBackground from './TabBackground';

const SPORT_ICONS: Record<string, any> = {
  "Dumbbell": Dumbbell,
  "Bike": Bike,
  "Waves": Waves,
  "Footprints": Footprints,
  "Flame": Flame,
  "Heart": Heart,
  "Trophy": Trophy,
  "Timer": Timer,
  "Activity": Activity,
  "Mountain": Mountain,
  "Wind": Wind,
  "Sword": Sword,
  "Anchor": Anchor,
  "MountainSnow": MountainSnow,
  "Palette": Palette
};

const SportImage = ({ iconName, className }: { iconName: string, className?: string }) => {
  const Icon = SPORT_ICONS[iconName] || Activity;
  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-3xl bg-surface-variant/20 group ${className}`}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.5 }}
      >
        <Icon size={120} className="text-on-surface/10 grayscale" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
    </div>
  );
};

const GOALS_BY_SPORT: Record<string, string[]> = {
  "Musculación": ["Ganar Masa Muscular", "Definición", "Fuerza Máxima", "Mantenimiento"],
  "Ciclismo": ["Resistencia", "Velocidad", "Pérdida de Peso", "Preparación Carrera"],
  "Running": ["Maratón", "5k/10k", "Quema de Grasa", "Resistencia Cardiovascular"],
  "default": ["Mejora de Rendimiento", "Salud General", "Pérdida de Peso", "Fuerza y Tonificación"]
};

export default function SportsTab({ profile, onUpdateProfile, onBack, language }: { profile: UserProfile, onUpdateProfile: (p: UserProfile) => void, onBack?: () => void, language: Language }) {
  const t = useTranslation(language);
  const [search, setSearch] = useState('');
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [step, setStep] = useState<'list' | 'goal' | 'frequency' | 'combined'>('list');
  const [currentConfig, setCurrentConfig] = useState<Partial<SportConfig>>({});
  const [selectedSportsList, setSelectedSportsList] = useState<string[]>([]);
  const [configQueue, setConfigQueue] = useState<string[]>([]);
  const [currentConfigIndex, setCurrentConfigIndex] = useState(0);
  const [allConfigs, setAllConfigs] = useState<SportConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [activePlan, setActivePlan] = useState<TrainingPlan | null>(null);

  useEffect(() => {
    if (profile?.sports) {
      console.log("[SPORTS] Profile updated from parent, count:", profile.sports.length);
    }
  }, [profile?.sports]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setSelectedSportsList(profile.sports.map(s => s.sport));
    }
  }, [profile?.sports]);

  useEffect(() => {
    console.log("[SPORTS] Subscribing to sports...");
    const unsubscribe = subscribeToSports((data) => {
      console.log(`[SPORTS] Received ${data.length} sports from Firestore.`);
      setSports(data);
      if (data.length > 0) setLoadTimeout(false);
    }, (error) => {
      console.error("[SPORTS] Failed to subscribe to sports:", error);
      setError(`Error de suscripción a datos: ${error.message}`);
    });
    return () => unsubscribe();
  }, []);

  if (!profile) return null;

  const handleSportToggle = (sportName: string) => {
    setSelectedSportsList(prev => {
      const exists = prev.includes(sportName);
      if (exists) return prev.filter(s => s !== sportName);
      return [...new Set([...prev, sportName])];
    });
  };

  const generatePlan = (sportsConfigs: SportConfig[]): TrainingPlan => {
    const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    let i = 0;
    const table = days.map(day => {
      const config = sportsConfigs[i++ % sportsConfigs.length];
      const existingExercises = config.plan?.table.find(d => d.day.includes(day))?.exercises || [
        { id: `ex-${day}-1`, name: `Entrenamiento de ${config.sport}`, sets: '4', reps: '12', notes: 'Enfoque en técnica' }
      ];

      return {
        day,
        exercises: existingExercises
      };
    });

    return {
      id: `plan-${Date.now()}`,
      createdAt: new Date().toISOString(),
      reasoning: `Plan combinado alternando entre ${sportsConfigs.map(s => s.sport).join(' y ')}.`,
      table
    };
  };

  const [showSuccess, setShowSuccess] = useState(false);

  const addSport = async (newConfigs: SportConfig[], isCombined: boolean) => {
    if (!profile?.uid) {
      setError("Usuario no autenticado");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Partir SIEMPRE del perfil actual en memoria (ya sincronizado por onSnapshot)
      let currentSports = [...(profile.sports || [])];

      newConfigs.forEach(newSport => {
        const index = currentSports.findIndex(s => s.sport === newSport.sport);
        if (index !== -1) {
          currentSports[index] = { ...currentSports[index], ...newSport };
        } else {
          currentSports.push(newSport);
        }
      });

      let globalPlan: TrainingPlan | undefined;

      if (isCombined || currentSports.length > 1) {
        try {
          globalPlan = await generateCombinedTrainingPlan(profile, currentSports, language);
        } catch {
          globalPlan = generatePlan(currentSports);
        }
        currentSports = currentSports.map(s => ({ ...s, plan: globalPlan, isCombined: true }));
      } else {
        const config = newConfigs[0];
        globalPlan = await generateTrainingPlan(profile, config, language);
        currentSports = currentSports.map(s =>
          s.sport === config.sport ? { ...s, plan: globalPlan, isCombined: false } : s
        );
      }

      const updatedProfile: UserProfile = { ...profile, sports: currentSports, plan: globalPlan };
      console.log("[SPORTS] Enviando perfil actualizado con deportes:", currentSports.map(s => s.sport));
      await onUpdateProfile(updatedProfile);

      console.log("[SPORTS] Guardado confirmado por el padre.");
      setShowSuccess(true);
      setSelectedSportsList([]); 
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      console.error("[SPORTS] ERROR CRÍTICO:", err);
      setError(`FALLO AL GUARDAR: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const startConfiguration = (configs: SportConfig[], isCombined: boolean) => {
    if (configs.length === 0) return;
    addSport(configs, isCombined);
  };

  const removeSport = (sportName: string) => {
    const updatedSports = profile.sports.filter(s => s.sport !== sportName);
    onUpdateProfile({ ...profile, sports: updatedSports });
  };

  const goBack = () => {
    if (activePlan) setActivePlan(null);
    else if (onBack) onBack();
  };

  const getIcon = (iconName: string) => SPORT_ICONS[iconName] || SPORT_ICONS.Activity;

  const [loadTimeout, setLoadTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (sports.length === 0) setLoadTimeout(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [sports]);

  const handleRetry = () => {
    window.location.reload();
  };

  if (sports.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6">
        {!loadTimeout ? (
          <>
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-on-surface-variant font-black uppercase tracking-widest text-sm animate-pulse">
              {language === 'es' ? 'Cargando disciplinas...' : 'Loading disciplines...'}
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
              <ShieldAlert size={32} />
            </div>
            <div className="text-center space-y-2">
              <p className="text-on-surface font-bold uppercase tracking-widest text-sm">
                Error de Conexión
              </p>
              <p className="text-xs text-on-surface-variant max-w-[200px]">
                No se han podido cargar los deportes. Esto puede deberse a la migración de base de datos.
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleRetry}
              className="bg-white/5 border-primary/20 text-primary font-black uppercase tracking-widest hover:bg-primary/10"
            >
              Reintentar Carga
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-32">
      <TabBackground tab="sports" />
      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={goBack} className="rounded-full bg-surface">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <p className="font-headline text-secondary font-bold uppercase tracking-widest text-sm mb-1">
                {t('laboratorioDisciplinas')}
              </p>
              <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-none">
                {t('misDeportes').split(' ')[0]} <span className="text-primary italic">{t('misDeportes').split(' ')[1]}.</span>
              </h2>
            </div>
          </div>
        </div>
      </section>

      {showSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] bg-secondary text-background px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-2xl flex items-center gap-3"
        >
          <CheckCircle2 className="text-primary" />
          {language === 'es' ? 'DEPORTE AÑADIDO' : 'SPORT ADDED'}
        </motion.div>
      )}

      {error && (
        <Card className="bg-destructive/10 border-destructive/20 p-4 rounded-2xl flex items-center justify-between gap-4">
          <p className="text-destructive text-sm font-bold uppercase tracking-widest">{error}</p>
          <Button variant="ghost" size="icon" onClick={() => setError(null)} className="rounded-full hover:bg-destructive/20">
            <RotateCcw size={16} className="text-destructive" />
          </Button>
        </Card>
      )}

      {/* Active Sports Section */}
      {!activePlan && !loading && profile.sports.length > 0 && (
        <section className="space-y-6">
          <h3 className="font-headline text-2xl font-black uppercase italic tracking-tight">{t('tusDeportesActivos')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.sports.map((s, idx) => (
                    <Card key={idx} className="bg-surface border-none p-6 flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                          {(() => {
                            const Icon = getIcon(s.sport); // Use helper or find in list
                            return <Icon className="text-primary" size={24} />;
                          })()}
                        </div>
                        <div>
                          <h4 className="font-headline font-bold text-lg uppercase">{s.sport}</h4>
                          <div className="flex gap-2 items-center">
                            <p className="text-xs text-on-surface-variant font-black uppercase tracking-widest">{s.daysPerWeek} {t('activos').toLowerCase()}</p>
                            <span className="w-1 h-1 bg-outline-variant rounded-full" />
                            <p className="text-[10px] font-bold text-primary uppercase">{s.goal} {s.subtype ? `(${s.subtype})` : ''}</p>
                          </div>
                        </div>
                      </div>
                      <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeSport(s.sport)}
                  className="text-on-surface-variant hover:text-destructive hover:bg-destructive/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={18} />
                </Button>
              </Card>
            ))}
          </div>
        </section>
      )}

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-on-surface-variant font-medium">
              {language === 'es' 
                ? `La IA está diseñando tu plan de entrenamiento...` 
                : `La IA está diseñando tu plan de entrenamiento...`}
            </p>
          </motion.div>
        ) : activePlan ? (
          <motion.div key="plan" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-2xl font-black text-primary uppercase italic">{t('planGenerado')}</h3>
              <Button variant="outline" onClick={() => setActivePlan(null)} className="rounded-full">{t('cambiarDeporte')}</Button>
            </div>
            <Card className="bg-surface border-l-4 border-secondary p-8 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <Info className="text-secondary" />
                <h3 className="font-headline text-xl font-bold text-secondary uppercase tracking-widest">{t('razonamiento')}</h3>
              </div>
              <p className="text-on-surface leading-relaxed text-lg italic">"{activePlan.reasoning}"</p>
            </Card>
            <div className="grid grid-cols-1 gap-6">
              {activePlan.table.map((day, idx) => (
                <Card key={idx} className="bg-surface border-none p-6">
                  <h4 className="font-headline text-xl font-bold text-primary mb-6">{day.day}</h4>
                  <div className="space-y-4">
                    {day.exercises.map((ex, exIdx) => (
                      <div key={exIdx} className="flex items-center gap-4 p-4 bg-background rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-secondary font-bold">{exIdx + 1}</div>
                        <div className="flex-1">
                          <p className="font-bold">{ex.name}</p>
                          <p className="text-xs text-on-surface-variant">{ex.sets} x {ex.reps}</p>
                        </div>
                        <p className="text-[10px] text-on-surface-variant italic max-w-[200px] text-right">{ex.notes}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="space-y-8">
            <h3 className="font-headline text-2xl font-black uppercase italic tracking-tight">{t('laboratorioDisciplinas')}</h3>
            <SportsList 
              sports={sports} 
              selectedSportNames={selectedSportsList}
              savedSportNames={profile.sports.map(s => s.sport)}
              onSelect={handleSportToggle}
              onConfirm={startConfiguration}
              language={language}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
