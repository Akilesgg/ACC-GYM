import { useState } from 'react';
import { CheckCircle2, Play, Pause } from 'lucide-react';

interface ExerciseAnimationProps {
  type: string;
  isDone: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  muscleGroup?: string;
}

// GIFs de muscles.wiki — figura musculada real, movimiento correcto
// Formato: https://muscles.wiki/exercises/{slug}.gif

const EXERCISE_MAP: Record<string, { gif: string; still: string; muscle: string; color: string }> = {
  // PIERNAS
  'sentadilla': {
    gif: 'https://muscles.wiki/exercises/barbell-back-squat.gif',
    still: 'https://muscles.wiki/exercises/barbell-back-squat-still.webp',
    muscle: 'Cuádriceps / Glúteos', color: '#22c55e'
  },
  'squat': {
    gif: 'https://muscles.wiki/exercises/barbell-back-squat.gif',
    still: 'https://muscles.wiki/exercises/barbell-back-squat-still.webp',
    muscle: 'Cuádriceps / Glúteos', color: '#22c55e'
  },
  'zancada': {
    gif: 'https://muscles.wiki/exercises/dumbbell-lunge.gif',
    still: 'https://muscles.wiki/exercises/dumbbell-lunge-still.webp',
    muscle: 'Cuádriceps / Glúteos', color: '#22c55e'
  },
  'peso muerto': {
    gif: 'https://muscles.wiki/exercises/barbell-deadlift.gif',
    still: 'https://muscles.wiki/exercises/barbell-deadlift-still.webp',
    muscle: 'Isquios / Espalda', color: '#3b82f6'
  },
  'deadlift': {
    gif: 'https://muscles.wiki/exercises/barbell-deadlift.gif',
    still: 'https://muscles.wiki/exercises/barbell-deadlift-still.webp',
    muscle: 'Isquios / Espalda', color: '#3b82f6'
  },
  'prensa': {
    gif: 'https://muscles.wiki/exercises/leg-press.gif',
    still: 'https://muscles.wiki/exercises/leg-press-still.webp',
    muscle: 'Cuádriceps', color: '#22c55e'
  },
  'gemelo': {
    gif: 'https://muscles.wiki/exercises/standing-calf-raise.gif',
    still: 'https://muscles.wiki/exercises/standing-calf-raise-still.webp',
    muscle: 'Gemelos', color: '#22c55e'
  },
  'hip thrust': {
    gif: 'https://muscles.wiki/exercises/barbell-hip-thrust.gif',
    still: 'https://muscles.wiki/exercises/barbell-hip-thrust-still.webp',
    muscle: 'Glúteos', color: '#22c55e'
  },

  // PECHO
  'press banca': {
    gif: 'https://muscles.wiki/exercises/barbell-bench-press.gif',
    still: 'https://muscles.wiki/exercises/barbell-bench-press-still.webp',
    muscle: 'Pectoral', color: '#ef4444'
  },
  'bench press': {
    gif: 'https://muscles.wiki/exercises/barbell-bench-press.gif',
    still: 'https://muscles.wiki/exercises/barbell-bench-press-still.webp',
    muscle: 'Pectoral', color: '#ef4444'
  },
  'press inclinado': {
    gif: 'https://muscles.wiki/exercises/incline-dumbbell-press.gif',
    still: 'https://muscles.wiki/exercises/incline-dumbbell-press-still.webp',
    muscle: 'Pectoral Superior', color: '#ef4444'
  },
  'flexion': {
    gif: 'https://muscles.wiki/exercises/push-up.gif',
    still: 'https://muscles.wiki/exercises/push-up-still.webp',
    muscle: 'Pectoral / Tríceps', color: '#ef4444'
  },
  'push up': {
    gif: 'https://muscles.wiki/exercises/push-up.gif',
    still: 'https://muscles.wiki/exercises/push-up-still.webp',
    muscle: 'Pectoral / Tríceps', color: '#ef4444'
  },
  'aperturas': {
    gif: 'https://muscles.wiki/exercises/dumbbell-fly.gif',
    still: 'https://muscles.wiki/exercises/dumbbell-fly-still.webp',
    muscle: 'Pectoral', color: '#ef4444'
  },
  'fondos': {
    gif: 'https://muscles.wiki/exercises/tricep-dip.gif',
    still: 'https://muscles.wiki/exercises/tricep-dip-still.webp',
    muscle: 'Tríceps / Pecho', color: '#ef4444'
  },

  // ESPALDA
  'dominada': {
    gif: 'https://muscles.wiki/exercises/pull-up.gif',
    still: 'https://muscles.wiki/exercises/pull-up-still.webp',
    muscle: 'Dorsal / Bíceps', color: '#3b82f6'
  },
  'pull up': {
    gif: 'https://muscles.wiki/exercises/pull-up.gif',
    still: 'https://muscles.wiki/exercises/pull-up-still.webp',
    muscle: 'Dorsal / Bíceps', color: '#3b82f6'
  },
  'remo con barra': {
    gif: 'https://muscles.wiki/exercises/barbell-row.gif',
    still: 'https://muscles.wiki/exercises/barbell-row-still.webp',
    muscle: 'Dorsal / Romboides', color: '#3b82f6'
  },
  'remo': {
    gif: 'https://muscles.wiki/exercises/dumbbell-row.gif',
    still: 'https://muscles.wiki/exercises/dumbbell-row-still.webp',
    muscle: 'Dorsal / Romboides', color: '#3b82f6'
  },
  'jalon': {
    gif: 'https://muscles.wiki/exercises/lat-pulldown.gif',
    still: 'https://muscles.wiki/exercises/lat-pulldown-still.webp',
    muscle: 'Dorsal', color: '#3b82f6'
  },

  // HOMBROS
  'press militar': {
    gif: 'https://muscles.wiki/exercises/overhead-press.gif',
    still: 'https://muscles.wiki/exercises/overhead-press-still.webp',
    muscle: 'Deltoides', color: '#f59e0b'
  },
  'militar': {
    gif: 'https://muscles.wiki/exercises/overhead-press.gif',
    still: 'https://muscles.wiki/exercises/overhead-press-still.webp',
    muscle: 'Deltoides', color: '#f59e0b'
  },
  'elevacion lateral': {
    gif: 'https://muscles.wiki/exercises/dumbbell-lateral-raise.gif',
    still: 'https://muscles.wiki/exercises/dumbbell-lateral-raise-still.webp',
    muscle: 'Deltoides Lateral', color: '#f59e0b'
  },
  'elevacion': {
    gif: 'https://muscles.wiki/exercises/dumbbell-lateral-raise.gif',
    still: 'https://muscles.wiki/exercises/dumbbell-lateral-raise-still.webp',
    muscle: 'Deltoides', color: '#f59e0b'
  },

  // BÍCEPS / TRÍCEPS
  'curl con barra': {
    gif: 'https://muscles.wiki/exercises/barbell-curl.gif',
    still: 'https://muscles.wiki/exercises/barbell-curl-still.webp',
    muscle: 'Bíceps', color: '#f59e0b'
  },
  'curl de bicep': {
    gif: 'https://muscles.wiki/exercises/dumbbell-curl.gif',
    still: 'https://muscles.wiki/exercises/dumbbell-curl-still.webp',
    muscle: 'Bíceps', color: '#f59e0b'
  },
  'curl': {
    gif: 'https://muscles.wiki/exercises/dumbbell-curl.gif',
    still: 'https://muscles.wiki/exercises/dumbbell-curl-still.webp',
    muscle: 'Bíceps', color: '#f59e0b'
  },
  'bicep': {
    gif: 'https://muscles.wiki/exercises/dumbbell-curl.gif',
    still: 'https://muscles.wiki/exercises/dumbbell-curl-still.webp',
    muscle: 'Bíceps', color: '#f59e0b'
  },
  'extension tricep': {
    gif: 'https://muscles.wiki/exercises/tricep-pushdown.gif',
    still: 'https://muscles.wiki/exercises/tricep-pushdown-still.webp',
    muscle: 'Tríceps', color: '#f59e0b'
  },
  'tricep': {
    gif: 'https://muscles.wiki/exercises/tricep-pushdown.gif',
    still: 'https://muscles.wiki/exercises/tricep-pushdown-still.webp',
    muscle: 'Tríceps', color: '#f59e0b'
  },
  'mancuerna': {
    gif: 'https://muscles.wiki/exercises/dumbbell-curl.gif',
    still: 'https://muscles.wiki/exercises/dumbbell-curl-still.webp',
    muscle: 'Bíceps', color: '#f59e0b'
  },

  // CORE
  'plancha': {
    gif: 'https://muscles.wiki/exercises/plank.gif',
    still: 'https://muscles.wiki/exercises/plank-still.webp',
    muscle: 'Core', color: '#8b5cf6'
  },
  'plank': {
    gif: 'https://muscles.wiki/exercises/plank.gif',
    still: 'https://muscles.wiki/exercises/plank-still.webp',
    muscle: 'Core', color: '#8b5cf6'
  },
  'crunch': {
    gif: 'https://muscles.wiki/exercises/crunch.gif',
    still: 'https://muscles.wiki/exercises/crunch-still.webp',
    muscle: 'Abdomen', color: '#8b5cf6'
  },
  'abdominal': {
    gif: 'https://muscles.wiki/exercises/crunch.gif',
    still: 'https://muscles.wiki/exercises/crunch-still.webp',
    muscle: 'Abdomen', color: '#8b5cf6'
  },
  'russian twist': {
    gif: 'https://muscles.wiki/exercises/russian-twist.gif',
    still: 'https://muscles.wiki/exercises/russian-twist-still.webp',
    muscle: 'Oblicuos', color: '#8b5cf6'
  },
  'mountain climber': {
    gif: 'https://muscles.wiki/exercises/mountain-climber.gif',
    still: 'https://muscles.wiki/exercises/mountain-climber-still.webp',
    muscle: 'Core / Cardio', color: '#8b5cf6'
  },
  'core': {
    gif: 'https://muscles.wiki/exercises/plank.gif',
    still: 'https://muscles.wiki/exercises/plank-still.webp',
    muscle: 'Core', color: '#8b5cf6'
  },

  // BOXEO / CARDIO
  'jab': {
    gif: 'https://muscles.wiki/exercises/boxing-jab.gif',
    still: 'https://muscles.wiki/exercises/boxing-jab-still.webp',
    muscle: 'Hombros / Core', color: '#ef4444'
  },
  'cross': {
    gif: 'https://muscles.wiki/exercises/boxing-jab.gif',
    still: 'https://muscles.wiki/exercises/boxing-jab-still.webp',
    muscle: 'Hombros / Core', color: '#ef4444'
  },
  'hook': {
    gif: 'https://muscles.wiki/exercises/boxing-jab.gif',
    still: 'https://muscles.wiki/exercises/boxing-jab-still.webp',
    muscle: 'Oblicuos / Hombros', color: '#ef4444'
  },
  'uppercut': {
    gif: 'https://muscles.wiki/exercises/boxing-jab.gif',
    still: 'https://muscles.wiki/exercises/boxing-jab-still.webp',
    muscle: 'Hombros / Core', color: '#ef4444'
  },
  'saco': {
    gif: 'https://muscles.wiki/exercises/boxing-jab.gif',
    still: 'https://muscles.wiki/exercises/boxing-jab-still.webp',
    muscle: 'Full Body', color: '#ef4444'
  },
  'sombra': {
    gif: 'https://muscles.wiki/exercises/boxing-jab.gif',
    still: 'https://muscles.wiki/exercises/boxing-jab-still.webp',
    muscle: 'Full Body', color: '#ef4444'
  },
  'comba': {
    gif: 'https://muscles.wiki/exercises/jump-rope.gif',
    still: 'https://muscles.wiki/exercises/jump-rope-still.webp',
    muscle: 'Cardio / Gemelos', color: '#ef4444'
  },
  'burpee': {
    gif: 'https://muscles.wiki/exercises/burpee.gif',
    still: 'https://muscles.wiki/exercises/burpee-still.webp',
    muscle: 'Full Body', color: '#06b6d4'
  },
  'saltar': {
    gif: 'https://muscles.wiki/exercises/jump-rope.gif',
    still: 'https://muscles.wiki/exercises/jump-rope-still.webp',
    muscle: 'Cardio', color: '#06b6d4'
  },
  'sprint': {
    gif: 'https://muscles.wiki/exercises/high-knees.gif',
    still: 'https://muscles.wiki/exercises/high-knees-still.webp',
    muscle: 'Cardio / Piernas', color: '#06b6d4'
  },
  'correr': {
    gif: 'https://muscles.wiki/exercises/high-knees.gif',
    still: 'https://muscles.wiki/exercises/high-knees-still.webp',
    muscle: 'Cardio', color: '#06b6d4'
  },
  'bici': {
    gif: 'https://muscles.wiki/exercises/stationary-bike.gif',
    still: 'https://muscles.wiki/exercises/stationary-bike-still.webp',
    muscle: 'Cuádriceps / Cardio', color: '#22c55e'
  },
  'spinning': {
    gif: 'https://muscles.wiki/exercises/stationary-bike.gif',
    still: 'https://muscles.wiki/exercises/stationary-bike-still.webp',
    muscle: 'Cuádriceps / Cardio', color: '#22c55e'
  },
  'estiramiento': {
    gif: 'https://muscles.wiki/exercises/hamstring-stretch.gif',
    still: 'https://muscles.wiki/exercises/hamstring-stretch-still.webp',
    muscle: 'Flexibilidad', color: '#8b5cf6'
  },
  'yoga': {
    gif: 'https://muscles.wiki/exercises/downward-dog.gif',
    still: 'https://muscles.wiki/exercises/downward-dog-still.webp',
    muscle: 'Movilidad', color: '#8b5cf6'
  },
};

const DEFAULT = {
  gif: 'https://muscles.wiki/exercises/barbell-back-squat.gif',
  still: 'https://muscles.wiki/exercises/barbell-back-squat-still.webp',
  muscle: 'Full Body',
  color: '#22c55e'
};

const getExerciseData = (name: string, muscleGroup?: string) => {
  const q = (name + ' ' + (muscleGroup || ''))
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // Buscar de más específico a más genérico (ordenar por longitud de key desc)
  const sorted = Object.keys(EXERCISE_MAP).sort((a, b) => b.length - a.length);
  const match = sorted.find(k => q.includes(k));
  return match ? EXERCISE_MAP[match] : DEFAULT;
};

const FALLBACK_GIF = 'https://muscles.wiki/exercises/barbell-back-squat.gif';

export const ExerciseAnimation = ({
  type, isDone, className = '', size = 'md', muscleGroup
}: ExerciseAnimationProps) => {
  const [playing, setPlaying] = useState(true);
  const [gifError, setGifError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const data = getExerciseData(type, muscleGroup);

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
        src={gifError ? FALLBACK_GIF : (playing ? data.gif : data.still)}
        alt={type}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
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
