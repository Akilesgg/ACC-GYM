import { useState } from 'react';
import { UserProfile, Language } from '../types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { User, Mail, Shield, Scale, Ruler, Calendar, ArrowLeft, LogOut, Watch, Dumbbell, TrendingUp, ChevronRight, Brain } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { logout } from '../services/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useStore } from '../store/useStore';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import TabBackground from './TabBackground';
import WorkoutPlanView from './WorkoutPlanView';

interface ProfileProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onBack: () => void;
  language: Language;
}

export default function Profile({ profile, onUpdateProfile, onBack, language }: ProfileProps) {
  const t = useTranslation(language);
  const { setActiveScreen } = useStore();
  const [viewingSportName, setViewingSportName] = useState<string | null>(null);
  const viewingSport = profile.sports.find(s => s.sport === viewingSportName) || null;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleRemoveSport = (sportName: string) => {
    if (!confirm(`¿Eliminar ${sportName} de tu perfil?`)) return;
    const updatedSports = profile.sports.filter(s => s.sport !== sportName);
    const updatedPlan = updatedSports.length > 0
      ? (updatedSports[0].plan || profile.plan)
      : undefined;
    onUpdateProfile({ ...profile, sports: updatedSports, plan: updatedPlan });
  };

  return (
    <div className="space-y-12 pb-32">
      <TabBackground tab="profile" />
      
      <AnimatePresence>
        {viewingSport && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[200] bg-[#0a0a0c] overflow-y-auto"
          >
            <WorkoutPlanView
              sport={viewingSport}
              allSports={profile.sports}
              profile={profile}
              progress={profile.progress || {}}
              onToggleExercise={(id, dateKey) => {
                const dk = dateKey || new Date().toISOString().split('T')[0];
                const current = profile.progress?.[dk]?.completedExercises || [];
                const updated = current.includes(id) ? current.filter((e: string) => e !== id) : [...current, id];
                onUpdateProfile({
                  ...profile,
                  progress: { ...profile.progress, [dk]: { ...profile.progress?.[dk], date: dk, completedExercises: updated } }
                });
              }}
              onUpdateProfile={onUpdateProfile}
              onClose={() => setViewingSportName(null)}
              language={language}
              globalPlan={profile.plan}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <section>
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full bg-surface">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <p className="font-headline text-secondary font-bold uppercase tracking-widest text-sm mb-1">
              {t('tuLaboratorio')}
            </p>
            <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-none">
              MI <span className="text-primary italic">{t('perfil').toUpperCase()}.</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <Card className="md:col-span-2 bg-surface border-none p-8 space-y-8">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24 border-4 border-primary">
                <AvatarImage src={profile.photos?.[0]?.url || "https://picsum.photos/seed/athlete/200/200"} />
                <AvatarFallback className="text-3xl font-black">AS</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-3xl font-headline font-black uppercase tracking-tight">{profile.username}</h3>
                <p className="text-on-surface-variant flex items-center gap-2">
                  <Mail size={14} /> {profile.email}
                </p>
                <div className="flex gap-2 mt-3">
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    {profile.role}
                  </span>
                  <span className="bg-secondary/10 text-secondary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    {profile.experienceLevel}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-outline-variant/10">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest flex items-center gap-1">
                  <Scale size={10} /> {t('peso')}
                </p>
                <p className="text-2xl font-headline font-black">{profile.weight} kg</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest flex items-center gap-1">
                  <Ruler size={10} /> {t('altura')}
                </p>
                <p className="text-2xl font-headline font-black">{profile.height} cm</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest flex items-center gap-1">
                  <Calendar size={10} /> {t('edad')}
                </p>
                <p className="text-2xl font-headline font-black">{profile.age}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest flex items-center gap-1">
                  <Shield size={10} /> {t('lesiones')}
                </p>
                <p className="text-sm font-bold truncate">{profile.injuries || (language === 'es' ? 'Ninguna' : 'None')}</p>
              </div>
            </div>
          </Card>

          {/* Stats/Actions */}
          <div className="space-y-6">
            <Card className="bg-primary p-8 text-on-primary">
              <h4 className="font-headline font-black text-xl uppercase tracking-tight mb-2">{language === 'es' ? 'Racha Actual' : 'Current Streak'}</h4>
              <p className="text-6xl font-headline font-black italic">{profile.streak || 0}</p>
              <p className="text-xs font-bold uppercase tracking-widest mt-2 opacity-80">{language === 'es' ? 'Días consecutivos' : 'Consecutive days'}</p>
            </Card>

            <Button 
              className="w-full h-16 rounded-2xl bg-secondary text-background font-bold uppercase tracking-widest shadow-lg shadow-secondary/20 hover:scale-105 transition-transform"
              onClick={() => setActiveScreen('devices')}
            >
              <Watch className="mr-2" size={20} /> {t('dispositivos')}
            </Button>

            <Button 
              variant="outline" 
              className="w-full h-16 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/10 font-bold uppercase tracking-widest"
              onClick={handleLogout}
            >
              <LogOut className="mr-2" size={20} /> {t('cerrarSesion')}
            </Button>
          </div>
        </div>

        {/* Selected Sports Section */}
        <section className="mt-12 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
              <Dumbbell size={24} />
            </div>
            <h3 className="font-headline text-2xl font-black uppercase italic tracking-tight">{t('misDeportesSeleccionados')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.sports.length > 0 ? (
              profile.sports.map((sport) => (
                <Card 
                  key={sport.sport} 
                  onClick={() => setViewingSportName(sport.sport)}
                  className="bg-surface border-none p-6 space-y-4 group hover:bg-surface-variant/30 transition-all cursor-pointer relative"
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveSport(sport.sport); }}
                    className="absolute top-3 right-3 w-8 h-8 bg-red-500/10 hover:bg-red-500/30 border border-red-500/30 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10"
                  >
                    <Icons.X size={14} className="text-red-400" />
                  </button>
                  <div className="flex items-center justify-between">
                    <h4 className="font-headline font-bold text-xl uppercase text-primary">{sport.sport}</h4>
                    <div className="flex flex-col items-end gap-1">
                      <span className="bg-secondary/10 text-secondary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                        {sport.daysPerWeek} {language === 'es' ? 'DÍAS' : 'DAYS'}
                      </span>
                      {sport.durationPerSession && (
                        <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                          {sport.durationPerSession >= 60 
                            ? `${sport.durationPerSession / 60} H` 
                            : `${sport.durationPerSession} MIN`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">{t('objetivo')}</p>
                    <p className="font-bold text-lg">{sport.goal}</p>
                  </div>
                  {sport.isCombined && (
                    <div className="pt-3 border-t border-outline-variant/10">
                      <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Plan Combinado Activo</span>
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <Card className="col-span-full bg-surface/50 border-dashed border-2 border-outline-variant/20 p-12 text-center">
                <p className="text-on-surface-variant font-bold uppercase tracking-widest opacity-40">
                  {language === 'es' ? 'No tienes deportes seleccionados' : 'No sports selected'}
                </p>
                <Button 
                  variant="link" 
                  onClick={() => setActiveScreen('workout')}
                  className="mt-2 text-primary font-black uppercase tracking-widest"
                >
                  {t('añadirDeporte')}
                </Button>
              </Card>
            )}
          </div>
        </section>

        {/* Evolution Section Merged */}
        <section className="mt-12 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center text-secondary">
                <TrendingUp size={24} />
              </div>
              <h3 className="font-headline text-2xl font-black uppercase italic tracking-tight">{t('evolucion')}</h3>
            </div>
            <Button variant="ghost" onClick={() => setActiveScreen('evolution')} className="text-primary font-bold uppercase tracking-widest text-xs">
              {t('verTodo')} <ChevronRight size={16} />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-surface border-none p-6">
              <h4 className="font-headline font-bold uppercase text-sm mb-4">{t('evolucionPeso')}</h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={profile.weightHistory || []}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff3b3b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ff3b3b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="weight" stroke="#ff3b3b" fillOpacity={1} fill="url(#colorWeight)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="bg-surface border-none p-6 flex flex-col justify-center items-center text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Brain size={32} />
              </div>
              <p className="text-sm italic text-on-surface-variant">"{t('analisis')}: Basado en tus fotos y peso actual, se observa una mejora en la composición corporal."</p>
            </Card>
          </div>
        </section>

        {/* History / Archived Sports */}
        <section className="mt-12 space-y-6 opacity-60">
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center text-on-surface-variant/40">
                <Icons.History size={24} />
              </div>
              <h3 className="font-headline text-xl font-black uppercase italic tracking-tight text-on-surface-variant/60">Historial de Disciplinas Archivadas</h3>
            </div>
            {profile.archivedSports && profile.archivedSports.length > 0 ? (
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {profile.archivedSports.map((s, i) => (
                   <Card key={i} className="bg-surface/20 border-white/5 p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-on-surface-variant/30">
                        <Icons.Trophy size={14} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest">{s.sport}</p>
                   </Card>
                 ))}
               </div>
            ) : (
              <Card className="bg-surface/30 border-dashed border border-white/5 p-8 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">No hay disciplinas archivadas recientemente</p>
              </Card>
            )}
        </section>
      </section>
    </div>
  );
}
