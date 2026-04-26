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
  'bench press': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif',
    muscle: 'Pectoral', color: '#ef4444'
  },
  'mancuerda bench': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Bench-Press.gif',
    muscle: 'Pectoral', color: '#ef4444'
  },
  'push up': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Push-Up.gif',
    muscle: 'Pectoral / Tríceps', color: '#ef4444'
  },
  'peck deck': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Butterfly.gif',
    muscle: 'Pectoral', color: '#ef4444'
  },
  'aperturas': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Fly.gif',
    muscle: 'Pectoral', color: '#ef4444'
  },
  'pullover': {
     gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Pullover.gif',
     muscle: 'Pectoral / Dorsal', color: '#ef4444'
  },

  // ESPALDA
  'pull up': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pull-Up.gif',
    muscle: 'Dorsal / Bíceps', color: '#3b82f6'
  },
  'rows': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bent-Over-Row.gif',
    muscle: 'Dorsal / Romboides', color: '#3b82f6'
  },
  'deadlift': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Deadlift.gif',
    muscle: 'Isquios / Espalda Baja', color: '#3b82f6'
  },
  'lat pulldown': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lat-Pulldown.gif',
    muscle: 'Dorsal', color: '#3b82f6'
  },
  'face pull': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Face-Pull.gif',
    muscle: 'Hombro Posterior', color: '#3b82f6'
  },

  // PIERNAS
  'squats': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Squat.gif',
    muscle: 'Cuádriceps / Glúteos', color: '#22c55e'
  },
  'lunges': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lunge.gif',
    muscle: 'Cuádriceps / Glúteos', color: '#22c55e'
  },
  'leg press': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Press.gif',
    muscle: 'Cuádriceps', color: '#22c55e'
  },
  'leg extension': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Extension.gif',
    muscle: 'Cuádriceps', color: '#22c55e'
  },
  'leg curl': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lying-Leg-Curl.gif',
    muscle: 'Isquiotibiales', color: '#22c55e'
  },
  'calf raise': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Standing-Calf-Raise.gif',
    muscle: 'Gemelos', color: '#22c55e'
  },
  'hip thrust': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Hip-Thrust.gif',
    muscle: 'Glúteos', color: '#22c55e'
  },

  // HOMBROS
  'military press': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Military-Press.gif',
    muscle: 'Deltoides', color: '#f59e0b'
  },
  'lateral raise': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lateral-Raise.gif',
    muscle: 'Deltoides Lateral', color: '#f59e0b'
  },
  'front raise': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Dumbbell-Front-Raise.gif',
    muscle: 'Deltoides Frontal', color: '#f59e0b'
  },
  'shrugs': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shrug.gif',
    muscle: 'Trapecio', color: '#f59e0b'
  },

  // BRAZOS
  'biceps curl': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Curl.gif',
    muscle: 'Bíceps', color: '#f59e0b'
  },
  'hammer curl': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Hammer-Curl.gif',
    muscle: 'Bíceps / Braquial', color: '#f59e0b'
  },
  'triceps pushdown': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Triceps-Pushdown.gif',
    muscle: 'Tríceps', color: '#f59e0b'
  },
  'skull crusher': {
     gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Skull-Crusher.gif',
     muscle: 'Tríceps', color: '#f59e0b'
  },
  'dips': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Chest-Dips.gif',
    muscle: 'Tríceps / Pecho', color: '#f59e0b'
  },

  // CORE
  'plank': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/04/Plank.gif',
    muscle: 'Core', color: '#8b5cf6'
  },
  'crunch': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Crunch.gif',
    muscle: 'Abdomen', color: '#8b5cf6'
  },
  'leg raise': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lying-Leg-Raise.gif',
    muscle: 'Abdomen Inferior', color: '#8b5cf6'
  },
  'russian twist': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Russian-Twist.gif',
    muscle: 'Oblicuos', color: '#8b5cf6'
  },
  'mountain climber': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Mountain-Climber.gif',
    muscle: 'Core / Cardio', color: '#8b5cf6'
  },

  // BOXEO
  'jab': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/09/Boxing-Jab-Cross.gif',
    muscle: 'Hombros / Core', color: '#ef4444'
  },
  'boxeo': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/09/Boxing-Jab-Cross.gif',
    muscle: 'Full Body', color: '#ef4444'
  },
  'jump rope': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Jump-Rope.gif',
    muscle: 'Cardio / Gemelos', color: '#ef4444'
  },

  // CARDIO
  'burpee': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Burpee.gif',
    muscle: 'Full Body', color: '#06b6d4'
  },
  'jumping jack': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Jumping-Jack.gif',
    muscle: 'Cardio', color: '#06b6d4'
  },
  'mountain climbers': {
    gif: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Mountain-Climber.gif',
    muscle: 'Full Body / Core', color: '#06b6d4'
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

  // Intentar match parcial si no hay match exacto
  if (!match) {
    if (q.includes('pecho') || q.includes('press')) return EXERCISE_GIFS['bench press'];
    if (q.includes('espalda') || q.includes('remo')) return EXERCISE_GIFS['rows'];
    if (q.includes('pierna') || q.includes('sentadilla') || q.includes('squat')) return EXERCISE_GIFS['squats'];
    if (q.includes('bicep')) return EXERCISE_GIFS['biceps curl'];
    if (q.includes('tricep')) return EXERCISE_GIFS['triceps pushdown'];
    if (q.includes('core') || q.includes('abs') || q.includes('abdominal')) return EXERCISE_GIFS['plank'];
  }

  return match ? EXERCISE_GIFS[match] : DEFAULT_GIF;
};

export const ExerciseAnimation = ({ type, isDone, className = '', size = 'md', muscleGroup }: ExerciseAnimationProps) => {
  const [playing, setPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
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
      <div className={`absolute inset-0 bg-black flex items-center justify-center transition-opacity duration-500 ${loading ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>

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
            onLoad={() => setLoading(false)}
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
            onLoad={() => setLoading(false)}
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
