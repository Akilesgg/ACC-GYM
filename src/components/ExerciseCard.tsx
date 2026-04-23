import { motion } from 'motion/react';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Circle, Layers, Zap } from 'lucide-react';
import { ExerciseAnimation } from './ExerciseAnimation';

interface ExerciseCardProps {
  exercise: {
    id: string;
    name: string;
    sets: string;
    reps: string;
    notes?: string;
    sportName?: string;
  };
  isCompleted: boolean;
  onToggle: () => void;
}

export function ExerciseCard({ exercise, isCompleted, onToggle }: any) {
  return (
    <Card 
      onClick={onToggle}
      className={`relative overflow-hidden group cursor-pointer transition-all border-2 rounded-[2rem] ${
        isCompleted 
          ? 'bg-primary/5 border-primary/20 opacity-80' 
          : 'bg-surface border-white/5 hover:border-primary/40'
      }`}
    >
      <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 relative z-10 text-left">
        <ExerciseAnimation type={exercise.name} isDone={isCompleted} size="md" />

        <div className="flex-1 w-full space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">
                {exercise.sportName || 'ENTRENAMIENTO'}
              </span>
              <h4 className={`text-2xl md:text-3xl font-headline font-black uppercase italic leading-tight ${isCompleted ? 'line-through opacity-40 text-on-surface-variant' : 'text-on-surface'}`}>
                {exercise.name}
              </h4>
            </div>

            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all shrink-0 ${
              isCompleted 
                ? 'bg-primary border-primary text-on-primary shadow-lg shadow-primary/40' 
                : 'border-white/10 group-hover:border-primary/50 text-white/10'
            }`}>
              {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl">
              <Layers size={14} className="text-secondary" />
              <span className="text-xs font-black uppercase tracking-widest">{exercise.sets} <span className="opacity-40 whitespace-nowrap">Series</span></span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl">
              <Zap size={14} className="text-primary" />
              <span className="text-xs font-black uppercase tracking-widest">{exercise.reps} <span className="opacity-40 whitespace-nowrap">Reps/Min</span></span>
            </div>
          </div>
          
          {exercise.notes && (
            <p className="text-xs font-medium text-on-surface-variant italic leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
              "{exercise.notes}"
            </p>
          )}
        </div>
      </div>

      {isCompleted && (
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-secondary"
        />
      )}
    </Card>
  );
}
