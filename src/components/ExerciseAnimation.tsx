import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Play, Pause } from 'lucide-react';

interface ExerciseAnimationProps {
  type: string;
  isDone: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  muscleGroup?: string;
}

// Estilos de animación CSS puros para el SVG
const SVG_ANIMATIONS = `
  @keyframes concentric-eccentric-squat {
    0%, 100% { transform: translateY(0) scaleY(1); }
    45%, 55% { transform: translateY(45px) scaleY(0.85); }
  }
  @keyframes concentric-eccentric-press {
    0%, 100% { transform: translateY(0); }
    45%, 55% { transform: translateY(-50px); }
  }
  @keyframes concentric-eccentric-curl {
    0%, 100% { transform: rotate(0deg); }
    45%, 55% { transform: rotate(-105deg); }
  }
  @keyframes anatomical-glow {
    0%, 100% { filter: brightness(1) drop-shadow(0 0 2px #00f2ff); opacity: 0.7; }
    50% { filter: brightness(2) drop-shadow(0 0 12px #00f2ff); opacity: 1; }
  }
  @keyframes heartbeat {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.05); opacity: 0.8; }
  }
`;

const getAnimationType = (name: string) => {
  const q = name.toLowerCase();
  if (q.includes('sentadilla') || q.includes('squat') || q.includes('zancada') || q.includes('lunge') || q.includes('pierna') || q.includes('prensa')) return 'squat';
  if (q.includes('press') || q.includes('militar') || q.includes('flexion') || q.includes('push up') || q.includes('pecho')) return 'press';
  if (q.includes('curl') || q.includes('remo') || q.includes('brazo')) return 'curl';
  if (q.includes('jab') || q.includes('cross') || q.includes('punch') || q.includes('boxeo')) return 'punch';
  if (q.includes('correr') || q.includes('sprint') || q.includes('comba') || q.includes('run')) return 'run';
  return 'squat';
};

export const ExerciseAnimation = ({ type, isDone, className = '', size = 'md', muscleGroup }: ExerciseAnimationProps) => {
  const [playing, setPlaying] = useState(true);
  
  const animationType = getAnimationType(type);
  const q = (type + ' ' + (muscleGroup || '')).toLowerCase();

  const activeMuscles = useMemo(() => {
    const groups = [
      { id: 'pectoral', terms: ['pecho', 'chest', 'pectoral', 'banca', 'flexion', 'pushup'] },
      { id: 'abs', terms: ['abs', 'core', 'abdominal', 'plank', 'plancha', 'crunch', 'jab', 'cross'] },
      { id: 'deltoid', terms: ['hombro', 'shoulder', 'militar', 'press', 'delto', 'upper'] },
      { id: 'biceps', terms: ['bicep', 'curl', 'brazo', 'pullup', 'dominada'] },
      { id: 'triceps', terms: ['tricep', 'flexion', 'press', 'fondo', 'dips', 'jab', 'cross'] },
      { id: 'quads', terms: ['pierna', 'cuadric', 'sentadilla', 'squat', 'lunge', 'zancada', 'prensa'] },
      { id: 'hams', terms: ['isquio', 'femoral', 'muerto', 'deadlift', 'glute'] },
      { id: 'calves', terms: ['gemelo', 'calf', 'comba', 'jump', 'correr', 'sprint'] },
      { id: 'back', terms: ['espalda', 'back', 'dorsal', 'remo', 'pullup', 'dominada'] }
    ];
    return groups.filter(g => g.terms.some(term => q.includes(term))).map(g => g.id);
  }, [q]);

  const getMuscleStyle = (muscleId: string) => {
    const isActive = activeMuscles.includes(muscleId);
    if (!isActive) return { fill: '#1a1d23', stroke: '#2e3541', strokeWidth: '0.8' };
    
    return { 
      fill: '#00f2ff', 
      filter: 'drop-shadow(0 0 4px #00f2ff)',
      animation: playing && !isDone ? 'anatomical-glow 2s ease-in-out infinite' : 'none'
    };
  };

  const sizeMap = {
    sm: 'w-24 h-24',
    md: 'w-48 h-48',
    lg: 'w-full h-80'
  };

  return (
    <div
      className={`relative ${sizeMap[size]} overflow-hidden bg-[#05070a] border border-white/5 group ${isDone ? 'opacity-40 grayscale' : ''} ${className} flex items-center justify-center`}
      onClick={(e) => { e.stopPropagation(); setPlaying(p => !p); }}
    >
      <style dangerouslySetInnerHTML={{ __html: SVG_ANIMATIONS }} />
      
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Anatomical Heatmap Background Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,#00f2ff_0%,transparent_70%)] animate-pulse" />
        </div>

        <svg 
          viewBox="0 0 200 400" 
          className="w-full h-full max-w-[320px]"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Central Glow */}
          {playing && !isDone && (
            <circle cx="100" cy="180" r="140" fill="url(#grad-glow-strong)" />
          )}

          <defs>
            <radialGradient id="grad-glow-strong" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00f2ff" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#00f2ff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Main Anatomical Figure */}
          <g style={{ 
            animation: playing && !isDone ? (
              animationType === 'squat' ? 'concentric-eccentric-squat 2s ease-in-out infinite' : 
              animationType === 'press' ? 'concentric-eccentric-press 1.8s ease-in-out infinite' : 
              'none'
            ) : 'none',
            transformOrigin: '100px 250px'
          }}>
            {/* Cabez y Cuello */}
            <path d="M100 30 C112 30 120 42 120 58 C120 74 108 82 100 82 C92 82 80 74 80 58 C80 42 88 30 100 30" fill="#1a1d23" stroke="#2e3541" />
            
            {/* Torso / Core */}
            <path d="M75 90 L125 90 L135 150 L120 230 L80 230 L65 150 Z" fill="#0f1115" stroke="#2e3541" strokeWidth="1" />
            
            {/* Pectorales */}
            <path d="M78 100 C90 98 100 102 100 102 S110 98 122 100 C125 115 118 135 100 135 C82 135 75 115 78 100" style={getMuscleStyle('pectoral')} />
            
            {/* Abdominales (Rectus Abdominis) */}
            {[145, 160, 175, 190].map((y) => (
              <g key={y}>
                <rect x="86" y={y} width="12" height="12" rx="2" style={getMuscleStyle('abs')} />
                <rect x="102" y={y} width="12" height="12" rx="2" style={getMuscleStyle('abs')} />
              </g>
            ))}

            {/* Serratos / Oblicuos */}
            <path d="M70 140 L75 220" stroke="#2e3541" strokeWidth="0.5" strokeDasharray="2 2" />
            <path d="M130 140 L125 220" stroke="#2e3541" strokeWidth="0.5" strokeDasharray="2 2" />

            {/* Hombros (Deltoides) */}
            <path d="M62 90 C50 90 45 105 45 125 C45 140 55 150 70 145 C78 115 75 95 62 90 Z" style={getMuscleStyle('deltoid')} />
            <path d="M138 90 C150 90 155 105 155 125 C155 140 145 150 130 145 C122 115 125 95 138 90 Z" style={getMuscleStyle('deltoid')} />

            {/* Brazos Superiores */}
            <g id="right-arm" style={{ animation: playing && !isDone && animationType === 'curl' ? 'concentric-eccentric-curl 1.5s ease-in-out infinite' : 'none', transformOrigin: '145px 125px' }}>
              {/* Biceps/Triceps area */}
              <path d="M145 125 L165 190 C168 205 160 215 150 210 L135 150 Z" style={getMuscleStyle('biceps')} />
              {/* Forearm */}
              <path d="M155 210 L170 280 C172 295 162 305 150 295 L140 215 Z" fill="#1a1d23" stroke="#2e3541" />
            </g>

            <g id="left-arm">
              <path d="M55 125 L35 190 C32 205 40 215 50 210 L65 150 Z" style={getMuscleStyle('biceps')} />
              <path d="M45 210 L30 280 C28 295 38 305 50 295 L60 215 Z" fill="#1a1d23" stroke="#2e3541" />
            </g>

            {/* Pelvis */}
            <path d="M80 230 L120 230 L135 260 L65 260 Z" fill="#1a1d23" stroke="#2e3541" strokeWidth="1" />

            {/* Piernas (Biomecanicamente correctas) */}
            <g id="right-leg" style={{ animation: (animationType === 'run') ? 'run-leg-l 0.6s infinite' : 'none', transformOrigin: '115px 250px' }}>
              {/* Cuadriceps */}
              <path d="M102 260 L108 335 L135 330 C145 315 145 285 135 260 Z" style={getMuscleStyle('quads')} />
              {/* Pantorrillas */}
              <path d="M108 335 L108 390 L130 395 L135 330 Z" style={getMuscleStyle('calves')} />
            </g>

            <g id="left-leg" style={{ animation: (animationType === 'run') ? 'run-leg-r 0.6s infinite' : 'none', transformOrigin: '85px 250px' }}>
              <path d="M98 260 L92 335 L65 330 C55 315 55 285 65 260 Z" style={getMuscleStyle('quads')} />
              <path d="M92 335 L92 390 L70 395 L65 330 Z" style={getMuscleStyle('calves')} />
            </g>
          </g>

          {/* Muscle Highlight Indicator (Mini anatomical map bottom corner) */}
          <g transform="scale(0.2) translate(800, 1600)" opacity="0.6">
            <rect x="0" y="0" width="200" height="400" rx="40" fill="#1a1d23" />
            <text x="100" y="380" textAnchor="middle" fill="#00f2ff" fontSize="40" fontWeight="bold">FOCUS</text>
            <circle cx="100" cy="100" r="30" fill={activeMuscles.length > 0 ? '#00f2ff' : '#2e3541'} />
            <path d="M80 150 L120 150 L130 250 L70 250 Z" fill={activeMuscles.some(m => ['chest', 'abs', 'back'].includes(m)) ? '#00f2ff' : '#2e3541'} />
          </g>
        </svg>
      </div>

      <AnimatePresence>
        {!playing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#00f2ff]/20 border border-[#00f2ff]/50 flex items-center justify-center text-[#00f2ff]">
              <Play fill="currentColor" size={32} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isDone && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md pointer-events-none">
          <div className="relative">
            <div className="absolute inset-0 blur-xl bg-[#00f2ff]/50 animate-pulse" />
            <CheckCircle2 size={80} className="text-[#00f2ff] relative z-10" />
          </div>
        </div>
      )}

      {/* Info Label */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-black/60 backdrop-blur-md border border-white/5 py-1.5 px-3 rounded-xl pointer-events-none">
        <span className="text-[10px] font-black text-[#00f2ff] uppercase tracking-widest">{animationType}</span>
        <div className="flex gap-1">
          {activeMuscles.slice(0, 2).map(m => (
            <span key={m} className="text-[8px] bg-[#00f2ff]/10 text-[#00f2ff] px-1.5 py-0.5 rounded-full border border-[#00f2ff]/20 uppercase">
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
