import { motion } from 'motion/react';
import { useMemo } from 'react';

const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop', // Gym
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop', // Fitness
  'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070&auto=format&fit=crop', // Running
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2070&auto=format&fit=crop', // Football
  'https://images.unsplash.com/photo-1518611012118-2969c6390ec2?q=80&w=2070&auto=format&fit=crop', // Yoga
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2070&auto=format&fit=crop', // Boxing
];

export default function DynamicBackground() {
  const randomImage = useMemo(() => BACKGROUND_IMAGES[Math.floor(Math.random() * BACKGROUND_IMAGES.length)], []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <motion.div 
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ 
          scale: [1.2, 1, 1.1],
          opacity: 0.15,
          filter: ['grayscale(100%) blur(4px)', 'grayscale(100%) blur(0px)', 'grayscale(100%) blur(2px)']
        }}
        transition={{ 
          duration: 30, 
          repeat: Infinity, 
          repeatType: "reverse",
          ease: "linear"
        }}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${randomImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-60" />
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
}
