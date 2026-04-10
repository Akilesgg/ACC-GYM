import { Sparkles, PlusCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { getNutritionAdvice } from '@/src/services/geminiService';

export default function Nutrition() {
  const [advice, setAdvice] = useState("Loading AI insights...");

  useEffect(() => {
    getNutritionAdvice({ protein: 180, carbs: 210, fats: 65 }, "high-intensity leg day")
      .then(setAdvice);
  }, []);

  const meals = [
    { name: 'Avocado Toast', kcal: 450, macros: 'P: 18g | C: 42g | F: 22g', time: 'Breakfast • 08:30 AM', seed: 'toast' },
    { name: 'Salmon Power Bowl', kcal: 620, macros: 'P: 45g | C: 55g | F: 24g', time: 'Lunch • 01:15 PM', seed: 'salmon' },
  ];

  return (
    <div className="space-y-12 pb-24">
      <section>
        <h2 className="font-headline text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant">Performance Streak</h2>
        <div className="flex items-end gap-2 mt-2">
          <span className="font-headline text-5xl font-black italic text-primary leading-none">14</span>
          <span className="font-headline text-lg font-bold uppercase text-primary mb-1">Days In Zone</span>
        </div>
      </section>

      {/* Calorie Summary */}
      <Card className="bg-surface border-none p-8 relative overflow-hidden flex flex-col items-center justify-center">
        <div className="relative z-10 text-center">
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant mb-4 block">Remaining Calories</span>
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-48 h-48 -rotate-90">
              <circle className="text-surface-variant" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="8" />
              <circle className="text-primary" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeDasharray="552" strokeDashoffset="138" strokeLinecap="round" strokeWidth="12" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-headline text-4xl font-black">2,450</span>
              <span className="font-sans text-[10px] font-bold uppercase text-on-surface-variant">kcal</span>
            </div>
          </div>
        </div>
        <div className="w-full grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-outline-variant/10">
          {[
            { label: 'Protein', value: '180g', color: 'bg-primary' },
            { label: 'Carbs', value: '210g', color: 'bg-secondary' },
            { label: 'Fats', value: '65g', color: 'bg-tertiary' },
          ].map((macro) => (
            <div key={macro.label} className="text-center">
              <div className={`w-full h-1 ${macro.color} rounded-full mb-2`} />
              <span className="block font-headline text-lg font-bold">{macro.value}</span>
              <span className="block font-sans text-[10px] font-bold uppercase text-on-surface-variant">{macro.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Advisor */}
      <Card className="bg-surface border-l-4 border-secondary p-6 relative group overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles size={20} className="text-secondary fill-secondary" />
          <h3 className="font-headline text-sm font-black uppercase tracking-widest text-secondary">AI NUTRITION ADVISOR</h3>
        </div>
        <p className="text-on-surface leading-relaxed">{advice}</p>
      </Card>

      {/* Meal Log */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h3 className="font-headline text-xl font-black uppercase italic tracking-tighter">Meal Log</h3>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase">4 Entries Total</span>
        </div>
        <div className="space-y-4">
          {meals.map((meal) => (
            <Card key={meal.name} className="bg-surface border-none overflow-hidden flex h-32 group hover:bg-surface-variant/30 transition-colors">
              <div className="w-32 h-full overflow-hidden shrink-0 relative">
                <img 
                  src={`https://picsum.photos/seed/${meal.seed}/300/300`} 
                  alt={meal.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface" />
              </div>
              <div className="flex-grow p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="font-headline font-bold">{meal.name}</h4>
                    <span className="font-headline text-sm font-bold text-primary">{meal.kcal} kcal</span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant mt-1">{meal.macros}</p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase text-outline">{meal.time}</span>
                  <Button size="icon" variant="ghost" className="w-8 h-8 rounded-full bg-surface-variant/50 text-primary">
                    <PlusCircle size={18} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <Button variant="outline" className="w-full py-8 rounded-xl border-2 border-dashed border-outline-variant/30 flex items-center justify-center gap-3 text-on-surface-variant hover:border-primary/40 hover:text-primary transition-all bg-transparent">
          <PlusCircle size={20} />
          <span className="font-headline text-sm font-bold uppercase tracking-widest">Log Next Meal</span>
        </Button>
      </section>

      {/* Adherence */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="font-headline text-xl font-black uppercase italic tracking-tighter">Adherence</h3>
            <p className="text-[10px] text-on-surface-variant uppercase mt-1">Weekly Macro Consistency</p>
          </div>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className="w-2 h-2 rounded-full bg-secondary" />
          </div>
        </div>
        <Card className="bg-surface border-none p-6 h-48 flex items-end justify-between gap-2">
          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, i) => (
            <div key={day} className="flex flex-col items-center gap-2 flex-1 group">
              <div className="w-full bg-surface-variant rounded-t-full relative overflow-hidden" style={{ height: `${[60, 80, 100, 70, 90, 50, 85][i]}%` }}>
                <div 
                  className={`absolute bottom-0 w-full ${i === 5 ? 'bg-tertiary' : 'bg-primary'} rounded-t-full`} 
                  style={{ height: `${[85, 95, 70, 90, 100, 40, 88][i]}%` }} 
                />
              </div>
              <span className={`text-[10px] font-black ${i === 5 ? 'text-tertiary' : 'text-on-surface-variant'} group-hover:text-primary transition-colors`}>{day}</span>
            </div>
          ))}
        </Card>
      </section>
    </div>
  );
}
