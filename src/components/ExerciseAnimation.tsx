import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Play, Pause } from 'lucide-react';

interface ExerciseAnimationProps {
  type: string;
  isDone: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  muscleGroup?: string;
}

// GIFs de fitnessprogramer.com — figura real, movimiento correcto
const EXERCISE_MAP: Record<string, { gif: string; muscle: string; color: string }> = {
  'sentadilla':       { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Squat.gif',                   muscle: 'Cuádriceps / Glúteos',   color: '#22c55e' },
  'squat':            { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Squat.gif',                   muscle: 'Cuádriceps / Glúteos',   color: '#22c55e' },
  'zancada':          { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lunge.gif',                  muscle: 'Cuádriceps / Glúteos',   color: '#22c55e' },
  'lunge':            { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lunge.gif',                  muscle: 'Cuádriceps / Glúteos',   color: '#22c55e' },
  'peso muerto':      { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Deadlift.gif',                muscle: 'Isquios / Espalda',      color: '#3b82f6' },
  'deadlift':         { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Deadlift.gif',                muscle: 'Isquios / Espalda',      color: '#3b82f6' },
  'prensa':           { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Press.gif',                       muscle: 'Cuádriceps',             color: '#22c55e' },
  'gemelo':           { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Standing-Calf-Raise.gif',             muscle: 'Gemelos',                color: '#22c55e' },
  'hip thrust':       { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Barbell-Hip-Thrust.gif',              muscle: 'Glúteos',                color: '#22c55e' },
  'gluteo':           { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Barbell-Hip-Thrust.gif',              muscle: 'Glúteos',                color: '#22c55e' },
  'press banca':      { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif',             muscle: 'Pectoral',               color: '#ef4444' },
  'bench press':      { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif',             muscle: 'Pectoral',               color: '#ef4444' },
  'press inclinado':  { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Incline-Dumbbell-Press.gif',          muscle: 'Pectoral Superior',      color: '#ef4444' },
  'aperturas':        { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Dumbbell-Fly.gif',                    muscle: 'Pectoral',               color: '#ef4444' },
  'fondos':           { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Chest-Dips.gif',                      muscle: 'Tríceps / Pecho',        color: '#ef4444' },
  'flexion':          { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Push-Up.gif',                         muscle: 'Pectoral / Tríceps',     color: '#ef4444' },
  'push up':          { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Push-Up.gif',                         muscle: 'Pectoral / Tríceps',     color: '#ef4444' },
  'dominada':         { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pull-Up.gif',                         muscle: 'Dorsal / Bíceps',        color: '#3b82f6' },
  'pull up':          { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pull-Up.gif',                         muscle: 'Dorsal / Bíceps',        color: '#3b82f6' },
  'remo con barra':   { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bent-Over-Row.gif',           muscle: 'Dorsal / Romboides',     color: '#3b82f6' },
  'remo':             { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Dumbbell-Row.gif',                    muscle: 'Dorsal / Romboides',     color: '#3b82f6' },
  'jalon':            { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lat-Pulldown.gif',                    muscle: 'Dorsal',                 color: '#3b82f6' },
  'press militar':    { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Military-Press.gif',          muscle: 'Deltoides',              color: '#f59e0b' },
  'militar':          { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Military-Press.gif',          muscle: 'Deltoides',              color: '#f59e0b' },
  'elevacion lateral':{ gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lateral-Raise.gif',          muscle: 'Deltoides Lateral',      color: '#f59e0b' },
  'elevacion frontal':{ gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Dumbbell-Front-Raise.gif',            muscle: 'Deltoides Frontal',      color: '#f59e0b' },
  'elevacion':        { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lateral-Raise.gif',          muscle: 'Deltoides',              color: '#f59e0b' },
  'curl con barra':   { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Curl.gif',                    muscle: 'Bíceps',                 color: '#f59e0b' },
  'curl de bicep':    { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Biceps-Curl.gif',            muscle: 'Bíceps',                 color: '#f59e0b' },
  'curl':             { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Biceps-Curl.gif',            muscle: 'Bíceps',                 color: '#f59e0b' },
  'bicep':            { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Biceps-Curl.gif',            muscle: 'Bíceps',                 color: '#f59e0b' },
  'extension tricep': { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Triceps-Pushdown.gif',                muscle: 'Tríceps',                color: '#f59e0b' },
  'tricep':           { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Triceps-Pushdown.gif',                muscle: 'Tríceps',                color: '#f59e0b' },
  'mancuerna':        { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Biceps-Curl.gif',            muscle: 'Bíceps',                 color: '#f59e0b' },
  'plancha':          { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/04/Plank.gif',                           muscle: 'Core',                   color: '#8b5cf6' },
  'plank':            { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/04/Plank.gif',                           muscle: 'Core',                   color: '#8b5cf6' },
  'crunch':           { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Crunch.gif',                          muscle: 'Abdomen',                color: '#8b5cf6' },
  'abdominal':        { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Crunch.gif',                          muscle: 'Abdomen',                color: '#8b5cf6' },
  'russian twist':    { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Russian-Twist.gif',                   muscle: 'Oblicuos',               color: '#8b5cf6' },
  'mountain climber': { gif: 'https://fitnessprogramer.com/wp-content/uploads/2022/01/Mountain-Climbers.gif',               muscle: 'Core / Cardio',          color: '#8b5cf6' },
  'core':             { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/04/Plank.gif',                           muscle: 'Core',                   color: '#8b5cf6' },
  'jab':              { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/09/Boxing-Jab-Cross.gif',                muscle: 'Hombros / Core',         color: '#ef4444' },
  'cross':            { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/09/Boxing-Jab-Cross.gif',                muscle: 'Hombros / Core',         color: '#ef4444' },
  'hook':             { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/09/Boxing-Jab-Cross.gif',                muscle: 'Oblicuos / Hombros',     color: '#ef4444' },
  'uppercut':         { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/09/Boxing-Jab-Cross.gif',                muscle: 'Hombros / Core',         color: '#ef4444' },
  'saco':             { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/09/Boxing-Jab-Cross.gif',                muscle: 'Full Body',              color: '#ef4444' },
  'sombra':           { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/09/Boxing-Jab-Cross.gif',                muscle: 'Full Body',              color: '#ef4444' },
  'comba':            { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Jump-Rope.gif',                       muscle: 'Cardio / Gemelos',       color: '#ef4444' },
  'saltar':           { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Jump-Rope.gif',                       muscle: 'Cardio',                 color: '#06b6d4' },
  'burpee':           { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Burpee.gif',                          muscle: 'Full Body',              color: '#06b6d4' },
  'sprint':           { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/09/High-Knees.gif',                      muscle: 'Cardio / Piernas',       color: '#06b6d4' },
  'correr':           { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/09/High-Knees.gif',                      muscle: 'Cardio',                 color: '#06b6d4' },
  'rodaje':           { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/09/High-Knees.gif',                      muscle: 'Cardio',                 color: '#06b6d4' },
  'jumping jack':     { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Jumping-Jack.gif',                    muscle: 'Cardio',                 color: '#06b6d4' },
  'bici':             { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Stationary-Bike.gif',                 muscle: 'Cuádriceps / Cardio',    color: '#22c55e' },
  'spinning':         { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Stationary-Bike.gif',                 muscle: 'Cuádriceps / Cardio',    color: '#22c55e' },
  'cicl':             { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Stationary-Bike.gif',                 muscle: 'Cuádriceps / Cardio',    color: '#22c55e' },
  'estiramiento':     { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Hamstring-Stretch.gif',               muscle: 'Flexibilidad',           color: '#8b5cf6' },
  'yoga':             { gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Downward-Dog.gif',                    muscle: 'Movilidad',              color: '#8b5cf6' },
};

const DEFAULT_DATA = {
  gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Squat.gif',
  muscle: 'Full Body',
  color: '#22c55e'
};

const DEFAULT_GIF = 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Squat.gif';

const getExerciseData = (name: string, muscleGroup?: string) => {
  const q = (name + ' ' + (muscleGroup || ''))
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // Buscar de más específico a más genérico (ordenar por longitud de key desc)
  const sorted = Object.keys(EXERCISE_MAP).sort((a, b) => b.length - a.length);
  const match = sorted.find(k => q.includes(k));
  return match ? EXERCISE_MAP[match] : DEFAULT_DATA;
};

const FALLBACK_GIF = 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Squat.gif';

export const ExerciseAnimation = ({
  type, isDone, className = '', size = 'md', muscleGroup
}: ExerciseAnimationProps) => {
  const [playing, setPlaying] = useState(true);
  const [gifError, setGifError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const data = getExerciseData(type, muscleGroup);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLoaded(false);
    setGifError(false);
    
    // Si en 5 segundos no carga, usar fallback
    timeoutRef.current = setTimeout(() => {
      if (!loaded) {
        setGifError(true);
        setLoaded(true);
      }
    }, 5000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [type]);

  const sizeMap = { sm: 'w-20 h-20', md: 'w-40 h-40', lg: 'w-full h-full' };

  return (
    <div
      className={`relative ${sizeMap[size]} overflow-hidden rounded-2xl shrink-0 bg-black cursor-pointer group ${isDone ? 'opacity-40 grayscale' : ''} ${className}`}
      onClick={(e) => { e.stopPropagation(); setPlaying(p => !p); }}
    >
      {/* Loading skeleton */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {/* GIF real del ejercicio */}
      <img
        key={`${type}-${playing}`}
        src={gifError ? FALLBACK_GIF : data.gif}
        alt={type}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setLoaded(true);
        }}
        onError={(e) => {
          if (!gifError) {
            setGifError(true);
            setLoaded(false);
            (e.target as HTMLImageElement).src = FALLBACK_GIF;
          }
        }}
      />

      {/* Degradado inferior para legibilidad */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

      {/* Badge músculo */}
      {loaded && size !== 'sm' && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
          <span
            className="text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-white"
            style={{ backgroundColor: data.color + 'dd' }}
          >
            {data.muscle}
          </span>
        </div>
      )}

      {/* Play / Pause al hover */}
      {loaded && !isDone && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 pointer-events-none">
          {playing
            ? <Pause size={size === 'lg' ? 32 : 20} className="text-white drop-shadow-xl" />
            : <Play size={size === 'lg' ? 32 : 20} className="text-white drop-shadow-xl" />
          }
        </div>
      )}

      {/* Completado */}
      {isDone && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
          <CheckCircle2
            size={size === 'lg' ? 48 : 28}
            style={{ color: data.color }}
            className="drop-shadow-xl"
          />
        </div>
      )}
    </div>
  );
};
