import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { Dumbbell } from 'lucide-react';

interface ExerciseAnimationProps {
  type: string;
  isDone: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ExerciseAnimation = ({ type, isDone, className = '', size = 'md' }: ExerciseAnimationProps) => {
  const isBoxing = type.toLowerCase().includes('box') || type.toLowerCase().includes('jab') || type.toLowerCase().includes('hook') || type.toLowerCase().includes('uppercut') || type.toLowerCase().includes('punch') || type.toLowerCase().includes('saco') || type.toLowerCase().includes('pera') || type.toLowerCase().includes('sombra');
  const isLifting = type.toLowerCase().includes('press') || type.toLowerCase().includes('pesa') || type.toLowerCase().includes('mancuerna') || type.toLowerCase().includes('sentadilla') || type.toLowerCase().includes('squat') || type.toLowerCase().includes('deadlift') || type.toLowerCase().includes('flexion') || type.toLowerCase().includes('pushup') || type.toLowerCase().includes('abdomen') || type.toLowerCase().includes('abs');
  const isRunning = type.toLowerCase().includes('run') || type.toLowerCase().includes('correr') || type.toLowerCase().includes('rodaje') || type.toLowerCase().includes('sprint') || type.toLowerCase().includes('atletismo') || type.toLowerCase().includes('comba') || type.toLowerCase().includes('salto') || type.toLowerCase().includes('cardio');
  
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 16,
    md: 32,
    lg: 48
  };

  return (
    <div className={`relative ${sizeClasses[size]} rounded-[2rem] overflow-hidden bg-black/40 border border-white/5 flex items-center justify-center shrink-0 shadow-2xl ${isDone ? 'opacity-40 scale-95' : ''} ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
      
      {/* Moving background lines to simulate activity */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              x: [-100, 200],
              opacity: [0, 0.1, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              delay: i * 0.7,
              ease: "linear"
            }}
            className="absolute h-[1px] w-full bg-primary top-1/2 -translate-y-1/2 rotate-45"
            style={{ top: `${20 + i * 30}%` }}
          />
        ))}
      </div>
      
      {isBoxing && (
        <div className="relative">
          <motion.div
            animate={{ 
              x: size === 'sm' ? [0, 10, 0] : [0, 40, 0],
              scale: [1, 1.2, 1],
              rotate: [0, -10, 0]
            }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "circOut" }}
            className="text-primary"
          >
            <Icons.Zap size={iconSizes[size]} />
          </motion.div>
          <div className={`absolute ${size === 'sm' ? '-left-2' : '-left-4'} top-1/2 -translate-y-1/2 ${size === 'sm' ? 'w-2 h-2' : 'w-4 h-4'} rounded-full bg-primary/20 animate-ping`} />
        </div>
      )}

      {isLifting && (
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ 
              y: size === 'sm' ? [5, -5, 5] : [10, -10, 10],
              scaleY: [0.9, 1.1, 0.9]
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-secondary"
          >
            <Dumbbell size={iconSizes[size]} />
          </motion.div>
          <motion.div 
            animate={{ width: size === 'sm' ? [10, 20, 10] : [20, 40, 20], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-1 bg-secondary/30 rounded-full mt-2" 
          />
        </div>
      )}

      {isRunning && (
        <div className="flex gap-1 md:gap-2">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ 
                y: size === 'sm' ? [0, -5, 0] : [0, -15, 0],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{ 
                duration: 0.6, 
                repeat: Infinity, 
                delay: i * 0.2,
                ease: "easeInOut" 
              }}
              className={`${size === 'sm' ? 'w-1 h-4' : 'w-2 h-8'} bg-primary rounded-full`}
            />
          ))}
        </div>
      )}

      {!isBoxing && !isLifting && !isRunning && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="text-white/20"
        >
          <Icons.Activity size={iconSizes[size]} />
        </motion.div>
      )}
      
      {size !== 'sm' && (
        <div className="absolute bottom-1 right-2">
          <span className="text-[6px] font-black uppercase tracking-widest opacity-40">Guía Visual</span>
        </div>
      )}
    </div>
  );
};
