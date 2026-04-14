import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { Newspaper, Clock, ExternalLink, TrendingUp, Award, Zap } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { Language } from '../types';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  time: string;
  category: string;
  imageUrl: string;
  url: string;
}

interface NewsProps {
  language: Language;
}

export default function News({ language }: NewsProps) {
  const t = useTranslation(language);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNews = () => {
      setLoading(true);
      const mockNews: NewsItem[] = [
        {
          id: '1',
          title: 'Nueva tecnología de recuperación muscular revoluciona el entrenamiento de élite',
          summary: 'Científicos deportivos presentan un sistema de crioterapia de precisión que reduce el tiempo de recuperación en un 40%.',
          source: 'Sports Science Daily',
          time: 'Hace 2 horas',
          category: 'Tecnología',
          imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop',
          url: '#'
        },
        {
          id: '2',
          title: 'El impacto de la nutrición personalizada en el rendimiento olímpico',
          summary: 'Análisis detallado sobre cómo las dietas basadas en ADN están cambiando el podio en las disciplinas de resistencia.',
          source: 'Elite Performance',
          time: 'Hace 5 horas',
          category: 'Nutrición',
          imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop',
          url: '#'
        },
        {
          id: '3',
          title: 'Tendencias 2024: El auge del entrenamiento híbrido',
          summary: 'Por qué los atletas de fuerza están incorporando más trabajo cardiovascular de alta intensidad en sus rutinas.',
          source: 'Fitness Insider',
          time: 'Hace 8 horas',
          category: 'Tendencias',
          imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop',
          url: '#'
        }
      ];

      setTimeout(() => {
        setNews(mockNews);
        setLoading(false);
      }, 1500);
    };

    loadNews();
    const interval = setInterval(loadNews, 3 * 60 * 60 * 1000); // 3 hours

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-12 pb-32">
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="font-headline text-secondary font-bold uppercase tracking-widest text-sm mb-2">
              {t('noticiasDeportivas')}
            </p>
            <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-none">
              NOTICIAS <span className="text-primary italic">DEPORTIVAS.</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 bg-surface p-3 rounded-2xl border border-outline-variant/10">
            <Clock className="text-primary" size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              {t('ultimaActualizacion')}: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-surface border-none h-[450px] animate-pulse rounded-[32px]" />
            ))
          ) : (
            news.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-surface border-none overflow-hidden rounded-[32px] h-full flex flex-col group">
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-background/80 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-primary">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">{item.source}</span>
                      <span className="w-1 h-1 rounded-full bg-outline-variant" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">{item.time}</span>
                    </div>
                    
                    <h3 className="font-headline text-xl font-bold mb-4 leading-tight group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    
                    <p className="text-on-surface-variant text-sm leading-relaxed mb-8 flex-1">
                      {item.summary}
                    </p>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between group/btn border border-outline-variant/10 rounded-xl hover:bg-primary hover:text-on-primary transition-all"
                    >
                      <span className="font-black uppercase tracking-widest text-[10px]">{t('leerMas')}</span>
                      <ExternalLink size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Featured Analysis Section */}
      <section className="bg-surface rounded-[40px] p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 grayscale">
          <img 
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop" 
            alt="" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Award className="text-primary" size={32} />
            <h3 className="font-headline text-2xl font-black uppercase tracking-widest text-primary">Análisis Destacado</h3>
          </div>
          <h2 className="font-headline text-4xl font-extrabold mb-6 leading-tight">
            Cómo el Big Data está redefiniendo los límites del cuerpo humano.
          </h2>
          <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
            Un estudio exhaustivo sobre la integración de sensores biométricos y algoritmos de IA en la planificación de cargas de trabajo para atletas profesionales.
          </p>
          <Button className="bg-primary text-on-primary font-black uppercase tracking-widest px-8 h-14 rounded-2xl">
            Descargar Informe Completo
          </Button>
        </div>
      </section>
    </div>
  );
}
