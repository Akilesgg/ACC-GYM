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
  @keyframes squat {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(35px) scale(0.95, 0.85); }
  }
  @keyframes press {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-35px); }
  }
  @keyframes run-body {
    0%, 100% { transform: translateY(0) rotate(-2deg); }
    50% { transform: translateY(-5px) rotate(2deg); }
  }
  @keyframes run-leg-l {
    0%, 100% { transform: rotate(45deg); }
    50% { transform: rotate(-45deg); }
  }
  @keyframes run-leg-r {
    0%, 100% { transform: rotate(-45deg); }
    50% { transform: rotate(45deg); }
  }
  @keyframes punch-torso {
    0%, 100% { transform: rotate(0deg); }
    30% { transform: rotate(-15deg); }
  }
  @keyframes punch-arm {
    0%, 100% { transform: translateX(0) scaleX(1); }
    30% { transform: translateX(50px) scaleX(1.4); }
  }
  @keyframes muscle-active-glow {
    0%, 100% { filter: brightness(1) drop-shadow(0 0 2px currentColor); opacity: 0.8; }
    50% { filter: brightness(1.8) drop-shadow(0 0 10px currentColor); opacity: 1; }
  }
`;

const getAnimationType = (name: string) => {
  const q = name.toLowerCase();
  if (q.includes('sentadilla') || q.includes('squat') || q.includes('zancada') || q.includes('lunge') || q.includes('pierna')) return 'squat';
  if (q.includes('press') || q.includes('militar') || q.includes('flexion') || q.includes('push up') || q.includes('dominada')) return 'press';
  if (q.includes('jab') || q.includes('cross') || q.includes('punch') || q.includes('boxeo')) return 'punch';
  if (q.includes('correr') || q.includes('sprint') || q.includes('comba')) return 'run';
  return 'squat';
};

export const ExerciseAnimation = ({ type, isDone, className = '', size = 'md', muscleGroup }: ExerciseAnimationProps) => {
  const [playing, setPlaying] = useState(true);
  
  const animationType = getAnimationType(type);
  const q = (type + ' ' + (muscleGroup || '')).toLowerCase();

  const isMuscleActive = (group: string) => {
    const groupMap: Record<string, string[]> = {
      'chest': ['pecho', 'chest', 'pectoral', 'banca', 'flexion', 'pushup'],
      'abs': ['abs', 'core', 'abdominal', 'plank', 'plancha', 'crunch', 'jab', 'cross'],
      'shoulders': ['hombro', 'shoulder', 'militar', 'press', 'delto', 'upper'],
      'biceps': ['bicep', 'curl', 'brazo', 'pullup', 'dominada'],
      'triceps': ['tricep', 'flexion', 'press', 'fondo', 'dips', 'jab', 'cross'],
      'quads': ['pierna', 'cuadric', 'sentadilla', 'squat', 'lunge', 'zancada', 'prensa'],
      'hams': ['isquio', 'femoral', 'muerto', 'deadlift', 'glute'],
      'calves': ['gemelo', 'calf', 'comba', 'jump', 'correr', 'sprint']
    };
    return groupMap[group]?.some(term => q.includes(term)) || false;
  };

  const getMuscleStyle = (group: string) => {
    const active = isMuscleActive(group);
    if (!active) return { fill: '#1a1d23', stroke: '#2e3541', strokeWidth: '0.5' };
    
    return { 
      fill: '#00f2ff', 
      color: '#00f2ff',
      animation: playing && !isDone ? 'muscle-active-glow 1.5s infinite' : 'none'
    };
  };

  const sizeMap = {
    sm: 'w-24 h-24',
    md: 'w-48 h-48',
    lg: 'w-full h-80'
  };

  return (
    <div
      className={`relative ${sizeMap[size]} overflow-hidden shrink-0 bg-[#0a0c10] border border-white/5 group ${isDone ? 'opacity-40 grayscale' : ''} ${className}`}
      onClick={(e) => { e.stopPropagation(); setPlaying(p => !p); }}
    >
      <style dangerouslySetInnerHTML={{ __html: SVG_ANIMATIONS }} />
      
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <svg 
          viewBox="0 0 200 400" 
          className="w-full h-full max-w-[280px]"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <radialGradient id="grad-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00f2ff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#00f2ff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {playing && !isDone && (
            <circle cx="100" cy="150" r="120" fill="url(#grad-glow)" />
          )}

          <g style={{ 
            animation: playing && !isDone ? (animationType === 'squat' ? 'squat 1.5s ease-in-out infinite' : animationType === 'press' ? 'press 1.5s ease-in-out infinite' : animationType === 'run' ? 'run-body 0.6s infinite' : animationType === 'punch' ? 'punch-torso 0.8s infinite' : 'none') : 'none',
            transformOrigin: '100px 200px'
          }}>
            <path d="M100 20 C115 20 125 35 125 55 C125 75 110 85 100 85 C90 85 75 75 75 55 C75 35 85 20 100 20" fill="#1a1d23" />
            <path d="M92 82 L108 82 L110 95 L90 95 Z" fill="#1a1d23" />

            <path d="M85 95 L115 95 L130 110 L70 110 Z" style={getMuscleStyle('shoulders')} />
            <path d="M72 115 C85 112 100 115 100 115 S115 112 128 115 C132 135 120 155 100 155 C80 155 68 135 72 115" style={getMuscleStyle('chest')} />
            <line x1="100" y1="115" x2="100" y2="155" stroke="#0a0c10" strokeWidth="1" opacity="0.3" />

            {[165, 185, 205].map((y, i) => (
              <g key={y}>
                <rect x="82" y={y} width="16" height="15" rx="3" style={getMuscleStyle('abs')} />
                <rect x="102" y={y} width="16" height="15" rx="3" style={getMuscleStyle('abs')} />
              </g>
            ))}

            <path d="M70 110 L65 170 L80 230 L120 230 L135 170 L130 110 Z" fill="none" stroke="#2e3541" strokeWidth="1" />
            <path d="M55 110 C45 110 40 120 40 135 C40 150 50 160 65 160 C75 160 75 125 70 110 Z" style={getMuscleStyle('shoulders')} />
            <path d="M145 110 C155 110 160 120 160 135 C160 150 150 160 135 160 C125 160 125 125 130 110 Z" style={getMuscleStyle('shoulders')} />

            <g style={{ animation: playing && !isDone && animationType === 'punch' ? 'punch-arm 0.8s infinite' : 'none', transformOrigin: '65px 110px' }}>
              <path d="M40 135 L30 200 C28 215 35 225 45 220 L55 160 Z" style={getMuscleStyle('biceps')} />
              <path d="M35 220 L25 300 C24 310 35 315 45 305 L50 225 Z" fill="#1a1d23" stroke="#2e3541" strokeWidth="0.5" />
            </g>

            <path d="M160 135 L170 200 C172 215 165 225 155 220 L145 160 Z" style={getMuscleStyle('biceps')} />
            <path d="M165 220 L175 300 C176 310 165 315 155 305 L150 225 Z" fill="#1a1d23" stroke="#2e3541" strokeWidth="0.5" />

            <path d="M80 230 L120 230 L135 265 L65 265 Z" fill="#1a1d23" stroke="#2e3541" strokeWidth="1" />

            <g style={{ animation: playing && !isDone && animationType === 'run' ? 'run-leg-l 0.6s infinite' : 'none', transformOrigin: '80px 260px' }}>
              <path d="M65 265 C60 290 65 330 80 340 L95 340 L100 265 Z" style={getMuscleStyle('quads')} />
              <path d="M80 340 L75 390 L95 390 L95 340 Z" style={getMuscleStyle('calves')} />
            </g>

            <g style={{ animation: playing && !isDone && animationType === 'run' ? 'run-leg-r 0.6s infinite' : 'none', transformOrigin: '120px 260px' }}>
              <path d="M100 265 L105 340 L120 340 C135 330 140 290 135 265 Z" style={getMuscleStyle('quads')} />
              <path d="M105 340 L105 390 L125 390 L120 340 Z" style={getMuscleStyle('calves')} />
            </g>
          </g>
        </svg>
      </div>

      {isDone && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none">
          <CheckCircle2 size={size === 'lg' ? 64 : 32} className="text-[#00f2ff] drop-shadow-[0_0_15px_#00f2ff]" />
        </div>
      )}
    </div>
  );
};
