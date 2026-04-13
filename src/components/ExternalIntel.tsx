import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, MessageSquare, Twitter, Send, Share2, Activity, Zap, BarChart3, Globe } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { Language } from '../types';

interface Signal {
  id: string;
  asset: string;
  type: 'long' | 'short';
  sentiment: number; // 0 to 100
  source: string;
  timestamp: string;
  reason: string;
}

interface ExternalIntelProps {
  language: Language;
}

export default function ExternalIntel({ language }: ExternalIntelProps) {
  const t = useTranslation(language);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate fetching data from social sources
  useEffect(() => {
    const mockSignals: Signal[] = [
      {
        id: '1',
        asset: 'Bitcoin (BTC)',
        type: 'long',
        sentiment: 85,
        source: 'X (Twitter)',
        timestamp: new Date().toISOString(),
        reason: 'Fuerte acumulación detectada en carteras institucionales. Sentimiento alcista en redes sociales.'
      },
      {
        id: '2',
        asset: 'Ethereum (ETH)',
        type: 'short',
        sentiment: 42,
        source: 'Reddit',
        timestamp: new Date().toISOString(),
        reason: 'Preocupación por las altas comisiones de gas y posible retraso en la próxima actualización.'
      },
      {
        id: '3',
        asset: 'Solana (SOL)',
        type: 'long',
        sentiment: 78,
        source: 'Telegram',
        timestamp: new Date().toISOString(),
        reason: 'Crecimiento explosivo del ecosistema DeFi y lanzamientos de nuevos protocolos.'
      }
    ];

    const timer = setTimeout(() => {
      setSignals(mockSignals);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8 pb-32">
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <p className="font-headline text-secondary font-bold uppercase tracking-widest text-sm mb-2">
              {t('analisisMercado')}
            </p>
            <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-none">
              INTEL <span className="text-primary italic">EXTERNA.</span>
            </h2>
            <p className="text-on-surface-variant mt-4 font-medium max-w-2xl">
              Análisis de sentimiento en tiempo real basado en fuentes sociales (X, Telegram, Reddit) y señales de mercado.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-surface p-3 rounded-2xl border border-outline-variant/10">
            <Activity className="text-primary animate-pulse" size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              {t('actualizadoCada')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-surface border-none p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Zap className="text-primary" size={24} />
            </div>
            <span className="text-4xl font-black text-on-surface">92%</span>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">Precisión IA</span>
          </Card>
          <Card className="bg-surface border-none p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="text-secondary" size={24} />
            </div>
            <span className="text-4xl font-black text-on-surface">1.2M</span>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">Menciones/Día</span>
          </Card>
          <Card className="bg-surface border-none p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-tertiary/10 rounded-full flex items-center justify-center mb-4">
              <Globe className="text-tertiary" size={24} />
            </div>
            <span className="text-4xl font-black text-on-surface">24/7</span>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">Monitoreo Global</span>
          </Card>
        </div>

        <div className="space-y-6">
          <h3 className="font-headline text-2xl font-black uppercase italic tracking-tight flex items-center gap-3">
            <Share2 className="text-primary" /> {t('fuentesSociales')}
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="bg-surface border-none p-6 h-40 animate-pulse" />
              ))
            ) : (
              signals.map((signal) => (
                <Card key={signal.id} className="bg-surface border-none p-6 overflow-hidden relative group">
                  <div className={`absolute top-0 left-0 w-1 h-full ${signal.type === 'long' ? 'bg-primary' : 'bg-tertiary'}`} />
                  
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          signal.type === 'long' ? 'bg-primary/10 text-primary' : 'bg-tertiary/10 text-tertiary'
                        }`}>
                          {signal.type === 'long' ? t('long') : t('short')}
                        </div>
                        <span className="font-headline text-xl font-bold">{signal.asset}</span>
                      </div>
                      
                      <p className="text-on-surface-variant leading-relaxed italic">
                        "{signal.reason}"
                      </p>
                      
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          {signal.source === 'X (Twitter)' && <Twitter size={16} className="text-sky-400" />}
                          {signal.source === 'Reddit' && <MessageSquare size={16} className="text-orange-500" />}
                          {signal.source === 'Telegram' && <Send size={16} className="text-blue-400" />}
                          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{signal.source}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity size={16} className="text-primary" />
                          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Sentimiento: {signal.sentiment}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center md:border-l border-outline-variant/10 md:pl-8">
                      {signal.type === 'long' ? (
                        <TrendingUp size={48} className="text-primary mb-2" />
                      ) : (
                        <TrendingDown size={48} className="text-tertiary mb-2" />
                      )}
                      <span className={`text-2xl font-black ${signal.type === 'long' ? 'text-primary' : 'text-tertiary'}`}>
                        {signal.type === 'long' ? '+12.4%' : '-5.2%'}
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
