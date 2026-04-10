import { EyeOff, Camera, Brain, Lock, Heart, MessageCircle, Upload, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import { getPhysicalAnalysis } from '@/src/services/geminiService';
import { motion } from 'motion/react';

export default function Gallery() {
  const [analysis, setAnalysis] = useState("Analizando tu evolución física...");
  const [analyzing, setAnalyzing] = useState(false);
  const [photos, setPhotos] = useState([
    { id: 1, url: 'https://picsum.photos/seed/physique1/800/800', date: 'Hoy', weight: 82.4 },
    { id: 2, url: 'https://picsum.photos/seed/physique2/400/400', date: 'Oct 10', weight: 83.1 },
  ]);

  useEffect(() => {
    runAnalysis();
  }, []);

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const result = await getPhysicalAnalysis({ muscleMass: 42.8, bodyFat: 11.4 }, "Notable mejoría en la definición abdominal y deltoides.");
      setAnalysis(result);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleNewPhoto = () => {
    // Simulate photo capture
    const newPhoto = {
      id: Date.now(),
      url: `https://picsum.photos/seed/physique${Date.now()}/800/800`,
      date: 'Ahora',
      weight: 82.2
    };
    setPhotos([newPhoto, ...photos]);
    runAnalysis();
  };

  return (
    <div className="space-y-12 pb-32">
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <span className="text-secondary font-headline font-bold tracking-widest text-sm uppercase">Evolución Visual</span>
            <h2 className="text-4xl md:text-5xl font-headline font-black mt-2 tracking-tight">Tu Progreso</h2>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={handleNewPhoto}
              className="bg-primary text-background font-bold rounded-full px-8 h-12 flex items-center gap-2"
            >
              <Camera size={20} />
              Hacer Foto
            </Button>
            <Button variant="outline" className="rounded-full px-8 h-12 border-outline-variant/20 flex items-center gap-2">
              <Upload size={20} />
              Subir
            </Button>
          </div>
        </div>

        {/* AI Analysis Section */}
        <Card className="kinetic-gradient-border p-8 mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-secondary/20 rounded-2xl">
              <Brain size={32} className="text-secondary" />
            </div>
            <div>
              <h3 className="text-2xl font-headline font-bold">Análisis de Evolución IA</h3>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Optimización de Rendimiento • Reporte en Tiempo Real</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="bg-background/50 p-6 rounded-2xl border border-outline-variant/10 relative overflow-hidden">
                {analyzing && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center gap-3">
                    <Loader2 className="animate-spin text-primary" />
                    <span className="font-bold text-primary">La IA está analizando tu foto...</span>
                  </div>
                )}
                <p className="text-primary text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Observación del Entrenador IA
                </p>
                <p className="text-lg italic text-on-surface-variant leading-relaxed">
                  "{analysis}"
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-surface p-5 rounded-2xl border border-outline-variant/10">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase mb-2">Masa Muscular</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-headline font-black text-secondary">42.8%</span>
                  <span className="text-xs text-primary font-bold">+1.2%</span>
                </div>
              </div>
              <div className="bg-surface p-5 rounded-2xl border border-outline-variant/10">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase mb-2">Grasa Corporal</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-headline font-black text-secondary">11.4%</span>
                  <span className="text-xs text-tertiary font-bold">-0.5%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((photo, idx) => (
            <Card key={photo.id} className={`border-none overflow-hidden group relative ${idx === 0 ? 'col-span-2 row-span-2' : ''}`}>
              <img 
                src={photo.url} 
                alt={`Progreso ${photo.date}`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-0 left-0 p-4">
                <p className="font-headline font-bold text-primary">{photo.date}</p>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase">{photo.weight} kg</p>
              </div>
              <div className="absolute top-4 right-4 bg-surface/60 backdrop-blur-md p-2 rounded-full">
                <Lock size={14} className="text-primary fill-primary" />
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

