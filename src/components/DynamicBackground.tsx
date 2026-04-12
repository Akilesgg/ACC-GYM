import { motion } from 'motion/react';
import { useMemo } from 'react';

const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop', // Gym
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop', // Fitness
  'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070&auto=format&fit=crop', // Running
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2070&auto=format&fit=crop', // Football
  'https://images.unsplash.com/photo-1518611012118-2969c6390ec2?q=80&w=2070&auto=format&fit=crop', // Yoga
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2070&auto=format&fit=crop', // Boxing
  'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2070&auto=format&fit=crop', // Cycling
  'https://images.unsplash.com/photo-1599058917233-358384459a8c?q=80&w=2070&auto=format&fit=crop', // MMA
  'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=2070&auto=format&fit=crop', // Weights
];

export default function DynamicBackground() {
  const images = useMemo(() => {
    const shuffled = [...BACKGROUND_IMAGES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-background">
      {/* Base Image Layers */}
      {images.map((img, idx) => (
        <motion.div 
          key={idx}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ 
            scale: [1.2, 1, 1.15],
            opacity: [0, 0.15, 0.08, 0],
            filter: ['grayscale(100%) contrast(1.2) blur(4px)', 'grayscale(100%) contrast(1.5) blur(0px)', 'grayscale(100%) contrast(1.2) blur(2px)']
          }}
          transition={{ 
            duration: 25, 
            delay: idx * 6,
            repeat: Infinity, 
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}

      {/* Tech Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} 
      />

      {/* Moving Scanning Line */}
      <motion.div 
        animate={{ 
          top: ['-10%', '110%'],
          opacity: [0, 0.5, 0]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent z-10"
      />

      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 100 + '%', 
            y: Math.random() * 100 + '%',
            opacity: 0 
          }}
          animate={{ 
            y: [null, '-20%'],
            opacity: [0, 0.2, 0]
          }}
          transition={{ 
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "linear"
          }}
          className="absolute w-1 h-1 bg-secondary rounded-full"
        />
      ))}

      {/* Vignette & Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-80" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/40" />
    </div>
  );
}
