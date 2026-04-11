import { useState } from 'react';
import { UserProfile, Language } from '../types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Watch, Smartphone, Scale, RefreshCw, Check, 
  ChevronRight, ArrowLeft, Bluetooth, Wifi,
  Activity, Heart, Zap, Footprints
} from 'lucide-react';
import { useTranslation } from '../lib/i18n';

interface DevicesProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onBack: () => void;
  language: Language;
}

const DEVICE_BRANDS = [
  { id: 'apple', name: 'Apple Watch', icon: 'Watch', color: 'text-white', bg: 'bg-black' },
  { id: 'samsung', name: 'Samsung Health', icon: 'Smartphone', color: 'text-blue-400', bg: 'bg-blue-900/20' },
  { id: 'xiaomi', name: 'Xiaomi Mi Band', icon: 'Activity', color: 'text-orange-500', bg: 'bg-orange-900/20' },
  { id: 'garmin', name: 'Garmin Connect', icon: 'Zap', color: 'text-blue-500', bg: 'bg-blue-900/20' },
  { id: 'fitbit', name: 'Fitbit', icon: 'Heart', color: 'text-teal-400', bg: 'bg-teal-900/20' },
  { id: 'huawei', name: 'Huawei Health', icon: 'Smartphone', color: 'text-red-500', bg: 'bg-red-900/20' },
];

const SCALE_BRANDS = [
  { id: 'withings', name: 'Withings', icon: 'Scale', color: 'text-blue-400', bg: 'bg-blue-900/20' },
  { id: 'tanita', name: 'Tanita', icon: 'Scale', color: 'text-green-400', bg: 'bg-green-900/20' },
  { id: 'xiaomi_scale', name: 'Xiaomi Scale', icon: 'Scale', color: 'text-orange-400', bg: 'bg-orange-900/20' },
];

export default function Devices({ profile, onUpdateProfile, onBack, language }: DevicesProps) {
  const t = useTranslation(language);
  const [syncing, setSyncing] = useState<string | null>(null);

  const handleConnect = async (deviceId: string) => {
    setSyncing(deviceId);
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const connectedDevices = profile.deviceData?.connectedDevices || [];
    const newConnected = connectedDevices.includes(deviceId)
      ? connectedDevices.filter(id => id !== deviceId)
      : [...connectedDevices, deviceId];

    onUpdateProfile({
      ...profile,
      deviceData: {
        ...(profile.deviceData || { steps: 0, calories: 0, heartRate: 0, lastSync: new Date().toISOString() }),
        connectedDevices: newConnected,
        lastSync: new Date().toISOString()
      }
    });
    setSyncing(null);
  };

  const isConnected = (id: string) => profile.deviceData?.connectedDevices?.includes(id);

  return (
    <div className="space-y-12 pb-32">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full bg-surface">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <p className="font-headline text-secondary font-bold uppercase tracking-widest text-sm mb-1">
            {t('laboratorio')}
          </p>
          <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-none uppercase">
            {t('dispositivos')}<span className="text-primary italic">.</span>
          </h2>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gadgets Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
              <Watch size={24} />
            </div>
            <h3 className="font-headline text-2xl font-black uppercase italic tracking-tight">{t('marcasDeportivas')}</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {DEVICE_BRANDS.map((brand) => (
              <Card key={brand.id} className="bg-surface border-none p-6 flex items-center justify-between group hover:bg-surface-variant/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${brand.bg} rounded-2xl flex items-center justify-center ${brand.color}`}>
                    {brand.id === 'apple' && <Watch size={28} />}
                    {brand.id === 'samsung' && <Smartphone size={28} />}
                    {brand.id === 'xiaomi' && <Activity size={28} />}
                    {brand.id === 'garmin' && <Zap size={28} />}
                    {brand.id === 'fitbit' && <Heart size={28} />}
                    {brand.id === 'huawei' && <Smartphone size={28} />}
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-xl uppercase">{brand.name}</h4>
                    <p className="text-sm text-on-surface-variant">
                      {isConnected(brand.id) ? t('conectado') : t('desconectado')}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => handleConnect(brand.id)}
                  disabled={syncing === brand.id}
                  variant={isConnected(brand.id) ? "outline" : "default"}
                  className={`rounded-full px-8 h-12 font-bold uppercase tracking-widest text-xs ${
                    isConnected(brand.id) ? 'border-primary text-primary hover:bg-primary/10' : 'bg-primary text-background'
                  }`}
                >
                  {syncing === brand.id ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : isConnected(brand.id) ? (
                    <Check size={18} />
                  ) : (
                    t('conectar')
                  )}
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* Scales Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center text-secondary">
              <Scale size={24} />
            </div>
            <h3 className="font-headline text-2xl font-black uppercase italic tracking-tight">{t('basculasInteligentes')}</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {SCALE_BRANDS.map((brand) => (
              <Card key={brand.id} className="bg-surface border-none p-6 flex items-center justify-between group hover:bg-surface-variant/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${brand.bg} rounded-2xl flex items-center justify-center ${brand.color}`}>
                    <Scale size={28} />
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-xl uppercase">{brand.name}</h4>
                    <p className="text-sm text-on-surface-variant">
                      {isConnected(brand.id) ? t('conectado') : t('desconectado')}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => handleConnect(brand.id)}
                  disabled={syncing === brand.id}
                  variant={isConnected(brand.id) ? "outline" : "default"}
                  className={`rounded-full px-8 h-12 font-bold uppercase tracking-widest text-xs ${
                    isConnected(brand.id) ? 'border-secondary text-secondary hover:bg-secondary/10' : 'bg-secondary text-background'
                  }`}
                >
                  {syncing === brand.id ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : isConnected(brand.id) ? (
                    <Check size={18} />
                  ) : (
                    t('conectar')
                  )}
                </Button>
              </Card>
            ))}
          </div>

          {/* Sync Status Card */}
          <Card className="bg-surface-variant/10 border-none p-8 mt-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <RefreshCw size={120} />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-headline text-xl font-bold uppercase tracking-widest text-secondary">{t('ultimaSincronizacion')}</h4>
                <p className="font-mono text-sm opacity-60">{profile.deviceData?.lastSync ? new Date(profile.deviceData.lastSync).toLocaleString() : '---'}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Pasos</p>
                  <div className="flex items-center gap-2">
                    <Footprints size={16} className="text-primary" />
                    <span className="font-headline font-bold text-2xl">{profile.deviceData?.steps || 0}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Kcal</p>
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-secondary" />
                    <span className="font-headline font-bold text-2xl">{profile.deviceData?.calories || 0}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">BPM</p>
                  <div className="flex items-center gap-2">
                    <Heart size={16} className="text-red-500" />
                    <span className="font-headline font-bold text-2xl">{profile.deviceData?.heartRate || 0}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Estado</p>
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-green-500" />
                    <span className="font-headline font-bold text-2xl">OK</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
