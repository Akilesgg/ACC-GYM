import { motion } from 'motion/react';
import { useEffect } from 'react';
import * as Icons from 'lucide-react';
import { Dumbbell } from 'lucide-react';

interface ExerciseAnimationProps {
  type: string;
  isDone: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ExerciseAnimation = ({ type, isDone, className = '', size = 'md' }: ExerciseAnimationProps) => {
  const t = type.toLowerCase();
  
  // Mapping muscle groups or types to specific "anatomical" looking images
  // These are Unsplash IDs that have a more technical / clinical or muscle focus feel
const muscleMap: Record<string, string> = {
    'pecho': 'photo-1544367567-0f2fcb009e0b', // anatomy
    'chest': 'photo-1544367567-0f2fcb009e0b',
    'hombros': 'photo-1534438327276-14e5300c3a48', // detail
    'shoulder': 'photo-1534438327276-14e5300c3a48',
    'brazos': 'photo-1583454110551-21f2fa2adfcd',
    'arms': 'photo-1583454110551-21f2fa2adfcd',
    'piernas': 'photo-1434608519344-49d77a699e1d',
    'legs': 'photo-1434608519344-49d77a699e1d',
    'espalda': 'photo-1541534741688-6078c65b12de',
    'back': 'photo-1541534741688-6078c65b12de',
    'core': 'photo-1571019623452-c697c22c067e',
    'abdominal': 'photo-1571019623452-c697c22c067e',
    'cardio': 'photo-1538805060514-97d9cc17730c',
    'full body': 'photo-1576086213369-97a306d36557', // anatomical diagram
  };

  const currentMuscle = Object.keys(muscleMap).find(m => t.includes(m)) || 'full body';
  const imageId = muscleMap[currentMuscle];
  const imageUrl = `https://images.unsplash.com/${imageId}?w=400&auto=format&fit=crop&q=80`;

  // Subtle medical biosensor sound effect on pulse
  useEffect(() => {
    if (!isDone) {
      const playPulse = () => {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(120, audioCtx.currentTime);
          gainNode.gain.setValueAtTime(0.005, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.1);
          
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.1);
          setTimeout(() => audioCtx.close(), 200);
        } catch (e) {
          // Ignore audio errors if blocked by browser policy
        }
      };

      const interval = setInterval(playPulse, 2000);
      return () => clearInterval(interval);
    }
  }, [isDone]);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  return (
    <div className={`relative ${sizeClasses[size]} rounded-[2rem] overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center shrink-0 shadow-2xl group ${isDone ? 'opacity-40 scale-95' : ''} ${className}`}>
      {/* Background Image with anatomical feel */}
      <img 
        src={imageUrl} 
        alt={type} 
        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700" 
      />
      
      {/* Cyberpunk/Technical Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent opacity-40" />
      
      {/* Animated Technical Crosshair/Scanner */}
      <motion.div 
        animate={{ 
          rotate: 360,
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border-[1px] border-primary/20 rounded-full m-1 pointer-events-none"
      />

      {/* Pulse Effect on "Muscle" */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="w-12 h-12 rounded-full bg-primary/20 blur-xl pointer-events-none"
      />

      {/* Scanner line */}
      <motion.div 
        animate={{ 
          top: ['0%', '100%', '0%']
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[2px] bg-primary/40 shadow-[0_0_15px_rgba(var(--primary),0.5)] z-10"
      />

      {/* Real-time metrics simulation overlay */}
      <div className="absolute top-2 left-2 flex gap-1 items-start">
        <div className="w-1 h-3 bg-primary/60 rounded-full animate-pulse" />
        <div className="w-1 h-2 bg-primary/40 rounded-full animate-pulse delay-75" />
        <div className="w-1 h-4 bg-primary/80 rounded-full animate-pulse delay-150" />
      </div>

      <div className="relative z-20">
        <Dumbbell className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" size={size === 'sm' ? 16 : 32} />
      </div>
      
      {size !== 'sm' && (
        <div className="absolute bottom-1 right-2">
          <span className="text-[6px] font-black uppercase tracking-widest text-primary drop-shadow-sm">System Bio-Sync</span>
        </div>
      )}
    </div>
  );
};
