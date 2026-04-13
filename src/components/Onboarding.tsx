import { useState } from 'react';
import { UserProfile } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, User, Activity, ShieldAlert } from 'lucide-react';

import { auth, signOut } from '../lib/firebase';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    username: '',
    age: 25,
    gender: 'masculino',
    weight: 70,
    height: 175,
    experienceLevel: 'activo',
    injuries: '',
    daysPerWeek: 3,
    selectedSports: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextStep = () => {
    setError(null);
    setStep(prev => prev + 1);
  };
  const prevStep = () => {
    setError(null);
    if (step === 1) {
      signOut(auth);
    } else {
      setStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onComplete(profile);
    } catch (err: any) {
      console.error("Onboarding error:", err);
      setError(err.message || "Error al guardar el perfil. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 bg-surface border-none shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-surface-variant">
              <div 
                className="h-full bg-primary transition-all duration-500" 
                style={{ width: `${(step / 3) * 100}%` }} 
              />
            </div>

            {step === 1 && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <User className="text-primary" size={32} />
                  </div>
                  <h2 className="font-headline text-3xl font-black text-primary mb-2">IDENTIDAD</h2>
                  <p className="text-on-surface-variant">Crea tu perfil de atleta de alto nivel.</p>
                </div>
                <div className="space-y-6">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs font-bold text-center animate-bounce mb-4"
                    >
                      {error}
                    </motion.div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Nombre de Usuario</Label>
                    <Input 
                      placeholder="Ej: IronAthlete_99"
                      value={profile.username} 
                      onChange={e => setProfile({...profile, username: e.target.value})}
                      className="bg-background border-none h-14 text-lg font-headline font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Edad</Label>
                      <Input 
                        type="number"
                        value={profile.age} 
                        onChange={e => setProfile({...profile, age: Number(e.target.value)})}
                        className="bg-background border-none h-14 font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Género</Label>
                      <select 
                        className="w-full bg-background border-none h-14 rounded-md px-4 font-bold appearance-none"
                        value={profile.gender}
                        onChange={e => setProfile({...profile, gender: e.target.value as any})}
                      >
                        <option value="masculino">Masculino</option>
                        <option value="femenino">Femenino</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={prevStep} variant="ghost" className="flex-1 h-14 rounded-full font-bold">Atrás</Button>
                  <Button 
                    onClick={nextStep} 
                    disabled={!profile.username}
                    className="flex-1 bg-primary text-background font-black h-14 rounded-full group"
                  >
                    CONTINUAR <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Activity className="text-secondary" size={32} />
                  </div>
                  <h2 className="font-headline text-3xl font-black text-secondary mb-2">BIOMETRÍA</h2>
                  <p className="text-on-surface-variant">Datos precisos para el algoritmo.</p>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Peso (kg)</Label>
                      <Input 
                        type="number"
                        value={profile.weight} 
                        onChange={e => setProfile({...profile, weight: Number(e.target.value)})}
                        className="bg-background border-none h-14 font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Altura (cm)</Label>
                      <Input 
                        type="number"
                        value={profile.height} 
                        onChange={e => setProfile({...profile, height: Number(e.target.value)})}
                        className="bg-background border-none h-14 font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Nivel de Actividad</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {['sedentario', 'activo', 'atleta'].map(level => (
                        <Button
                          key={level}
                          variant={profile.experienceLevel === level ? 'default' : 'outline'}
                          onClick={() => setProfile({...profile, experienceLevel: level as any})}
                          className={`h-12 text-[10px] font-bold uppercase ${profile.experienceLevel === level ? 'bg-secondary text-background' : 'border-outline-variant/20'}`}
                        >
                          {level}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={prevStep} variant="ghost" className="flex-1 h-14 rounded-full font-bold">Atrás</Button>
                  <Button onClick={nextStep} className="flex-1 bg-secondary text-background font-black h-14 rounded-full">SIGUIENTE</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-tertiary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ShieldAlert className="text-tertiary" size={32} />
                  </div>
                  <h2 className="font-headline text-3xl font-black text-tertiary mb-2">SALUD</h2>
                  <p className="text-on-surface-variant">Seguridad y frecuencia de entrenamiento.</p>
                </div>
                <div className="space-y-6">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs font-bold text-center mb-4"
                    >
                      {error}
                    </motion.div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Lesiones o Limitaciones</Label>
                    <textarea 
                      placeholder="Ej: Molestia en rodilla derecha, asma..."
                      value={profile.injuries} 
                      onChange={e => setProfile({...profile, injuries: e.target.value})}
                      className="w-full bg-background border-none rounded-xl p-4 h-24 font-medium resize-none focus:ring-1 focus:ring-tertiary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Días Disponibles / Semana</Label>
                    <Input 
                      type="number"
                      min={1} max={7}
                      value={profile.daysPerWeek} 
                      onChange={e => setProfile({...profile, daysPerWeek: Number(e.target.value)})}
                      className="bg-background border-none h-14 font-bold"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={prevStep} variant="ghost" className="flex-1 h-14 rounded-full font-bold" disabled={isSubmitting}>Atrás</Button>
                  <Button 
                    onClick={handleComplete} 
                    disabled={isSubmitting}
                    className="flex-1 bg-tertiary text-background font-black h-14 rounded-full"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-2 border-background border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'FINALIZAR'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
