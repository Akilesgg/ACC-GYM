import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Dumbbell, Zap, Heart, Timer, Target } from 'lucide-react';

interface ExerciseAnimationProps {
  type: string;
  isDone: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  muscleGroup?: string;
}

// Fotos reales de Unsplash por categoría de ejercicio
// Unsplash funciona desde Cloud Run sin restricciones
const EXERCISE_VISUALS: Record<string, {
  photo: string;      // ID de foto Unsplash
  accent: string;     // color del ejercicio
  icon: string;       // emoji representativo
  muscles: string;    // músculos trabajados
  category: string;   // categoría
}> = {
  // PIERNAS
  sentadilla:     { photo: '1574680096145-d05b474e2155', accent: '#22c55e', icon: '🏋️', muscles: 'Cuádriceps · Glúteos · Core', category: 'PIERNAS' },
  squat:          { photo: '1574680096145-d05b474e2155', accent: '#22c55e', icon: '🏋️', muscles: 'Cuádriceps · Glúteos · Core', category: 'PIERNAS' },
  zancada:        { photo: '1574680096145-d05b474e2155', accent: '#22c55e', icon: '🦵', muscles: 'Cuádriceps · Glúteos', category: 'PIERNAS' },
  lunge:          { photo: '1574680096145-d05b474e2155', accent: '#22c55e', icon: '🦵', muscles: 'Cuádriceps · Glúteos', category: 'PIERNAS' },
  'peso muerto':  { photo: '1581009146145-b5ef050c2e1e', accent: '#16a34a', icon: '🔱', muscles: 'Isquiotibiales · Espalda · Glúteos', category: 'PIERNAS' },
  deadlift:       { photo: '1581009146145-b5ef050c2e1e', accent: '#16a34a', icon: '🔱', muscles: 'Isquiotibiales · Espalda · Glúteos', category: 'PIERNAS' },
  prensa:         { photo: '1574680096145-d05b474e2155', accent: '#22c55e', icon: '🦵', muscles: 'Cuádriceps', category: 'PIERNAS' },
  gemelo:         { photo: '1571019614242-c5c5dee9f50b', accent: '#22c55e', icon: '🦵', muscles: 'Gemelos', category: 'PIERNAS' },
  'hip thrust':   { photo: '1574680096145-d05b474e2155', accent: '#22c55e', icon: '🍑', muscles: 'Glúteos · Isquiotibiales', category: 'PIERNAS' },

  // PECHO
  'press banca':  { photo: '1534438327276-14e5300c3a48', accent: '#ef4444', icon: '💪', muscles: 'Pectoral · Tríceps · Deltoides', category: 'PECHO' },
  'bench press':  { photo: '1534438327276-14e5300c3a48', accent: '#ef4444', icon: '💪', muscles: 'Pectoral · Tríceps · Deltoides', category: 'PECHO' },
  aperturas:      { photo: '1534438327276-14e5300c3a48', accent: '#ef4444', icon: '🦅', muscles: 'Pectoral', category: 'PECHO' },
  fondos:         { photo: '1571019614242-c5c5dee9f50b', accent: '#ef4444', icon: '⬇️', muscles: 'Tríceps · Pecho', category: 'PECHO' },
  flexion:        { photo: '1571019614242-c5c5dee9f50b', accent: '#ef4444', icon: '⬇️', muscles: 'Pectoral · Tríceps', category: 'PECHO' },
  'push up':      { photo: '1571019614242-c5c5dee9f50b', accent: '#ef4444', icon: '⬇️', muscles: 'Pectoral · Tríceps', category: 'PECHO' },

  // ESPALDA
  dominada:       { photo: '1571019613454-1cb2f99b2d8b', accent: '#3b82f6', icon: '🔼', muscles: 'Dorsal · Bíceps · Romboides', category: 'ESPALDA' },
  'pull up':      { photo: '1571019613454-1cb2f99b2d8b', accent: '#3b82f6', icon: '🔼', muscles: 'Dorsal · Bíceps', category: 'ESPALDA' },
  remo:           { photo: '1534438327276-14e5300c3a48', accent: '#3b82f6', icon: '🚣', muscles: 'Dorsal · Romboides · Bíceps', category: 'ESPALDA' },
  jalon:          { photo: '1571019613454-1cb2f99b2d8b', accent: '#3b82f6', icon: '🔽', muscles: 'Dorsal', category: 'ESPALDA' },

  // HOMBROS
  militar:        { photo: '1534438327276-14e5300c3a48', accent: '#f59e0b', icon: '🏹', muscles: 'Deltoides · Tríceps · Trapecio', category: 'HOMBROS' },
  'press militar':{ photo: '1534438327276-14e5300c3a48', accent: '#f59e0b', icon: '🏹', muscles: 'Deltoides · Tríceps', category: 'HOMBROS' },
  elevacion:      { photo: '1534438327276-14e5300c3a48', accent: '#f59e0b', icon: '↔️', muscles: 'Deltoides Lateral', category: 'HOMBROS' },

  // BRAZOS
  curl:           { photo: '1581009146145-b5ef050c2e1e', accent: '#f59e0b', icon: '💪', muscles: 'Bíceps · Antebrazo', category: 'BÍCEPS' },
  bicep:          { photo: '1581009146145-b5ef050c2e1e', accent: '#f59e0b', icon: '💪', muscles: 'Bíceps', category: 'BÍCEPS' },
  mancuerna:      { photo: '1581009146145-b5ef050c2e1e', accent: '#f59e0b', icon: '💪', muscles: 'Bíceps', category: 'BÍCEPS' },
  tricep:         { photo: '1534438327276-14e5300c3a48', accent: '#f59e0b', icon: '🔙', muscles: 'Tríceps', category: 'TRÍCEPS' },
  extension:      { photo: '1534438327276-14e5300c3a48', accent: '#f59e0b', icon: '🔙', muscles: 'Tríceps', category: 'TRÍCEPS' },

  // CORE
  plancha:        { photo: '1571019614242-c5c5dee9f50b', accent: '#8b5cf6', icon: '⚡', muscles: 'Core · Abdomen · Oblicuos', category: 'CORE' },
  plank:          { photo: '1571019614242-c5c5dee9f50b', accent: '#8b5cf6', icon: '⚡', muscles: 'Core · Abdomen', category: 'CORE' },
  crunch:         { photo: '1571019614242-c5c5dee9f50b', accent: '#8b5cf6', icon: '🔄', muscles: 'Abdomen', category: 'ABDOMEN' },
  abdominal:      { photo: '1571019614242-c5c5dee9f50b', accent: '#8b5cf6', icon: '🔄', muscles: 'Abdomen · Oblicuos', category: 'ABDOMEN' },
  core:           { photo: '1571019614242-c5c5dee9f50b', accent: '#8b5cf6', icon: '⚡', muscles: 'Core', category: 'CORE' },

  // BOXEO
  jab:            { photo: '1549060279-7e168fcee0c2', accent: '#ef4444', icon: '🥊', muscles: 'Hombros · Core · Tríceps', category: 'BOXEO' },
  cross:          { photo: '1549060279-7e168fcee0c2', accent: '#ef4444', icon: '🥊', muscles: 'Hombros · Core · Espalda', category: 'BOXEO' },
  hook:           { photo: '1549060279-7e168fcee0c2', accent: '#ef4444', icon: '🥊', muscles: 'Oblicuos · Hombros', category: 'BOXEO' },
  uppercut:       { photo: '1549060279-7e168fcee0c2', accent: '#ef4444', icon: '🥊', muscles: 'Hombros · Core · Bíceps', category: 'BOXEO' },
  saco:           { photo: '1517438322307-e67111335449', accent: '#ef4444', icon: '🥊', muscles: 'Full Body', category: 'BOXEO' },
  sombra:         { photo: '1549060279-7e168fcee0c2', accent: '#ef4444', icon: '👊', muscles: 'Full Body', category: 'BOXEO' },
  comba:          { photo: '1601422407692-ec4eeec1d9b3', accent: '#ef4444', icon: '🪢', muscles: 'Cardio · Gemelos · Hombros', category: 'CARDIO' },

  // CARDIO / HIIT
  burpee:         { photo: '1517836357463-d25dfeac3438', accent: '#06b6d4', icon: '💥', muscles: 'Full Body · Cardio', category: 'HIIT' },
  saltar:         { photo: '1601422407692-ec4eeec1d9b3', accent: '#06b6d4', icon: '⬆️', muscles: 'Cardio · Gemelos', category: 'CARDIO' },
  sprint:         { photo: '1552674605-db6ffd4facb5', accent: '#06b6d4', icon: '🏃', muscles: 'Cardio · Piernas', category: 'CARDIO' },
  correr:         { photo: '1552674605-db6ffd4facb5', accent: '#06b6d4', icon: '🏃', muscles: 'Cardio · Full Body', category: 'CARDIO' },
  rodaje:         { photo: '1552674605-db6ffd4facb5', accent: '#06b6d4', icon: '🏃', muscles: 'Cardio', category: 'CARDIO' },
  fartlek:        { photo: '1552674605-db6ffd4facb5', accent: '#06b6d4', icon: '🏃', muscles: 'Cardio · Resistencia', category: 'CARDIO' },

  // CICLISMO
  bici:           { photo: '1517649763962-0c623066013b', accent: '#22c55e', icon: '🚴', muscles: 'Cuádriceps · Glúteos · Cardio', category: 'CICLISMO' },
  cicl:           { photo: '1517649763962-0c623066013b', accent: '#22c55e', icon: '🚴', muscles: 'Cuádriceps · Cardio', category: 'CICLISMO' },
  spinning:       { photo: '1517649763962-0c623066013b', accent: '#22c55e', icon: '🚴', muscles: 'Cuádriceps · Cardio', category: 'SPINNING' },
  rodada:         { photo: '1517649763962-0c623066013b', accent: '#22c55e', icon: '🚴', muscles: 'Cuádriceps · Cardio', category: 'CICLISMO' },

  // MOVILIDAD / YOGA
  estiramiento:   { photo: '1544367567-0f2fcb009e0b', accent: '#8b5cf6', icon: '🧘', muscles: 'Flexibilidad', category: 'MOVILIDAD' },
  yoga:           { photo: '1544367567-0f2fcb009e0b', accent: '#8b5cf6', icon: '🧘', muscles: 'Movilidad · Full Body', category: 'YOGA' },
  movilidad:      { photo: '1544367567-0f2fcb009e0b', accent: '#8b5cf6', icon: '🧘', muscles: 'Movilidad', category: 'MOVILIDAD' },

  // NATACIÓN
  natac:          { photo: '1530549387074-dca99938023a', accent: '#0ea5e9', icon: '🏊', muscles: 'Full Body · Cardio', category: 'NATACIÓN' },
  swim:           { photo: '1530549387074-dca99938023a', accent: '#0ea5e9', icon: '🏊', muscles: 'Hombros · Core · Cardio', category: 'NATACIÓN' },
  kicking:        { photo: '1530549387074-dca99938023a', accent: '#0ea5e9', icon: '🏊', muscles: 'Piernas · Cardio', category: 'NATACIÓN' },
};

const DEFAULT_VISUAL = {
  photo: '1534438327276-14e5300c3a48',
  accent: '#22c55e',
  icon: '💪',
  muscles: 'Full Body',
  category: 'EJERCICIO'
};

const getVisual = (name: string, muscleGroup?: string) => {
  const q = (name + ' ' + (muscleGroup || ''))
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const sorted = Object.keys(EXERCISE_VISUALS).sort((a, b) => b.length - a.length);
  const match = sorted.find(k => q.includes(k));
  return match ? EXERCISE_VISUALS[match] : DEFAULT_VISUAL;
};

// Animación de pulso sobre la imagen según tipo de ejercicio
const PULSE_CONFIGS: Record<string, { scale: number[]; rotate: number[]; duration: number }> = {
  BOXEO:     { scale: [1, 1.03, 0.98, 1.02, 1], rotate: [0, -1, 1, -0.5, 0], duration: 0.6 },
  PIERNAS:   { scale: [1, 0.97, 1.02, 1], rotate: [0, 0, 0, 0], duration: 1.2 },
  PECHO:     { scale: [1, 0.98, 1.03, 1], rotate: [0, 0, 0, 0], duration: 1.0 },
  ESPALDA:   { scale: [1, 1.02, 0.99, 1], rotate: [0, 0, 0, 0], duration: 1.1 },
  CARDIO:    { scale: [1, 1.02, 1.04, 1.02, 1], rotate: [0, 0, 0, 0], duration: 0.5 },
  HIIT:      { scale: [1, 1.03, 0.97, 1.03, 1], rotate: [0, 1, -1, 0.5, 0], duration: 0.4 },
  CORE:      { scale: [1, 0.99, 1.01, 1], rotate: [0, 0, 0, 0], duration: 2.0 },
  DEFAULT:   { scale: [1, 1.02, 1], rotate: [0, 0, 0], duration: 1.5 },
};

export const ExerciseAnimation = ({
  type, isDone, className = '', size = 'md', muscleGroup
}: ExerciseAnimationProps) => {
  const [playing, setPlaying] = useState(true);
  const visual = getVisual(type, muscleGroup);
  const pulse = PULSE_CONFIGS[visual.category] || PULSE_CONFIGS.DEFAULT;

  const imageUrl = `https://images.unsplash.com/photo-${visual.photo}?w=600&h=600&auto=format&fit=crop&q=75`;

  const sizeMap = { sm: 'w-20 h-20', md: 'w-40 h-40', lg: 'w-full h-full' };

  return (
    <div
      className={`relative ${sizeMap[size]} overflow-hidden rounded-2xl shrink-0 cursor-pointer group bg-[#0a0a0c] ${isDone ? 'opacity-40 grayscale' : ''} ${className}`}
      onClick={(e) => { e.stopPropagation(); setPlaying(p => !p); }}
    >
      {/* Foto de fondo real del ejercicio */}
      <motion.div
        className="absolute inset-0"
        animate={playing && !isDone ? {
          scale: pulse.scale,
          rotate: pulse.rotate,
        } : { scale: 1, rotate: 0 }}
        transition={{
          duration: pulse.duration,
          repeat: playing && !isDone ? Infinity : 0,
          ease: 'easeInOut'
        }}
      >
        <img
          src={imageUrl}
          alt={type}
          className="w-full h-full object-cover"
          style={{ filter: isDone ? 'grayscale(100%) brightness(0.5)' : 'brightness(0.55) contrast(1.1)' }}
        />
      </motion.div>

      {/* Overlay de color del ejercicio */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(ellipse at center, ${visual.accent}66 0%, transparent 70%)`
        }}
      />

      {/* Degradado inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />

      {/* CONTENIDO PRINCIPAL */}
      <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none">
        {/* TOP: categoría y animación status */}
        <div className="flex items-center justify-between">
          <span
            className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full"
            style={{ backgroundColor: visual.accent + 'dd', color: '#000' }}
          >
            {visual.category}
          </span>
          {playing && !isDone && size !== 'sm' && (
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: pulse.duration * 0.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: visual.accent }}
            />
          )}
        </div>

        {/* BOTTOM: icono grande + músculos */}
        {size !== 'sm' && (
          <div className="space-y-1">
            <div className="flex items-end gap-2">
              <motion.span
                className="text-3xl leading-none"
                animate={playing && !isDone ? {
                  y: [0, -4, 0],
                  rotate: visual.category === 'BOXEO' ? [-5, 5, -3, 3, 0] : [0, 0, 0]
                } : {}}
                transition={{
                  duration: pulse.duration,
                  repeat: playing && !isDone ? Infinity : 0,
                  ease: 'easeInOut'
                }}
              >
                {visual.icon}
              </motion.span>
            </div>
            <p className="text-[8px] font-bold text-white/70 leading-tight">
              {visual.muscles}
            </p>
          </div>
        )}
      </div>

      {/* Done overlay */}
      {isDone && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
          <CheckCircle2
            size={size === 'lg' ? 48 : 28}
            style={{ color: visual.accent }}
            className="drop-shadow-xl"
          />
        </div>
      )}
    </div>
  );
};
