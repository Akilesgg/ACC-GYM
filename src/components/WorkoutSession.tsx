import { ChevronLeft, Info, Dumbbell, X, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function WorkoutSession() {
  const exercises = [
    { name: 'Barbell Bench Press', target: 'Chest, Triceps', icon: Dumbbell, sets: [{ id: '1', prev: '185 x 8', lbs: 195, reps: 8, done: true }, { id: '2', prev: '185 x 8', done: false }] },
    { name: 'Incline DB Flyes', target: 'Upper Chest', icon: Dumbbell, sets: [{ id: '1', prev: '45 x 12', done: false }] },
  ];

  return (
    <div className="space-y-12 pb-48">
      <section>
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="font-headline font-bold uppercase tracking-widest text-secondary text-[10px] mb-1">Session 04</p>
            <h2 className="font-headline text-4xl font-extrabold leading-tight">Hypertrophy<br />Push A</h2>
          </div>
          <div className="text-right">
            <p className="font-headline text-3xl font-bold text-primary">52:14</p>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Active Time</p>
          </div>
        </div>
        <div className="h-1 bg-surface-variant rounded-full overflow-hidden flex gap-1">
          <div className="h-full bg-primary w-1/3" />
          <div className="h-full bg-primary w-1/4" />
          <div className="h-full bg-surface-variant flex-1" />
        </div>
      </section>

      <div className="space-y-12">
        {exercises.map((ex) => (
          <article key={ex.name}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center border border-outline-variant/10">
                <ex.icon size={24} className="text-secondary" />
              </div>
              <div className="flex-1">
                <h3 className="font-headline text-xl font-bold">{ex.name}</h3>
                <p className="text-sm text-on-surface-variant">{ex.target}</p>
              </div>
              <Button variant="ghost" size="icon" className="text-on-surface-variant">
                <Info size={20} />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 px-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                <div className="col-span-2">Set</div>
                <div className="col-span-4 text-center">Previous</div>
                <div className="col-span-3 text-center">LBS</div>
                <div className="col-span-3 text-center">Reps</div>
              </div>

              {ex.sets.map((set) => (
                <div key={set.id} className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl border ${set.done ? 'bg-primary/5 border-primary/10' : 'bg-surface border-transparent'}`}>
                  <div className={`col-span-2 font-headline font-bold text-sm pl-2 ${set.done ? 'text-primary' : 'text-on-surface-variant'}`}>{set.id}</div>
                  <div className="col-span-4 text-center text-xs text-on-surface-variant">{set.prev}</div>
                  <div className="col-span-3">
                    <Input 
                      className="h-10 bg-surface-variant border-none text-center font-headline font-bold text-sm focus:ring-1 focus:ring-secondary" 
                      defaultValue={set.lbs}
                      placeholder="---"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input 
                      className="h-10 bg-surface-variant border-none text-center font-headline font-bold text-sm focus:ring-1 focus:ring-secondary" 
                      defaultValue={set.reps}
                      placeholder="--"
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="mt-4 w-full flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-secondary bg-transparent">
              <PlusCircle size={14} /> Add Set
            </Button>
          </article>
        ))}

        <Card className="bg-surface border-none p-6 relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="font-headline text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Volume Trend</h4>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-4xl font-extrabold">14,250</span>
              <span className="text-xs text-primary font-bold">+12% vs LW</span>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 left-0 h-16 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 400 100">
              <path d="M0 80 Q 50 20 100 50 T 200 30 T 300 70 T 400 10" fill="none" stroke="#cafd00" strokeWidth="4" />
            </svg>
          </div>
        </Card>
      </div>

      {/* Floating Action & Timer */}
      <div className="fixed bottom-32 left-6 right-6 z-40">
        <div className="glass-panel rounded-3xl p-4 flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <svg className="w-full h-full -rotate-90">
                <circle className="text-surface-variant" cx="20" cy="20" fill="none" r="18" stroke="currentColor" strokeWidth="3" />
                <circle className="text-secondary" cx="20" cy="20" fill="none" r="18" stroke="currentColor" strokeDasharray="113" strokeDashoffset="40" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">45s</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Rest Timer</p>
              <p className="text-sm font-headline font-bold">Get ready for Set 2</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-on-surface-variant">
            <X size={20} />
          </Button>
        </div>
        <Button className="w-full py-8 bg-primary text-background rounded-full font-headline font-black text-sm uppercase tracking-widest shadow-[0_0_40px_rgba(243,255,202,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
          <RotateCcw size={20} />
          Finish Workout
        </Button>
      </div>
    </div>
  );
}

function PlusCircle({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}
