import { useState, useEffect } from 'react';
import { UserProfile, SportConfig, TrainingPlan } from '../types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateTrainingPlan } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell, Target, Loader2, Search, ChevronRight, Info, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

const SPORTS_LIST = [
  "Musculación", "Ciclismo", "Natación", "Running", "CrossFit", "Yoga", "Pilates", "Boxeo", "HIIT", "Tenis",
  "Padel", "Fútbol", "Baloncesto", "Voleibol", "Golf", "Escalada", "Surf", "Skateboarding", "Artes Marciales", "Triatlón",
  "Senderismo", "Remo", "Calistenia", "Powerlifting", "Halterofilia", "Danza", "Gimnasia", "Rugby", "Balonmano", "Hockey",
  "Bádminton", "Squash", "Tenis de Mesa", "Esgrima", "Tiro con Arco", "Equitación", "Esquí", "Snowboarding", "Patinaje", "Ciclismo de Montaña",
  "Kayak", "Windsurf", "Kitesurf", "Buceo", "Maratón", "Trail Running", "Spinning", "Zumba", "Kickboxing", "Atletismo"
];

const GOALS_BY_SPORT: Record<string, string[]> = {
  "Musculación": ["Ganar Masa Muscular", "Definición", "Fuerza Máxima", "Mantenimiento"],
  "Ciclismo": ["Resistencia", "Velocidad", "Pérdida de Peso", "Preparación Carrera"],
  "Running": ["Maratón", "5k/10k", "Quema de Grasa", "Resistencia Cardiovascular"],
  "default": ["Mejora de Rendimiento", "Salud General", "Pérdida de Peso", "Fuerza y Tonificación"]
};

interface SportsTabProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

export default function SportsTab({ profile, onUpdateProfile }: SportsTabProps) {
  const [search, setSearch] = useState('');
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activePlan, setActivePlan] = useState<TrainingPlan | null>(null);

  const filteredSports = SPORTS_LIST.filter(s => s.toLowerCase().includes(search.toLowerCase()));

  const handleSportSelect = (sport: string) => {
    setSelectedSport(sport);
    setShowQuestionnaire(true);
    setActivePlan(null);
  };

  const handleGoalSelect = async (goal: string) => {
    if (!selectedSport) return;
    
    setLoading(true);
    setShowQuestionnaire(false);

    const sportConfig: SportConfig = { sport: selectedSport, goal };
    
    try {
      const plan = await generateTrainingPlan(profile, sportConfig);
      setActivePlan(plan);
      
      // Update profile with the new sport if not already there
      const existingIdx = profile.selectedSports.findIndex(s => s.sport === selectedSport);
      const updatedSports = [...profile.selectedSports];
      if (existingIdx >= 0) {
        updatedSports[existingIdx] = { ...sportConfig, plan };
      } else {
        updatedSports.push({ ...sportConfig, plan });
      }
      onUpdateProfile({ ...profile, selectedSports: updatedSports });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-32">
      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <p className="font-headline text-secondary font-bold uppercase tracking-widest text-sm mb-2">
              Laboratorio de Disciplinas
            </p>
            <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-none">
              DEPORTES <span className="text-primary italic">TOP 50.</span>
            </h2>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant" size={20} />
            <Input 
              placeholder="Buscar deporte..." 
              className="bg-surface border-none pl-12 h-12 rounded-full"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
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
            <p className="text-on-surface-variant font-medium">La IA está diseñando tu plan de {selectedSport}...</p>
          </motion.div>
        ) : showQuestionnaire ? (
          <motion.div
            key="questionnaire"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl mx-auto space-y-8"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-tertiary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="text-tertiary" size={32} />
              </div>
              <h3 className="text-3xl font-headline font-black text-on-surface">{selectedSport?.toUpperCase()}</h3>
              <p className="text-on-surface-variant mt-2">Define tu objetivo para esta disciplina.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(GOALS_BY_SPORT[selectedSport!] || GOALS_BY_SPORT["default"]).map(goal => (
                <Button
                  key={goal}
                  variant="outline"
                  onClick={() => handleGoalSelect(goal)}
                  className="h-20 rounded-2xl border-outline-variant/20 hover:border-tertiary/50 hover:bg-tertiary/5 transition-all font-bold text-lg"
                >
                  {goal}
                </Button>
              ))}
            </div>
            <Button variant="ghost" onClick={() => setShowQuestionnaire(false)} className="w-full font-bold">Cancelar</Button>
          </motion.div>
        ) : activePlan ? (
          <motion.div
            key="plan"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-2xl font-black text-primary uppercase italic">{selectedSport} - Plan Generado</h3>
              <Button variant="outline" onClick={() => setActivePlan(null)} className="rounded-full">Cambiar Deporte</Button>
            </div>
            
            <Card className="bg-surface border-l-4 border-secondary p-8 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <Info className="text-secondary" />
                <h3 className="font-headline text-xl font-bold text-secondary uppercase tracking-widest">Análisis del Entrenador</h3>
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
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {filteredSports.map(sport => (
              <Card 
                key={sport}
                onClick={() => handleSportSelect(sport)}
                className="bg-surface border-none p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/10 hover:scale-105 transition-all group"
              >
                <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Dumbbell size={24} className="text-on-surface-variant group-hover:text-primary" />
                </div>
                <span className="font-headline font-bold text-sm uppercase tracking-tight">{sport}</span>
                <ChevronRight size={16} className="mt-2 text-outline-variant group-hover:text-primary" />
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
