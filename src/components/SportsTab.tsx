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
  Plus, Trash2, RotateCcw
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTranslation } from '../lib/i18n';
import { subscribeToSports } from '../services/sports';
import SportsList from './SportsList';
import { useStore } from '../store/useStore';

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

export default function SportsTab({ onUpdateProfile, onBack, language }: { onUpdateProfile: (p: UserProfile) => void, onBack?: () => void, language: Language }) {
  const t = useTranslation(language);
  const { profile } = useStore();
  const [search, setSearch] = useState('');
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [step, setStep] = useState<'list' | 'goal' | 'frequency' | 'combined'>('list');
  const [currentConfig, setCurrentConfig] = useState<Partial<SportConfig>>({});
  const [selectedSportsList, setSelectedSportsList] = useState<string[]>(profile?.sports.map(s => s.sport) || []);
  const [configQueue, setConfigQueue] = useState<string[]>([]);
  const [currentConfigIndex, setCurrentConfigIndex] = useState(0);
  const [allConfigs, setAllConfigs] = useState<SportConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [activePlan, setActivePlan] = useState<TrainingPlan | null>(null);
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
    }, (error) => {
      console.error("[SPORTS] Failed to subscribe to sports:", error);
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

  const startConfiguration = (configs: SportConfig[], isCombined: boolean) => {
    if (configs.length === 0) return;
    finalizePlans(configs, isCombined);
  };

  const finalizePlans = async (configs: SportConfig[], isCombined: boolean) => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Obtener deportes actuales evitando duplicados por nombre
      const currentSports = [...(profile.sports || [])];
      let updatedSports: SportConfig[] = [...currentSports];
      
      // 2. Integrar nuevos configs
      configs.forEach(newConfig => {
        const existingIdx = updatedSports.findIndex(s => s.sport === newConfig.sport);
        if (existingIdx >= 0) {
          updatedSports[existingIdx] = { ...updatedSports[existingIdx], ...newConfig };
        } else {
          updatedSports.push(newConfig);
        }
      });

      let globalPlan: TrainingPlan | undefined;
      
      if (isCombined) {
        // Generar plan combinado para TODOS los deportes seleccionados
        console.log("[SPORTS] Generating combined plan for:", updatedSports.map(s => s.sport));
        const combinedPlan = await generateCombinedTrainingPlan(profile, updatedSports, language);
        
        // Asignar el mismo plan combinado a todos y marcar como combinados
        updatedSports = updatedSports.map(s => ({ 
          ...s, 
          plan: combinedPlan, 
          isCombined: true 
        }));
        globalPlan = combinedPlan;
        setActivePlan(combinedPlan);
      } else {
        // Generar planes individuales solo para los deportes que no tienen o son nuevos
        for (let i = 0; i < updatedSports.length; i++) {
          const config = updatedSports[i];
          // Solo generamos si es uno de los nuevos o si no tiene plan
          if (configs.some(c => c.sport === config.sport) || !config.plan) {
            console.log("[SPORTS] Generating individual plan for:", config.sport);
            const plan = await generateTrainingPlan(profile, config, language);
            updatedSports[i] = { ...config, plan, isCombined: false };
            setActivePlan(plan);
          }
        }
      }
      
      // 3. PERSISTENCIA TOTAL: Guardar en el perfil y en el campo 'plan' global
      const newProfile = { 
        ...profile, 
        sports: updatedSports, 
        plan: globalPlan || updatedSports[updatedSports.length - 1]?.plan 
      };
      
      console.log("[SPORTS] Persisting to Firestore...");
      await onUpdateProfile(newProfile);
      console.log("[SPORTS] Save complete.");
    } catch (err: any) {
      console.error("[SPORTS] Error in finalizePlans:", err);
      setError(err.message || "Error al procesar los deportes.");
    } finally {
      setLoading(false);
      setSelectedSport(null);
      setAllConfigs([]);
      setConfigQueue([]);
    }
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

  if (sports.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-on-surface-variant font-black uppercase tracking-widest text-sm">
          {language === 'es' ? 'Cargando disciplinas...' : 'Cargando disciplinas...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-32">
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
                    <Dumbbell className="text-primary" size={24} />
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-lg uppercase">{s.sport}</h4>
                    <p className="text-xs text-on-surface-variant">{s.daysPerWeek} {t('activos').toLowerCase()} • {s.goal} {s.subtype ? `(${s.subtype})` : ''}</p>
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
