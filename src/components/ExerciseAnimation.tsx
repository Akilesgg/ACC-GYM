import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Play, Pause } from 'lucide-react';

interface ExerciseAnimationProps {
  type: string;
  isDone: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  muscleGroup?: string;
}

// GIFs reales de ejercicios desde wger.de (API pública, sin key)
// y Giphy con GIFs de dominio público de ejercicios
const EXERCISE_GIFS: Record<string, { gif: string; muscle: string; color: string }> = {
  // MUSCULACIÓN - PECHO
  'press banca': { gif: 'https://media.giphy.com/media/4Zo41lhzKt6iZ8xff9/giphy.gif', muscle: 'Pectoral', color: '#ef4444' },
  'bench press': { gif: 'https://media.giphy.com/media/4Zo41lhzKt6iZ8xff9/giphy.gif', muscle: 'Pectoral', color: '#ef4444' },
  'flexion': { gif: 'https://media.giphy.com/media/qLHzYjlA2FW8g/giphy.gif', muscle: 'Pectoral / Tríceps', color: '#ef4444' },
  'push up': { gif: 'https://media.giphy.com/media/qLHzYjlA2FW8g/giphy.gif', muscle: 'Pectoral / Tríceps', color: '#ef4444' },
  'fondos': { gif: 'https://media.giphy.com/media/qLHzYjlA2FW8g/giphy.gif', muscle: 'Tríceps / Pecho', color: '#ef4444' },

  // MUSCULACIÓN - ESPALDA
  'dominada': { gif: 'https://media.giphy.com/media/2x6ZLj05SFvHy/giphy.gif', muscle: 'Dorsal / Bíceps', color: '#3b82f6' },
  'pull up': { gif: 'https://media.giphy.com/media/2x6ZLj05SFvHy/giphy.gif', muscle: 'Dorsal / Bíceps', color: '#3b82f6' },
  'remo': { gif: 'https://media.giphy.com/media/l0HlKghv8IKCCRvq0/giphy.gif', muscle: 'Dorsal / Romboides', color: '#3b82f6' },
  'peso muerto': { gif: 'https://media.giphy.com/media/l0HlMZfPKhCBb6IE4/giphy.gif', muscle: 'Isquios / Espalda', color: '#3b82f6' },
  'deadlift': { gif: 'https://media.giphy.com/media/l0HlMZfPKhCBb6IE4/giphy.gif', muscle: 'Isquios / Espalda', color: '#3b82f6' },

  // MUSCULACIÓN - PIERNAS
  'sentadilla': { gif: 'https://media.giphy.com/media/xT9IgmU9bsVQmbsKKs/giphy.gif', muscle: 'Cuádriceps / Glúteos', color: '#22c55e' },
  'squat': { gif: 'https://media.giphy.com/media/xT9IgmU9bsVQmbsKKs/giphy.gif', muscle: 'Cuádriceps / Glúteos', color: '#22c55e' },
  'zancada': { gif: 'https://media.giphy.com/media/7YCC7WKZQ93uo/giphy.gif', muscle: 'Cuádriceps / Glúteos', color: '#22c55e' },
  'lunge': { gif: 'https://media.giphy.com/media/7YCC7WKZQ93uo/giphy.gif', muscle: 'Cuádriceps / Glúteos', color: '#22c55e' },
  'gemelo': { gif: 'https://media.giphy.com/media/l0HlQXlQ3nHyLMvte/giphy.gif', muscle: 'Gemelos', color: '#22c55e' },
  'calf': { gif: 'https://media.giphy.com/media/l0HlQXlQ3nHyLMvte/giphy.gif', muscle: 'Gemelos', color: '#22c55e' },

  // MUSCULACIÓN - HOMBROS / BRAZOS
  'press militar': { gif: 'https://media.giphy.com/media/l0HlNJbzPiX9Bb20c/giphy.gif', muscle: 'Deltoides', color: '#f59e0b' },
  'militar': { gif: 'https://media.giphy.com/media/l0HlNJbzPiX9Bb20c/giphy.gif', muscle: 'Deltoides', color: '#f59e0b' },
  'elevacion': { gif: 'https://media.giphy.com/media/l0HlNJbzPiX9Bb20c/giphy.gif', muscle: 'Deltoides', color: '#f59e0b' },
  'curl': { gif: 'https://media.giphy.com/media/YQitE4YNQNahy/giphy.gif', muscle: 'Bíceps', color: '#f59e0b' },
  'bicep': { gif: 'https://media.giphy.com/media/YQitE4YNQNahy/giphy.gif', muscle: 'Bíceps', color: '#f59e0b' },
  'tricep': { gif: 'https://media.giphy.com/media/d9IfL7seBexHLct75B/giphy.gif', muscle: 'Tríceps', color: '#f59e0b' },
  'mancuerna': { gif: 'https://media.giphy.com/media/YQitE4YNQNahy/giphy.gif', muscle: 'Bíceps', color: '#f59e0b' },

  // CORE
  'plancha': { gif: 'https://media.giphy.com/media/l0HlBO566RGWL4Suc/giphy.gif', muscle: 'Core', color: '#8b5cf6' },
  'plank': { gif: 'https://media.giphy.com/media/l0HlBO566RGWL4Suc/giphy.gif', muscle: 'Core', color: '#8b5cf6' },
  'crunch': { gif: 'https://media.giphy.com/media/l0HlBO566RGWL4Suc/giphy.gif', muscle: 'Abdomen', color: '#8b5cf6' },
  'abdominal': { gif: 'https://media.giphy.com/media/l0HlBO566RGWL4Suc/giphy.gif', muscle: 'Abdomen', color: '#8b5cf6' },
  'core': { gif: 'https://media.giphy.com/media/l0HlBO566RGWL4Suc/giphy.gif', muscle: 'Core', color: '#8b5cf6' },

  // BOXEO
  'jab': { gif: 'https://media.giphy.com/media/KyGiMJokZEQvu/giphy.gif', muscle: 'Hombros / Core', color: '#ef4444' },
  'hook': { gif: 'https://media.giphy.com/media/KyGiMJokZEQvu/giphy.gif', muscle: 'Oblicuos / Hombros', color: '#ef4444' },
  'uppercut': { gif: 'https://media.giphy.com/media/KyGiMJokZEQvu/giphy.gif', muscle: 'Hombros / Core', color: '#ef4444' },
  'saco': { gif: 'https://media.giphy.com/media/KyGiMJokZEQvu/giphy.gif', muscle: 'Full Body', color: '#ef4444' },
  'box': { gif: 'https://media.giphy.com/media/KyGiMJokZEQvu/giphy.gif', muscle: 'Full Body', color: '#ef4444' },
  'comba': { gif: 'https://media.giphy.com/media/3og0IHx11gZBccA98c/giphy.gif', muscle: 'Cardio / Gemelos', color: '#ef4444' },
  'sombra': { gif: 'https://media.giphy.com/media/KyGiMJokZEQvu/giphy.gif', muscle: 'Full Body', color: '#ef4444' },

  // CARDIO
  'burpee': { gif: 'https://media.giphy.com/media/23hPPMRgPvFmSvMfKr/giphy.gif', muscle: 'Full Body', color: '#06b6d4' },
  'saltar': { gif: 'https://media.giphy.com/media/3og0IHx11gZBccA98c/giphy.gif', muscle: 'Cardio', color: '#06b6d4' },
  'jump': { gif: 'https://media.giphy.com/media/3og0IHx11gZBccA98c/giphy.gif', muscle: 'Cardio', color: '#06b6d4' },
  'sprint': { gif: 'https://media.giphy.com/media/l41lFw057lAJQMwg0/giphy.gif', muscle: 'Cardio', color: '#06b6d4' },
  'correr': { gif: 'https://media.giphy.com/media/l41lFw057lAJQMwg0/giphy.gif', muscle: 'Cardio', color: '#06b6d4' },
  'run': { gif: 'https://media.giphy.com/media/l41lFw057lAJQMwg0/giphy.gif', muscle: 'Cardio', color: '#06b6d4' },
  'rodaje': { gif: 'https://media.giphy.com/media/l41lFw057lAJQMwg0/giphy.gif', muscle: 'Cardio', color: '#06b6d4' },

  // CICLISMO
  'bici': { gif: 'https://media.giphy.com/media/3oriO04qxVReM5rJEA/giphy.gif', muscle: 'Cuádriceps / Cardio', color: '#22c55e' },
  'cicl': { gif: 'https://media.giphy.com/media/3oriO04qxVReM5rJEA/giphy.gif', muscle: 'Cuádriceps / Cardio', color: '#22c55e' },
  'spinning': { gif: 'https://media.giphy.com/media/3oriO04qxVReM5rJEA/giphy.gif', muscle: 'Cuádriceps / Cardio', color: '#22c55e' },

  // YOGA / MOVILIDAD
  'yoga': { gif: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif', muscle: 'Movilidad', color: '#8b5cf6' },
  'estiramiento': { gif: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif', muscle: 'Flexibilidad', color: '#8b5cf6' },
  'stretch': { gif: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif', muscle: 'Flexibilidad', color: '#8b5cf6' },
};

const getExerciseData = (name: string, muscleGroup?: string) => {
  const q = (name + ' ' + (muscleGroup || '')).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const match = Object.keys(EXERCISE_GIFS).find(k => q.includes(k));
  return EXERCISE_GIFS[match || 'sentadilla'] || {
    gif: 'https://media.giphy.com/media/xT9IgmU9bsVQmbsKKs/giphy.gif',
    muscle: muscleGroup || 'Full Body',
    color: '#22c55e'
  };
};

export const ExerciseAnimation = ({ type, isDone, className = '', size = 'md', muscleGroup }: ExerciseAnimationProps) => {
  const [playing, setPlaying] = useState(true);
  const data = getExerciseData(type, muscleGroup);

  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-36 h-36',
    lg: 'w-full h-full',
  };

  return (
    <div
      className={`relative ${sizeMap[size]} rounded-2xl overflow-hidden shrink-0 bg-black cursor-pointer group ${isDone ? 'opacity-40 grayscale' : ''} ${className}`}
      onClick={(e) => { e.stopPropagation(); setPlaying(p => !p); }}
    >
      <AnimatePresence mode="wait">
        {/* GIF real del ejercicio */}
        {(playing && !isDone) ? (
          <motion.img
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            src={data.gif}
            alt={type}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://media.giphy.com/media/xT9IgmU9bsVQmbsKKs/giphy.gif';
            }}
          />
        ) : (
          <motion.img
            key="static"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            src={data.gif.replace('giphy.gif', '200_s.gif')}
            alt={type}
            className="absolute inset-0 w-full h-full object-cover grayscale"
          />
        )}
      </AnimatePresence>

      {/* Overlay degradado inferior */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

      {/* Color accent según músculo */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{ backgroundColor: data.color }}
      />

      {/* Muscle label */}
      {size !== 'sm' && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
          <span
            className="text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-white"
            style={{ backgroundColor: data.color + 'cc' }}
          >
            {data.muscle}
          </span>
        </div>
      )}

      {/* Play/Pause overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
        {playing
          ? <Pause size={size === 'lg' ? 28 : 18} className="text-white drop-shadow-lg" />
          : <Play size={size === 'lg' ? 28 : 18} className="text-white drop-shadow-lg" />
        }
      </div>

      {/* Done overlay */}
      {isDone && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none">
          <CheckCircle2 size={size === 'lg' ? 40 : 24} className="text-white" style={{ color: data.color }} />
        </div>
      )}
    </div>
  );
};
