import { Camera, Brain, Loader2, ArrowLeft, TrendingUp, Calendar as CalendarIcon, Scale } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { getPhysicalAnalysis } from '@/src/services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, GalleryItem, WeightEntry, Language } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useTranslation } from '../lib/i18n';

interface GalleryProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onBack?: () => void;
  language: Language;
}

export default function Gallery({ profile, onUpdateProfile, onBack, language }: GalleryProps) {
  const t = useTranslation(language);
  const [analysis, setAnalysis] = useState("Analizando tu evolución física...");
  const [analyzing, setAnalyzing] = useState(false);
  const [view, setView] = useState<'photos' | 'stats'>('photos');

  useEffect(() => {
    if (profile.photos && profile.photos.length > 0) {
      runAnalysis();
    }
  }, []);

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const result = await getPhysicalAnalysis(
        { muscleMass: 42.8, bodyFat: profile.bodyFat || 15 }, 
        "Basado en tus fotos y peso actual, se observa una mejora en la composición corporal."
      );
      setAnalysis(result);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleNewPhoto = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    
    const newPhoto: GalleryItem = {
      id: Date.now().toString(),
      url: `https://picsum.photos/seed/fitness${Date.now()}/800/800`,
      date: dateStr,
      weight: profile.weight,
      location: 'Gym',
      isPrivate: true
    };

    const newWeightEntry: WeightEntry = {
      date: dateStr,
      weight: profile.weight
    };

    const updatedPhotos = [newPhoto, ...(profile.photos || [])];
    const updatedWeightHistory = [...(profile.weightHistory || []), newWeightEntry];

    onUpdateProfile({
      ...profile,
      photos: updatedPhotos,
      weightHistory: updatedWeightHistory
    });
    
    runAnalysis();
  };

  const chartData = profile.weightHistory && profile.weightHistory.length > 0 ? profile.weightHistory : [
    { date: 'Ene', weight: 85 },
    { date: 'Feb', weight: 84.2 },
    { date: 'Mar', weight: 83.5 },
    { date: 'Abr', weight: profile.weight }
  ];

  return (
    <div className="space-y-12 pb-32">
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full bg-surface">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <span className="text-secondary font-headline font-bold tracking-widest text-sm uppercase">{t('evolucion')}</span>
              <h2 className="text-4xl md:text-5xl font-headline font-black mt-2 tracking-tight italic uppercase">{t('fotos')}</h2>
            </div>
          </div>
          <div className="flex gap-2 bg-surface p-1 rounded-full border border-outline-variant/10">
            <Button 
              variant={view === 'photos' ? 'default' : 'ghost'} 
              onClick={() => setView('photos')}
              className="rounded-full px-6 font-bold uppercase text-xs"
            >
              {t('fotos')}
            </Button>
            <Button 
              variant={view === 'stats' ? 'default' : 'ghost'} 
              onClick={() => setView('stats')}
              className="rounded-full px-6 font-bold uppercase text-xs"
            >
              {t('graficos')}
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {view === 'photos' ? (
            <motion.div 
              key="photos"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <Card className="bg-surface border-l-4 border-primary p-8 relative group overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <Brain size={24} className="text-primary animate-pulse" />
                  <h3 className="font-headline text-xl font-black uppercase tracking-widest text-primary">{t('analisis')}</h3>
                </div>
                {analyzing ? (
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <Loader2 className="animate-spin" size={18} />
                    <span className="font-medium">Escaneando biometría visual...</span>
                  </div>
                ) : (
                  <p className="text-on-surface leading-relaxed text-lg italic">"{analysis}"</p>
                )}
              </Card>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <button 
                  onClick={handleNewPhoto}
                  className="aspect-square rounded-3xl border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="text-primary" size={24} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant">{t('nuevaFoto')}</span>
                </button>

                {(profile.photos || []).map((photo, idx) => (
                  <motion.div 
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="aspect-square rounded-3xl overflow-hidden relative group"
                  >
                    <img 
                      src={photo.url} 
                      alt={`Progreso ${photo.date}`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[10px] font-black uppercase tracking-widest">{photo.date}</p>
                      <p className="text-lg font-headline font-black">{photo.weight} kg</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-surface border-none p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                    <Scale className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-on-surface-variant">{t('pesoActual')}</p>
                    <p className="text-2xl font-headline font-black">{profile.weight} kg</p>
                  </div>
                </Card>
                <Card className="bg-surface border-none p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="text-secondary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-on-surface-variant">{t('variacion')}</p>
                    <p className="text-2xl font-headline font-black text-secondary">-2.4 kg</p>
                  </div>
                </Card>
                <Card className="bg-surface border-none p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-tertiary/20 rounded-2xl flex items-center justify-center">
                    <CalendarIcon className="text-tertiary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-on-surface-variant">{t('diasRacha')}</p>
                    <p className="text-2xl font-headline font-black text-tertiary">14</p>
                  </div>
                </Card>
              </div>

              <Card className="bg-surface border-none p-8">
                <h3 className="text-xl font-headline font-black uppercase italic mb-8">{t('evolucionPeso')}</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff3b3b" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ff3b3b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 'bold' }}
                      />
                      <YAxis 
                        hide 
                        domain={['dataMin - 2', 'dataMax + 2']} 
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                        itemStyle={{ color: '#ff3b3b', fontWeight: 'bold' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#ff3b3b" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorWeight)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
