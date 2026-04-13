import { Play, Info, Clock, Star, Share2, ChevronRight, Search, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { Language } from '../types';
import { useTranslation } from '../lib/i18n';

interface MoviesProps {
  language: Language;
}

export default function Movies({ language }: MoviesProps) {
  const t = useTranslation(language);

  const movies = [
    {
      id: '1',
      title: 'Técnica Maestra: Press de Banca',
      duration: '12:45',
      rating: 4.9,
      category: 'Musculación',
      thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop',
      syncInfo: 'Sincronización automática con tu sensor de potencia ACC. Los datos de velocidad de barra se superponen en tiempo real.'
    },
    {
      id: '2',
      title: 'Resistencia Extrema: Ciclismo de Montaña',
      duration: '45:20',
      rating: 4.8,
      category: 'Ciclismo',
      thumbnail: 'https://images.unsplash.com/photo-1544191173-43b215239b66?q=80&w=2070&auto=format&fit=crop',
      syncInfo: 'Sincronizado con tu GPS y banda cardíaca. El video ajusta la resistencia de tu rodillo inteligente según la pendiente.'
    },
    {
      id: '3',
      title: 'Nutrición para el Rendimiento',
      duration: '22:10',
      rating: 4.7,
      category: 'Nutrición',
      thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop',
      syncInfo: 'Sincronizado con tu plan de dieta actual. Las recetas mostradas se añaden automáticamente a tu lista de la compra.'
    }
  ];

  return (
    <div className="space-y-12 pb-32">
      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
            <p className="font-headline text-secondary font-bold uppercase tracking-widest text-sm mb-1">
              CONTENIDO EXCLUSIVO
            </p>
            <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-none">
              ACC <span className="text-primary italic">MOVIES.</span>
            </h2>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
              <input 
                type="text" 
                placeholder="Buscar contenido..." 
                className="w-full bg-surface border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 ring-primary transition-all"
              />
            </div>
            <Button variant="outline" size="icon" className="rounded-2xl bg-surface border-none h-12 w-12">
              <Filter size={20} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {movies.map((movie, idx) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-surface border-none overflow-hidden group hover:ring-2 ring-primary transition-all">
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={movie.thumbnail} 
                    alt={movie.title} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-on-primary shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                      <Play size={32} fill="currentColor" />
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-black/60 backdrop-blur-md text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest text-white">
                      {movie.category}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest text-white flex items-center gap-1">
                    <Clock size={12} /> {movie.duration}
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-headline text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                      {movie.title}
                    </h3>
                    <div className="flex items-center gap-1 text-secondary">
                      <Star size={14} fill="currentColor" />
                      <span className="text-xs font-bold">{movie.rating}</span>
                    </div>
                  </div>

                  <Card className="bg-background/50 border-none p-4 flex items-start gap-3">
                    <Info size={16} className="text-secondary shrink-0 mt-0.5" />
                    <p className="text-[10px] font-medium leading-relaxed text-on-surface-variant italic">
                      {movie.syncInfo}
                    </p>
                  </Card>

                  <div className="flex items-center justify-between pt-2">
                    <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-primary">
                      <Share2 size={14} className="mr-2" /> Compartir
                    </Button>
                    <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-primary">
                      Ver Ahora <ChevronRight size={14} className="ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-surface rounded-[40px] p-12 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h3 className="font-headline text-3xl font-black uppercase italic mb-4">Sincronización Inteligente</h3>
          <p className="text-on-surface-variant leading-relaxed mb-8">
            Nuestros videos no son solo contenido pasivo. Se sincronizan con tus dispositivos ACC SPORT para ofrecerte una experiencia interactiva única. Desde el ajuste de resistencia en tiempo real hasta la superposición de biometría, cada "Movie" está diseñada para maximizar tu rendimiento.
          </p>
          <Button className="bg-primary text-on-primary font-black uppercase tracking-widest px-8 rounded-2xl h-14 italic">
            Configurar Dispositivos
          </Button>
        </div>
        <div className="absolute -right-20 -bottom-20 opacity-5 pointer-events-none">
          <Play size={400} />
        </div>
      </section>
    </div>
  );
}
