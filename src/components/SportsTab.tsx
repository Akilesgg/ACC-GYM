import { useState, useEffect } from 'react';
import { UserProfile, SportConfig, TrainingPlan, Language, Sport } from '../types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateTrainingPlan } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, Target, Loader2, Search, ChevronRight, Info, 
  ArrowLeft, Bike, Waves, Zap, Heart, Activity, 
  Flame, Timer, Trophy, Calendar, Footprints, Sword, 
  Mountain, Wind, Anchor, MountainSnow, Palette,
  Plus, Trash2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTranslation } from '../lib/i18n';
import { getSports } from '../services/sports';

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

const GOALS_BY_SPORT: Record<string, string[]> = {
  "Musculación": ["Ganar Masa Muscular", "Definición", "Fuerza Máxima", "Mantenimiento"],
  "Ciclismo": ["Resistencia", "Velocidad", "Pérdida de Peso", "Preparación Carrera"],
  "Running": ["Maratón", "5k/10k", "Quema de Grasa", "Resistencia Cardiovascular"],
  "default": ["Mejora de Rendimiento", "Salud General", "Pérdida de Peso", "Fuerza y Tonificación"]
};

interface SportsTabProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onBack?: () => void;
  language: Language;
}

export default function SportsTab({ profile, onUpdateProfile, onBack, language }: SportsTabProps) {
  const t = useTranslation(language);
  const [search, setSearch] = useState('');
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [step, setStep] = useState<'list' | 'goal' | 'frequency' | 'combined'>('list');
  const [currentConfig, setCurrentConfig] = useState<Partial<SportConfig>>({});
  const [loading, setLoading] = useState(false);
  const [activePlan, setActivePlan] = useState<TrainingPlan | null>(null);

  useEffect(() => {
    const loadSports = async () => {
      const data = await getSports();
      setSports(data);
    };
    loadSports();
  }, []);

  const filteredSports = sports.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const handleSportSelect = (sport: Sport) => {
    setSelectedSport(sport);
    setCurrentConfig({ sport: sport.name });
    setStep('goal');
  };

  const handleGoalSelect = (goal: string) => {
    setCurrentConfig(prev => ({ ...prev, goal }));
    setStep('frequency');
  };

  const handleFrequencySelect = (days: number) => {
    setCurrentConfig(prev => ({ ...prev, daysPerWeek: days }));
    if (profile.selectedSports.length > 0) {
      setStep('combined');
    } else {
      finalizePlan({ ...currentConfig, daysPerWeek: days } as SportConfig);
    }
  };

  const handleCombinedSelect = (isCombined: boolean) => {
    finalizePlan({ ...currentConfig, isCombined } as SportConfig);
  };

  const finalizePlan = async (config: SportConfig) => {
    setLoading(true);
    setStep('list');
    
    try {
      const plan = await generateTrainingPlan(profile, config);
      setActivePlan(plan);
      
      const existingIdx = profile.selectedSports.findIndex(s => s.sport === config.sport);
      const updatedSports = [...profile.selectedSports];
      if (existingIdx >= 0) {
        updatedSports[existingIdx] = { ...config, plan };
      } else {
        updatedSports.push({ ...config, plan });
      }
      onUpdateProfile({ ...profile, selectedSports: updatedSports });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setSelectedSport(null);
    }
  };

  const removeSport = (sportName: string) => {
    const updatedSports = profile.selectedSports.filter(s => s.sport !== sportName);
    onUpdateProfile({ ...profile, selectedSports: updatedSports });
  };

  const goBack = () => {
    if (step === 'goal') setStep('list');
    else if (step === 'frequency') setStep('goal');
    else if (step === 'combined') setStep('frequency');
    else if (activePlan) setActivePlan(null);
    else if (onBack) onBack();
  };

  const getIcon = (iconName: string) => SPORT_ICONS[iconName] || SPORT_ICONS.Activity;

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
                Laboratorio de Disciplinas
              </p>
              <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-none">
                MIS <span className="text-primary italic">DEPORTES.</span>
              </h2>
            </div>
          </div>
          {step === 'list' && !activePlan && !loading && (
            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant" size={20} />
              <Input 
                placeholder="Buscar deporte..." 
                className="bg-surface border-none pl-12 h-12 rounded-full"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          )}
        </div>
      </section>

      {/* Active Sports Section */}
      {step === 'list' && !activePlan && !loading && profile.selectedSports.length > 0 && (
        <section className="space-y-6">
          <h3 className="font-headline text-2xl font-black uppercase italic tracking-tight">Tus Deportes Activos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.selectedSports.map((s, idx) => (
              <Card key={idx} className="bg-surface border-none p-6 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Dumbbell className="text-primary" size={24} />
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-lg uppercase">{s.sport}</h4>
                    <p className="text-xs text-on-surface-variant">{s.daysPerWeek} días/semana • {s.goal}</p>
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
            <p className="text-on-surface-variant font-medium">La IA está diseñando tu plan de {selectedSport?.name}...</p>
          </motion.div>
        ) : step === 'goal' ? (
          <motion.div key="goal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-tertiary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="text-tertiary" size={32} />
              </div>
              <h3 className="text-3xl font-headline font-black text-on-surface">{selectedSport?.name.toUpperCase()}</h3>
              <p className="text-on-surface-variant mt-2">{t('cualEsObjetivo')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(GOALS_BY_SPORT[selectedSport?.name!] || GOALS_BY_SPORT["default"]).map(goal => (
                <Button key={goal} variant="outline" onClick={() => handleGoalSelect(goal)} className="h-20 rounded-2xl border-outline-variant/20 hover:border-tertiary/50 hover:bg-tertiary/5 transition-all font-bold text-lg">
                  {goal}
                </Button>
              ))}
            </div>
          </motion.div>
        ) : step === 'frequency' ? (
          <motion.div key="frequency" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-primary" size={32} />
              </div>
              <h3 className="text-3xl font-headline font-black text-on-surface">FRECUENCIA</h3>
              <p className="text-on-surface-variant mt-2">¿Cuántos días a la semana vas a practicar {selectedSport?.name}?</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7].map(days => (
                <Button key={days} variant="outline" onClick={() => handleFrequencySelect(days)} className="h-20 rounded-2xl border-outline-variant/20 hover:border-primary/50 hover:bg-primary/5 transition-all font-bold text-2xl">
                  {days}
                </Button>
              ))}
            </div>
          </motion.div>
        ) : step === 'combined' ? (
          <motion.div key="combined" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="text-secondary" size={32} />
              </div>
              <h3 className="text-3xl font-headline font-black text-on-surface">PLAN COMBINADO</h3>
              <p className="text-on-surface-variant mt-2">Ya tienes otros deportes. ¿Quieres que la IA cree un plan combinado que los integre todos?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => handleCombinedSelect(true)} className="h-24 rounded-2xl border-secondary/30 hover:bg-secondary/10 font-bold text-lg flex flex-col">
                <span>Sí, combinar planes</span>
                <span className="text-xs font-normal opacity-60">Optimiza tu semana completa</span>
              </Button>
              <Button variant="outline" onClick={() => handleCombinedSelect(false)} className="h-24 rounded-2xl border-outline-variant/20 hover:bg-surface font-bold text-lg flex flex-col">
                <span>No, plan independiente</span>
                <span className="text-xs font-normal opacity-60">Solo para {selectedSport?.name}</span>
              </Button>
            </div>
          </motion.div>
        ) : activePlan ? (
          <motion.div key="plan" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-2xl font-black text-primary uppercase italic">{selectedSport?.name} - Plan Generado</h3>
              <Button variant="outline" onClick={() => setActivePlan(null)} className="rounded-full">Cambiar Deporte</Button>
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
            <h3 className="font-headline text-2xl font-black uppercase italic tracking-tight">Explorar Disciplinas</h3>
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredSports.map(sport => {
                const Icon = getIcon(sport.icon);
                return (
                  <Card key={sport.id} onClick={() => handleSportSelect(sport)} className="bg-surface border-none p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/10 hover:scale-105 transition-all group">
                    <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon size={24} className="text-on-surface-variant group-hover:text-primary" />
                    </div>
                    <span className="font-headline font-bold text-sm uppercase tracking-tight">{sport.name}</span>
                    <ChevronRight size={16} className="mt-2 text-outline-variant group-hover:text-primary" />
                  </Card>
                );
              })}
              {filteredSports.length === 0 && (
                <div className="col-span-full py-20 text-center text-on-surface-variant italic">
                  No se encontraron deportes que coincidan con tu búsqueda.
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
