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
      className={`relative overflow-hidden group cursor-pointer transition-all border border-[#2d2420] rounded-[2rem] ${
        isCompleted 
          ? 'bg-[#22c55e]/5 border-[#22c55e]/20 opacity-80' 
          : 'bg-[#1a1614] hover:border-[#22c55e]/50 shadow-2xl'
      }`}
    >
      <div className="p-6 md:p-8 flex flex-col lg:flex-row items-center gap-10 relative z-10 text-left">
        <div className="relative shrink-0 w-full lg:w-64">
           <ExerciseAnimation type={exercise.name} isDone={isCompleted} size="lg" className="rounded-2xl border border-white/5 bg-black/40 shadow-xl" />
        </div>

        <div className="flex-1 w-full space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#22c55e] italic">
                {exercise.sportName || 'ENTRENAMIENTO'}
              </span>
              <h4 className={`text-2xl md:text-4xl font-headline font-black uppercase italic leading-tight transition-colors ${isCompleted ? 'line-through opacity-40 text-[#8e7b71]' : 'text-white group-hover:text-[#22c55e]'}`}>
                {exercise.name}
              </h4>
            </div>

            <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all shrink-0 ${
              isCompleted 
                ? 'bg-[#22c55e] border-[#22c55e] text-black shadow-[0_0_20px_rgba(34,197,94,0.4)] scale-110' 
                : 'border-white/10 group-hover:border-[#22c55e]/50 text-white/5'
            }`}>
              {isCompleted ? <CheckCircle2 size={32} /> : <Circle size={32} className="opacity-20" />}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col bg-black/30 px-6 py-3 rounded-2xl border border-white/5 min-w-[120px]">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8e7b71] mb-1">Series</span>
              <span className="text-xl font-black text-white">{exercise.sets}</span>
            </div>
            <div className="flex flex-col bg-black/30 px-6 py-3 rounded-2xl border border-white/5 min-w-[120px]">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8e7b71] mb-1">Repeticiones</span>
              <span className="text-xl font-black text-white">{exercise.reps}</span>
            </div>
          </div>
          
          {exercise.notes && (
            <div className="relative p-4 bg-black/20 rounded-2xl border-l-4 border-[#22c55e]">
               <p className="text-sm font-medium text-[#b4a59d] italic leading-relaxed">
                "{exercise.notes}"
              </p>
            </div>
          )}
        </div>
      </div>

      {isCompleted && (
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          className="absolute bottom-0 left-0 h-1 bg-[#22c55e] shadow-[0_0_15px_rgba(34,197,94,0.8)]"
        />
      )}
    </Card>
  );
}
