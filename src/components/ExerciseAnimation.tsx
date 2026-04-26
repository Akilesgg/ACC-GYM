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
  // PECHO
  'press banca': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif',
    muscle: 'Pectoral', color: '#ef4444'
  },
  'bench press': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif',
    muscle: 'Pectoral', color: '#ef4444'
  },
  'flexion': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Push-Up.gif',
    muscle: 'Pectoral / Tríceps', color: '#ef4444'
  },
  'push up': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Push-Up.gif',
    muscle: 'Pectoral / Tríceps', color: '#ef4444'
  },
  'aperturas': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Fly.gif',
    muscle: 'Pectoral', color: '#ef4444'
  },
  'fondos': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Chest-Dips.gif',
    muscle: 'Tríceps / Pecho', color: '#ef4444'
  },

  // ESPALDA
  'dominada': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pull-Up.gif',
    muscle: 'Dorsal / Bíceps', color: '#3b82f6'
  },
  'pull up': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pull-Up.gif',
    muscle: 'Dorsal / Bíceps', color: '#3b82f6'
  },
  'remo con barra': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bent-Over-Row.gif',
    muscle: 'Dorsal / Romboides', color: '#3b82f6'
  },
  'remo': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Dumbbell-Row.gif',
    muscle: 'Dorsal / Romboides', color: '#3b82f6'
  },
  'peso muerto': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Deadlift.gif',
    muscle: 'Isquios / Espalda Baja', color: '#3b82f6'
  },
  'deadlift': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Deadlift.gif',
    muscle: 'Isquios / Espalda Baja', color: '#3b82f6'
  },

  // PIERNAS
  'sentadilla con barra': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Squat.gif',
    muscle: 'Cuádriceps / Glúteos', color: '#22c55e'
  },
  'sentadilla': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Squat.gif',
    muscle: 'Cuádriceps / Glúteos', color: '#22c55e'
  },
  'squat': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Squat.gif',
    muscle: 'Cuádriceps / Glúteos', color: '#22c55e'
  },
  'zancada': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lunge.gif',
    muscle: 'Cuádriceps / Glúteos', color: '#22c55e'
  },
  'lunge': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lunge.gif',
    muscle: 'Cuádriceps / Glúteos', color: '#22c55e'
  },
  'prensa': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Press.gif',
    muscle: 'Cuádriceps', color: '#22c55e'
  },
  'extension de cuadriceps': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Extension.gif',
    muscle: 'Cuádriceps', color: '#22c55e'
  },
  'curl de femoral': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lying-Leg-Curl.gif',
    muscle: 'Isquiotibiales', color: '#22c55e'
  },
  'gemelo': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Standing-Calf-Raise.gif',
    muscle: 'Gemelos', color: '#22c55e'
  },

  // HOMBROS
  'press militar': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Military-Press.gif',
    muscle: 'Deltoides', color: '#f59e0b'
  },
  'militar': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Military-Press.gif',
    muscle: 'Deltoides', color: '#f59e0b'
  },
  'elevacion lateral': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lateral-Raise.gif',
    muscle: 'Deltoides Lateral', color: '#f59e0b'
  },
  'elevacion frontal': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Dumbbell-Front-Raise.gif',
    muscle: 'Deltoides Frontal', color: '#f59e0b'
  },
  'elevacion': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lateral-Raise.gif',
    muscle: 'Deltoides', color: '#f59e0b'
  },

  // BÍCEPS / TRÍCEPS
  'curl con barra': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Curl.gif',
    muscle: 'Bíceps', color: '#f59e0b'
  },
  'curl de bicep': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Biceps-Curl.gif',
    muscle: 'Bíceps', color: '#f59e0b'
  },
  'curl': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Biceps-Curl.gif',
    muscle: 'Bíceps', color: '#f59e0b'
  },
  'bicep': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Biceps-Curl.gif',
    muscle: 'Bíceps', color: '#f59e0b'
  },
  'extension de tricep': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Triceps-Pushdown.gif',
    muscle: 'Tríceps', color: '#f59e0b'
  },
  'tricep': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Triceps-Pushdown.gif',
    muscle: 'Tríceps', color: '#f59e0b'
  },
  'mancuerna': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Biceps-Curl.gif',
    muscle: 'Bíceps', color: '#f59e0b'
  },

  // CORE
  'plancha': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/04/Plank.gif',
    muscle: 'Core', color: '#8b5cf6'
  },
  'plank': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/04/Plank.gif',
    muscle: 'Core', color: '#8b5cf6'
  },
  'crunch': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Crunch.gif',
    muscle: 'Abdomen', color: '#8b5cf6'
  },
  'abdominal': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Crunch.gif',
    muscle: 'Abdomen', color: '#8b5cf6'
  },
  'russian twist': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Russian-Twist.gif',
    muscle: 'Oblicuos', color: '#8b5cf6'
  },
  'mountain climber': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Mountain-Climber.gif',
    muscle: 'Core / Cardio', color: '#8b5cf6'
  },
  'core': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/04/Plank.gif',
    muscle: 'Core', color: '#8b5cf6'
  },

  // BOXEO
  'jab': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/09/Boxing-Jab-Cross.gif',
    muscle: 'Hombros / Core', color: '#ef4444'
  },
  'jab-cross': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/09/Boxing-Jab-Cross.gif',
    muscle: 'Hombros / Core', color: '#ef4444'
  },
  'hook': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/09/Boxing-Jab-Cross.gif',
    muscle: 'Oblicuos / Hombros', color: '#ef4444'
  },
  'uppercut': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/09/Boxing-Jab-Cross.gif',
    muscle: 'Hombros / Core', color: '#ef4444'
  },
  'saco': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/09/Boxing-Jab-Cross.gif',
    muscle: 'Full Body', color: '#ef4444'
  },
  'sombra': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/09/Boxing-Jab-Cross.gif',
    muscle: 'Full Body', color: '#ef4444'
  },
  'comba': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Jump-Rope.gif',
    muscle: 'Cardio / Gemelos', color: '#ef4444'
  },

  // CARDIO / HIIT
  'burpee': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Burpee.gif',
    muscle: 'Full Body', color: '#06b6d4'
  },
  'saltar a la comba': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Jump-Rope.gif',
    muscle: 'Cardio', color: '#06b6d4'
  },
  'saltar': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Jump-Rope.gif',
    muscle: 'Cardio', color: '#06b6d4'
  },
  'jumping jack': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Jumping-Jack.gif',
    muscle: 'Cardio', color: '#06b6d4'
  },
  'sprint': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/09/High-Knees.gif',
    muscle: 'Cardio / Piernas', color: '#06b6d4'
  },
  'rodaje': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/09/High-Knees.gif',
    muscle: 'Cardio', color: '#06b6d4'
  },
  'correr': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/09/High-Knees.gif',
    muscle: 'Cardio', color: '#06b6d4'
  },
  'high knees': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/09/High-Knees.gif',
    muscle: 'Cardio / Core', color: '#06b6d4'
  },

  // CICLISMO
  'cicl': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Stationary-Bike.gif',
    muscle: 'Cuádriceps / Cardio', color: '#22c55e'
  },
  'bici': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Stationary-Bike.gif',
    muscle: 'Cuádriceps / Cardio', color: '#22c55e'
  },
  'spinning': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Stationary-Bike.gif',
    muscle: 'Cuádriceps / Cardio', color: '#22c55e'
  },

  // YOGA / MOVILIDAD
  'yoga': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Downward-Dog.gif',
    muscle: 'Movilidad Full Body', color: '#8b5cf6'
  },
  'estiramiento': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Hamstring-Stretch.gif',
    muscle: 'Flexibilidad', color: '#8b5cf6'
  },
  'stretch': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Hamstring-Stretch.gif',
    muscle: 'Flexibilidad', color: '#8b5cf6'
  },
  'movilidad': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Downward-Dog.gif',
    muscle: 'Movilidad', color: '#8b5cf6'
  },
};

// DEFAULT para ejercicios no reconocidos
const DEFAULT_GIF = {
  gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Squat.gif',
  muscle: 'Full Body',
  color: '#22c55e'
};

const getExerciseData = (name: string, muscleGroup?: string) => {
  const q = (name + ' ' + (muscleGroup || ''))
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  
  // Buscar por longitud descendente para priorizar matches más específicos
  const sortedKeys = Object.keys(EXERCISE_GIFS)
    .sort((a, b) => b.length - a.length);
  
  const match = sortedKeys.find(k => q.includes(k));
  return match ? EXERCISE_GIFS[match] : DEFAULT_GIF;
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
              const target = e.target as HTMLImageElement;
              if (!target.src.includes('Barbell-Squat')) {
                target.src = 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Squat.gif';
              }
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
