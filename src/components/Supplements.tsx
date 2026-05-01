import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Language } from '../types';
import { ChevronLeft, Pill, Scale, Clock, Info, CheckCircle2, ShoppingCart, Zap, Droplets, AlertTriangle, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const SUPPLEMENTS = [
  {
    id: 'creatina',
    name: 'Creatina Monohidrato',
    icon: '⚡',
    color: '#22c55e',
    category: 'Fuerza y Potencia',
    what: 'La creatina es un compuesto natural almacenado en los músculos que proporciona energía rápida durante ejercicios de alta intensidad. Es el suplemento más estudiado y seguro en el deporte.',
    benefits: ['Aumenta la fuerza máxima (5-15%)', 'Mejora la potencia explosiva', 'Acelera la recuperación', 'Aumenta el volumen muscular', 'Mejora el rendimiento cognitivo'],
    timing: 'Cualquier momento del día, preferiblemente post-entreno con carbohidratos',
    dosePerKg: 0.08,
    minDose: 3,
    maxDose: 10,
    unit: 'g',
    phase: {
      loading: { dose: 20, days: 5, description: 'Fase de carga: 20g/día divididos en 4 tomas durante 5 días' },
      maintenance: { description: 'Fase de mantenimiento: dosis estándar diaria' }
    },
    warnings: ['Aumentar ingesta de agua', 'Posible retención de agua inicial', 'No necesaria fase de carga'],
    foods: ['Carne roja (2-7g/kg)', 'Pescado azul (4.5g/kg)', 'Cerdo (2.5g/kg)'],
    sports: ['Culturismo', 'Crossfit', 'MMA', 'Calistenia'],
  },
  {
    id: 'proteina',
    name: 'Proteína Whey',
    icon: '🥛',
    color: '#3b82f6',
    category: 'Masa Muscular',
    what: 'La proteína de suero de leche (whey) es una proteína completa de absorción rápida, ideal para después del entrenamiento. Contiene todos los aminoácidos esenciales.',
    benefits: ['Síntesis proteica muscular', 'Recuperación post-entreno', 'Saciedad y control calórico', 'Reparación de tejidos', 'Mantener músculo en déficit'],
    timing: '30 minutos post-entrenamiento, también como snack proteico',
    dosePerKg: 0.3,
    minDose: 20,
    maxDose: 40,
    unit: 'g',
    totalDailyProtein: 1.8,
    warnings: ['Contar como parte de proteína total diaria', 'No sustituye comidas reales', 'Hidratarse bien'],
    foods: ['Pollo (31g/100g)', 'Atún (30g/100g)', 'Huevos (13g/100g)', 'Legumbres (9g/100g)'],
    sports: ['Culturismo', 'Crossfit', 'Calistenia', 'MMA'],
  },
  {
    id: 'vitamina_c',
    name: 'Vitamina C',
    icon: '🍊',
    color: '#f59e0b',
    category: 'Recuperación y Sistema Inmune',
    what: 'Antioxidante esencial que protege las células del estrés oxidativo generado por el ejercicio intenso. Fundamental para la síntesis de colágeno y la absorción de hierro.',
    benefits: ['Reduce el daño oxidativo post-entreno', 'Refuerza el sistema inmune', 'Síntesis de colágeno (articulaciones)', 'Mejora absorción de hierro', 'Reduce el cortisol'],
    timing: 'Con las comidas, preferiblemente mañana y noche',
    dosePerKg: 0,
    fixedDose: { sedentary: 75, active: 250, intense: 500 },
    minDose: 250,
    maxDose: 1000,
    unit: 'mg',
    warnings: ['Dosis altas (>2g) pueden causar molestias digestivas', 'Dividir en 2 tomas si >500mg', 'El exceso se elimina por orina'],
    foods: ['Pimiento rojo (127mg/100g)', 'Kiwi (93mg)', 'Naranja (50mg)', 'Brócoli (89mg)'],
    sports: ['Todos los deportes'],
  },
  {
    id: 'vitamina_d',
    name: 'Vitamina D3',
    icon: '☀️',
    color: '#f59e0b',
    category: 'Hormonas y Huesos',
    what: 'Hormona vital sintetizada con la luz solar. El 80% de la población tiene deficiencia. Esencial para la testosterona, la absorción de calcio y la función muscular.',
    benefits: ['Optimiza niveles de testosterona', 'Absorción de calcio (huesos fuertes)', 'Función muscular y fuerza', 'Sistema inmune', 'Estado de ánimo y energía', 'Reduce inflamación'],
    timing: 'Con la comida principal (con grasa para mejor absorción)',
    fixedDose: { maintenance: 2000, deficiency: 4000, optimal: 5000 },
    minDose: 1000,
    maxDose: 5000,
    unit: 'UI',
    warnings: ['Tomar con vitamina K2 para mejor utilización', 'Hacerse analítica para comprobar niveles', 'Tóxica en dosis muy altas (>10.000 UI/día durante meses)'],
    foods: ['Salmón (600-1000 UI/100g)', 'Sardinas (300 UI)', 'Huevo (40 UI)', 'Sol (15 min = 10.000 UI)'],
    sports: ['Todos los deportes, especialmente indoor'],
  },
  {
    id: 'vitamina_b',
    name: 'Complejo Vitamina B',
    icon: '🧬',
    color: '#8b5cf6',
    category: 'Energía y Sistema Nervioso',
    what: 'Las vitaminas del grupo B (B1, B2, B3, B5, B6, B7, B9, B12) son cofactores esenciales en la producción de energía celular. Críticas para deportistas por el mayor metabolismo energético.',
    benefits: ['Producción de energía (ATP)', 'Función del sistema nervioso', 'Síntesis de glóbulos rojos (B12)', 'Metabolismo de proteínas (B6)', 'Reducción del cansancio', 'Recuperación mental'],
    timing: 'Por la mañana con el desayuno',
    fixedDose: { b6: 1.5, b12: 2.4, complex: 1 },
    minDose: 1,
    maxDose: 1,
    unit: 'cápsula',
    warnings: ['La B12 es especialmente importante para veganos', 'La B6 en exceso puede causar neuropatía', 'Orina amarilla es normal (B2)'],
    foods: ['B12: Carne, huevos, lácteos', 'B6: Pollo, plátano, aguacate', 'B9: Espinacas, legumbres'],
    sports: ['Todos, especialmente MMA y Boxeo (alto gasto nervioso)'],
  },
  {
    id: 'omega3',
    name: 'Omega-3 (EPA + DHA)',
    icon: '🐟',
    color: '#0ea5e9',
    category: 'Antiinflamatorio y Articulaciones',
    what: 'Ácidos grasos esenciales con potente efecto antiinflamatorio. Reducen el dolor articular, mejoran la salud cardiovascular y aceleran la recuperación muscular.',
    benefits: ['Antiinflamatorio natural', 'Salud articular (reduce dolor)', 'Salud cardiovascular', 'Función cerebral y concentración', 'Recuperación muscular', 'Reduce DOMS (agujetas)'],
    timing: 'Con las comidas principales para mejor absorción',
    dosePerKg: 0.04,
    minDose: 2,
    maxDose: 6,
    unit: 'g',
    warnings: ['Puede aumentar tiempo de coagulación en dosis altas', 'Refrigerar para evitar oxidación', 'Elegir certificado en metales pesados'],
    foods: ['Salmón (2.5g/100g)', 'Sardinas (1.5g/100g)', 'Nueces (2.5g/30g)', 'Semillas de chía (5g/30g)'],
    sports: ['Todos, especialmente deportes de contacto (Boxeo, MMA)'],
  },
  {
    id: 'magnesio',
    name: 'Magnesio',
    icon: '🔋',
    color: '#6b7280',
    category: 'Recuperación y Sueño',
    what: 'Mineral esencial en más de 300 reacciones enzimáticas. Crítico para la contracción muscular, el sueño reparador y la producción de energía. El 68% de la población tiene deficiencia.',
    benefits: ['Mejora calidad del sueño', 'Reduce calambres musculares', 'Producción de energía (ATP)', 'Reduce cortisol (estrés)', 'Síntesis proteica', 'Salud ósea'],
    timing: '1-2 horas antes de dormir para máximo efecto en el sueño',
    dosePerKg: 5,
    minDose: 200,
    maxDose: 500,
    unit: 'mg',
    warnings: ['Preferir glicinato o treonato (mejor absorción que óxido)', 'El exceso puede causar efecto laxante', 'Separar de zinc y calcio'],
    foods: ['Semillas de calabaza (156mg/30g)', 'Almendras (76mg/30g)', 'Espinacas (78mg/100g)', 'Chocolate negro (64mg/30g)'],
    sports: ['Todos, especialmente útil en Ciclismo y Crossfit por los calambres'],
  },
  {
    id: 'cafeina',
    name: 'Cafeína',
    icon: '☕',
    color: '#92400e',
    category: 'Rendimiento y Enfoque',
    what: 'El ergogénico más consumido y estudiado del mundo. Bloquea la adenosina (molécula del cansancio) y aumenta la adrenalina, mejorando el rendimiento en casi todos los deportes.',
    benefits: ['Aumenta resistencia aeróbica (10-15%)', 'Mejora fuerza y potencia', 'Retrasa la fatiga', 'Mejora concentración y reflejos', 'Quema grasa (termogénico)', 'Reduce RPE (esfuerzo percibido)'],
    timing: '30-60 minutos antes del entrenamiento',
    dosePerKg: 3,
    minDose: 100,
    maxDose: 400,
    unit: 'mg',
    warnings: ['No tomar después de las 14h (afecta el sueño)', 'Tolerancia aumenta con el uso → ciclar', 'Evitar en hipertensión sin consultar médico', 'Dosis >9mg/kg puede ser tóxica'],
    foods: ['Café espresso (63mg/30ml)', 'Té verde (35mg/cup)', 'Mate (80mg/cup)', 'Chocolate negro (12mg/30g)'],
    sports: ['Todos, especialmente Crossfit, Ciclismo y Boxeo'],
  },
];

interface SupplementsProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onBack: () => void;
  language: Language;
}

export default function Supplements({ profile, onUpdateProfile, onBack, language }: SupplementsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const userWeight = profile.weight || 70;

  const calcDose = (supp: any, weight: number) => {
    if (supp.dosePerKg > 0) {
      return Math.min(Math.max(supp.dosePerKg * weight, supp.minDose), supp.maxDose);
    }
    return supp.fixedDose?.active || supp.minDose;
  };

  const handleToggleRoutine = (id: string) => {
    const current = profile.supplements || [];
    const updated = current.includes(id) 
      ? current.filter(s => s !== id) 
      : [...current, id];
    onUpdateProfile({ ...profile, supplements: updated });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-6 space-y-8 pb-32">
       <div className="flex items-center justify-between sticky top-0 bg-[#0a0a0c]/80 backdrop-blur-xl z-50 py-4 -mx-6 px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full bg-white/5">
            <ChevronLeft size={24} />
          </Button>
          <div>
            <h1 className="text-2xl font-headline font-black uppercase italic italic leading-none">Suplementación Técnica</h1>
            <p className="text-secondary font-black uppercase text-[10px] tracking-widest mt-1">Guía y Calculadora de Dosis</p>
          </div>
        </div>
      </div>

      <Card className="p-6 bg-primary/10 border border-primary/20 rounded-[2rem] flex flex-col items-center justify-center text-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-black">
            <Scale size={24} />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 block">Tu Peso Actual</span>
            <div className="flex items-baseline gap-1">
               <span className="text-3xl font-black italic italic">{userWeight}</span>
               <span className="text-sm font-bold opacity-40">KG</span>
            </div>
          </div>
        </div>
        <p className="text-[10px] font-medium text-primary/60 max-w-[200px]">Las dosis se recalculan automáticamente según tu peso.</p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SUPPLEMENTS.map(supp => (
          <motion.div
            key={supp.id}
            layoutId={supp.id}
            onClick={() => setSelectedId(supp.id)}
            className="group relative cursor-pointer"
          >
            <Card className={`p-6 bg-[#111318] border-none rounded-[2rem] hover:ring-2 hover:ring-white/10 transition-all ${selectedId === supp.id ? 'opacity-0' : 'opacity-100'}`}>
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl">
                  {supp.icon}
                </div>
                {profile.supplements?.includes(supp.id) && (
                  <div className="px-3 py-1 bg-primary text-black text-[9px] font-black uppercase rounded-full">En Rutina</div>
                )}
              </div>
              <h3 className="text-xl font-headline font-black uppercase italic italic mb-1">{supp.name}</h3>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{supp.category}</span>
              
              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase opacity-40 block tracking-widest">Dosis Recomendada</span>
                  <span className="text-lg font-black text-primary italic italic">
                    {Math.round(calcDose(supp, userWeight))} {supp.unit}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/20 group-hover:text-primary transition-colors">
                  <Plus size={20} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedId(null)}
               className="absolute inset-0 bg-black/90 backdrop-blur-md"
             />
             <motion.div 
               layoutId={selectedId}
               className="relative w-full max-w-2xl bg-[#111318] rounded-[2.5rem] overflow-hidden border border-white/10 max-h-[90vh] overflow-y-auto no-scrollbar"
             >
                {(() => {
                  const supp = SUPPLEMENTS.find(s => s.id === selectedId)!;
                  return (
                    <div className="flex flex-col">
                       {/* Header Detail */}
                       <div className="p-8 pb-12 relative overflow-hidden" style={{ backgroundColor: `${supp.color}15` }}>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedId(null)} className="absolute right-6 top-6 rounded-full bg-black/20 text-white hover:bg-black/40"><X size={20} /></Button>
                          <div className="flex items-center gap-6 mt-4">
                             <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl">
                                {supp.icon}
                             </div>
                             <div>
                                <h2 className="text-4xl font-headline font-black uppercase italic italic">{supp.name}</h2>
                                <span className="inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mt-2" style={{ backgroundColor: `${supp.color}30`, color: supp.color }}>
                                   {supp.category}
                                </span>
                             </div>
                          </div>
                       </div>

                       <div className="p-8 space-y-10">
                          {/* What is */}
                          <div className="space-y-4">
                             <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/40">
                                <Info size={14} /> ¿Qué es?
                             </h4>
                             <p className="text-on-surface-variant font-medium leading-relaxed">{supp.what}</p>
                          </div>

                          {/* Benefits */}
                          <div className="space-y-4">
                             <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/40">
                                <CheckCircle2 size={14} className="text-green-500" /> Beneficios Principales
                             </h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {supp.benefits.map((b, i) => (
                                   <div key={i} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                                      <div className="w-2 h-2 rounded-full bg-green-500" />
                                      <span className="text-sm font-bold italic italic">{b}</span>
                                   </div>
                                ))}
                             </div>
                          </div>

                          {/* Calculator Section */}
                          <div className="p-8 bg-primary text-black rounded-[2.5rem] space-y-6 shadow-2xl shadow-primary/20">
                             <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                   <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">Calculadora de Dosis Óptima</h4>
                                   <p className="text-sm font-bold">Basada en tu peso de {userWeight}kg</p>
                                </div>
                                <Scale size={32} className="opacity-40" />
                             </div>
                             
                             <div className="flex flex-col items-center justify-center py-4 bg-black/5 rounded-3xl border border-black/10">
                                <span className="text-[10px] font-black uppercase opacity-60 mb-2">Tu dosis recomendada</span>
                                <div className="flex items-baseline gap-2">
                                   <span className="text-6xl font-black italic italic tracking-tighter">
                                      {Math.round(calcDose(supp, userWeight))}
                                   </span>
                                   <span className="text-2xl font-black opacity-60 uppercase">{supp.unit} / día</span>
                                </div>
                             </div>

                             {supp.phase?.loading && (
                                <div className="p-4 bg-white/20 rounded-2xl flex items-center gap-4">
                                   <Zap size={24} />
                                   <div>
                                      <span className="text-[10px] font-black uppercase tracking-widest block">Fase de Carga</span>
                                      <p className="text-xs font-bold font-sans">{supp.phase.loading.description}</p>
                                   </div>
                                </div>
                             )}
                          </div>

                          {/* Extra info grids */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-4">
                                <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/40">
                                   <Clock size={14} /> Momento de Toma
                                </h4>
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 italic italic font-bold">
                                   "{supp.timing}"
                                </div>
                             </div>
                             <div className="space-y-4">
                                <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/40">
                                   <Droplets size={14} /> Fuentes Naturales
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                   {supp.foods.map(f => (
                                      <span key={f} className="px-3 py-1.5 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5">{f}</span>
                                   ))}
                                </div>
                             </div>
                          </div>

                          {/* Warnings */}
                          <div className="p-8 bg-amber-500/10 border border-amber-500/20 rounded-[2.5rem] space-y-4">
                             <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-500">
                                <AlertTriangle size={14} /> Notas y Precauciones
                             </h4>
                             <ul className="space-y-2">
                                {supp.warnings.map((w, i) => (
                                   <li key={i} className="flex font-medium text-amber-200/60 text-sm italic italic leading-relaxed">
                                      <span className="mr-3 text-amber-500">•</span> {w}
                                   </li>
                                ))}
                             </ul>
                          </div>

                          <div className="flex gap-4">
                             <Button 
                                onClick={() => handleToggleRoutine(supp.id)}
                                className={`flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl transition-all ${
                                   profile.supplements?.includes(supp.id) 
                                   ? 'bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20' 
                                   : 'bg-primary text-black hover:bg-primary/90'
                                }`}
                             >
                                <ShoppingCart size={20} className="mr-2" />
                                {profile.supplements?.includes(supp.id) ? 'Quitar de mi Rutina' : 'Añadir a mi Rutina'}
                             </Button>
                          </div>
                          
                          <div className="h-10" />
                       </div>
                    </div>
                  );
                })()}
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
