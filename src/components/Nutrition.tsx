import { Sparkles, PlusCircle, ArrowLeft, Target, Clock, ShieldAlert, Loader2, Utensils, Info, Calendar, Trash2, Edit2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { generateNutritionPlan } from '@/src/services/geminiService';
import { UserProfile, NutritionPlan, Language } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../lib/i18n';

interface NutritionProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onBack?: () => void;
  language: Language;
}

const NUTRITION_GOALS = [
  "Pérdida de Grasa",
  "Ganancia de Masa Muscular",
  "Recomposición Corporal",
  "Mejora de Rendimiento",
  "Salud y Longevidad"
];

const TIMEFRAMES = [
  "4 Semanas (Express)",
  "8 Semanas (Estándar)",
  "12 Semanas (Transformación)",
  "Mantenimiento Indefinido"
];

export default function Nutrition({ profile, onUpdateProfile, onBack, language }: NutritionProps) {
  const t = useTranslation(language);
  const [step, setStep] = useState<'intro' | 'goal' | 'timeframe' | 'allergies' | 'plan'>('intro');
  const [loading, setLoading] = useState(false);
  const [tempData, setTempData] = useState({
    goal: profile.nutritionGoal || '',
    timeframe: profile.nutritionTimeframe || '',
    allergies: profile.allergies || '',
    isCeliac: false,
    hasIntolerance: false,
    hasAllergy: false
  });

  useEffect(() => {
    if (profile.nutritionPlan) {
      setStep('plan');
    } else if (step === 'plan') {
      setStep('intro');
    }
  }, [profile.nutritionPlan]);

  const handleStart = () => setStep('goal');

  const handleGoalSelect = (goal: string) => {
    setTempData(prev => ({ ...prev, goal }));
    setStep('timeframe');
  };

  const handleTimeframeSelect = (timeframe: string) => {
    setTempData(prev => ({ ...prev, timeframe }));
    setStep('allergies');
  };

  const generateDiets = async () => {
    setLoading(true);
    const allergyDetails = [
      tempData.isCeliac ? "Celíaco" : "",
      tempData.hasIntolerance ? "Intolerancia" : "",
      tempData.hasAllergy ? "Alergia" : "",
      tempData.allergies
    ].filter(Boolean).join(", ");

    const updatedProfile = {
      ...profile,
      nutritionGoal: tempData.goal,
      nutritionTimeframe: tempData.timeframe,
      allergies: allergyDetails
    };
    
    try {
      console.log("[Nutrition] Generating diets with AI...");
      const plans = await generateNutritionPlan(updatedProfile);
      if (!plans || plans.length === 0) throw new Error("No se pudieron generar planes nutricionales.");
      
      const profileWithPlans = { 
        ...updatedProfile, 
        diets: plans, 
        nutritionPlan: plans[0] 
      };
      
      console.log("[Nutrition] Persisting diets to Firestore...");
      await onUpdateProfile(profileWithPlans);
      setStep('plan');
    } catch (error: any) {
      console.error("[Nutrition] Error generating diets:", error);
      alert("Hubo un problema al generar tu plan. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === 'goal') setStep('intro');
    else if (step === 'timeframe') setStep('goal');
    else if (step === 'allergies') setStep('timeframe');
    else if (step === 'plan') setStep('intro');
    else if (onBack) onBack();
  };

  const [dietToDelete, setDietToDelete] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const resetDiets = async () => {
    setLoading(true);
    try {
      console.log("[Nutrition] Resetting all diets in Firestore...");
      await onUpdateProfile({ 
        ...profile, 
        diets: [], 
        nutritionPlan: null as any,
        nutritionGoal: '',
        nutritionTimeframe: '',
        allergies: ''
      });
      setStep('intro');
      setIsResetting(false);
      console.log("[Nutrition] Diets reset successfully.");
    } catch (error) {
      console.error("[Nutrition] Error resetting diets:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDiet = async (dietId: string) => {
    const updatedDiets = profile.diets?.filter(d => d.id !== dietId) || [];
    const updatedPlan = profile.nutritionPlan?.id === dietId 
      ? (updatedDiets.length > 0 ? updatedDiets[0] : null as any) 
      : profile.nutritionPlan;
    
    try {
      await onUpdateProfile({
        ...profile,
        diets: updatedDiets,
        nutritionPlan: updatedPlan
      });
      setDietToDelete(null);
    } catch (error) {
      console.error("[Nutrition] Error deleting diet:", error);
    }
  };

  const editDiet = (diet: NutritionPlan) => {
    // For now, just a simple prompt to rename or similar, 
    // or we could set step back to 'goal' with pre-filled data.
    const newName = prompt(language === 'es' ? 'Nuevo nombre para la dieta:' : 'New name for the diet:', diet.name || '');
    if (newName !== null) {
      const updatedDiets = profile.diets?.map(d => d.id === diet.id ? { ...d, name: newName } : d) || [];
      onUpdateProfile({
        ...profile,
        diets: updatedDiets,
        nutritionPlan: profile.nutritionPlan?.id === diet.id ? { ...profile.nutritionPlan, name: newName } : profile.nutritionPlan
      });
    }
  };

  return (
    <div className="space-y-12 pb-32">
      <section>
        <div className="flex items-center gap-4 mb-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="rounded-full bg-surface">
            <ArrowLeft size={20} />
          </Button>
          <h2 className="font-headline text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant">{t('nutricionLab')}</h2>
        </div>
        <div className="flex items-end gap-2 mt-2">
          <span className="font-headline text-5xl font-black italic text-primary leading-none">ACF</span>
          <span className="font-headline text-lg font-bold uppercase text-primary mb-1">SISTEMA DE COMBUSTIBLE</span>
        </div>
      </section>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-on-surface-variant font-medium text-center">Nuestra IA está diseñando tu plan nutricional personalizado...</p>
          </motion.div>
        ) : step === 'intro' ? (
          <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 text-center max-w-lg mx-auto">
            <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Utensils className="text-primary" size={40} />
            </div>
            <h3 className="text-3xl font-headline font-black uppercase">{t('optimizaCombustible')}</h3>
            <p className="text-on-surface-variant leading-relaxed">
              Para alcanzar el máximo rendimiento, tu nutrición debe ser tan precisa como tu entrenamiento. Responde unas preguntas para generar tu plan ideal.
            </p>
            <Button onClick={handleStart} className="w-full h-14 rounded-full bg-primary text-background font-black text-lg">
              {t('comenzarAnalisis')}
            </Button>
            {profile.nutritionPlan && (
              <Button variant="ghost" onClick={() => setStep('plan')} className="w-full font-bold">{t('verPlanActual')}</Button>
            )}
          </motion.div>
        ) : step === 'goal' ? (
          <motion.div key="goal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
              <Target className="text-secondary mx-auto mb-4" size={40} />
              <h3 className="text-2xl font-headline font-black uppercase">{t('cualEsObjetivo')}</h3>
              <p className="text-on-surface-variant">{t('seleccionaMeta')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {NUTRITION_GOALS.map(goal => (
                <Button key={goal} variant="outline" onClick={() => handleGoalSelect(goal)} className="h-20 rounded-2xl border-outline-variant/20 hover:border-secondary/50 hover:bg-secondary/5 transition-all font-bold text-lg text-on-surface">
                  {goal}
                </Button>
              ))}
            </div>
          </motion.div>
        ) : step === 'timeframe' ? (
          <motion.div key="timeframe" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
              <Clock className="text-tertiary mx-auto mb-4" size={40} />
              <h3 className="text-2xl font-headline font-black uppercase">{t('enCuantoTiempo')}</h3>
              <p className="text-on-surface-variant">{t('definePlazo')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TIMEFRAMES.map(t_val => (
                <Button key={t_val} variant="outline" onClick={() => handleTimeframeSelect(t_val)} className="h-20 rounded-2xl border-outline-variant/20 hover:border-tertiary/50 hover:bg-tertiary/5 transition-all font-bold text-lg text-on-surface">
                  {t_val}
                </Button>
              ))}
            </div>
          </motion.div>
        ) : step === 'allergies' ? (
          <motion.div key="allergies" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
              <ShieldAlert className="text-primary mx-auto mb-4" size={40} />
              <h3 className="text-2xl font-headline font-black uppercase">{t('alergiasRestricciones')}</h3>
              <p className="text-on-surface-variant">{t('queNoPuedesComer')}</p>
            </div>
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button 
                  onClick={() => setTempData(prev => ({ ...prev, isCeliac: !prev.isCeliac }))}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${tempData.isCeliac ? 'border-primary bg-primary/10' : 'border-outline-variant/20 bg-surface'}`}
                >
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${tempData.isCeliac ? 'bg-primary border-primary' : 'border-on-surface-variant/30'}`}>
                    {tempData.isCeliac && <div className="w-2 h-2 bg-background rounded-sm" />}
                  </div>
                  <span className="font-bold uppercase text-xs tracking-widest">Celíaco</span>
                </button>

                <button 
                  onClick={() => setTempData(prev => ({ ...prev, hasIntolerance: !prev.hasIntolerance }))}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${tempData.hasIntolerance ? 'border-primary bg-primary/10' : 'border-outline-variant/20 bg-surface'}`}
                >
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${tempData.hasIntolerance ? 'bg-primary border-primary' : 'border-on-surface-variant/30'}`}>
                    {tempData.hasIntolerance && <div className="w-2 h-2 bg-background rounded-sm" />}
                  </div>
                  <span className="font-bold uppercase text-xs tracking-widest">Intolerancia</span>
                </button>

                <button 
                  onClick={() => setTempData(prev => ({ ...prev, hasAllergy: !prev.hasAllergy }))}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${tempData.hasAllergy ? 'border-primary bg-primary/10' : 'border-outline-variant/20 bg-surface'}`}
                >
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${tempData.hasAllergy ? 'bg-primary border-primary' : 'border-on-surface-variant/30'}`}>
                    {tempData.hasAllergy && <div className="w-2 h-2 bg-background rounded-sm" />}
                  </div>
                  <span className="font-bold uppercase text-xs tracking-widest">Alergia</span>
                </button>
              </div>

              <AnimatePresence>
                {(tempData.isCeliac || tempData.hasIntolerance || tempData.hasAllergy) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <textarea 
                      placeholder="Especifica aquí tus alergias o intolerancias..."
                      value={tempData.allergies}
                      onChange={e => setTempData(prev => ({ ...prev, allergies: e.target.value }))}
                      className="w-full bg-surface border-none rounded-2xl p-6 h-32 font-medium resize-none focus:ring-2 focus:ring-primary shadow-inner"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <Button onClick={generateDiets} className="w-full h-14 rounded-full bg-primary text-background font-black text-lg shadow-xl shadow-primary/20">
                {t('generarDieta')}
              </Button>
            </div>
          </motion.div>
        ) : step === 'plan' ? (
          <motion.div key="plan" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            {profile.nutritionPlan ? (
              <>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                  <div>
                    <h3 className="text-3xl font-headline font-black uppercase italic tracking-tighter text-primary">{t('tuDieta')}</h3>
                    <p className="text-on-surface-variant font-bold uppercase text-xs tracking-widest mt-1">
                      {t('objetivo')}: <span className="text-secondary">{profile.nutritionGoal}</span> • {profile.nutritionTimeframe}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <AnimatePresence>
                      {isResetting ? (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex gap-2"
                        >
                          <Button 
                            variant="destructive" 
                            onClick={resetDiets} 
                            className="rounded-full px-6 h-12 font-black uppercase tracking-widest text-xs"
                          >
                            {language === 'es' ? 'Confirmar Borrado' : 'Confirm Delete'}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setIsResetting(false)} 
                            className="rounded-full px-6 h-12 font-black uppercase tracking-widest text-xs"
                          >
                            {language === 'es' ? 'Cancelar' : 'Cancel'}
                          </Button>
                        </motion.div>
                      ) : (
                        <Button 
                          variant="destructive" 
                          onClick={() => setIsResetting(true)} 
                          className="rounded-full px-8 h-12 font-black uppercase tracking-widest text-xs shadow-lg shadow-destructive/20 hover:scale-105 transition-transform"
                        >
                          <Trash2 size={16} className="mr-2" />
                          {language === 'es' ? 'Borrar todas las dietas' : 'Delete all diets'}
                        </Button>
                      )}
                    </AnimatePresence>
                    <Button variant="outline" onClick={() => setStep('goal')} className="rounded-full border-primary/30 text-primary hover:bg-primary/10 h-12 px-6">
                      {t('recalibrar')}
                    </Button>
                  </div>
                </div>

                {/* Diet Variants Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.diets?.map((diet, i) => (
                    <Card 
                      key={diet.id} 
                      className={`relative overflow-hidden border-2 transition-all cursor-pointer group ${
                        profile.nutritionPlan?.id === diet.id 
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                          : 'border-outline-variant/20 bg-surface hover:border-primary/50'
                      }`}
                      onClick={() => onUpdateProfile({ ...profile, nutritionPlan: diet })}
                    >
                      <div className="h-24 overflow-hidden relative">
                        <img 
                          src={diet.imageUrl || `https://picsum.photos/seed/${diet.id}/400/200`} 
                          alt={diet.name} 
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-2 left-3">
                          <span className="text-[10px] font-black text-white uppercase tracking-widest bg-primary px-2 py-0.5 rounded">
                            {language === 'es' ? `OPCIÓN ${String.fromCharCode(65 + i)}` : `OPTION ${String.fromCharCode(65 + i)}`}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <div className="flex-1">
                          <h4 className="font-headline font-bold uppercase text-sm truncate">{diet.name || (language === 'es' ? 'Plan Nutricional' : 'Nutrition Plan')}</h4>
                          <p className="text-[10px] text-on-surface-variant font-medium">{diet.meals.length} {language === 'es' ? 'comidas' : 'meals'}</p>
                        </div>
                        <div className="flex gap-1">
                          <AnimatePresence>
                            {dietToDelete === diet.id ? (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex gap-1"
                              >
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  className="h-10 px-3 rounded-xl font-black text-[10px] uppercase"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteDiet(diet.id);
                                  }}
                                >
                                  {language === 'es' ? 'SÍ' : 'YES'}
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="h-10 px-3 rounded-xl font-black text-[10px] uppercase"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDietToDelete(null);
                                  }}
                                >
                                  NO
                                </Button>
                              </motion.div>
                            ) : (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 rounded-full hover:bg-secondary/20 text-secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Simple toggle for now
                                    const newName = diet.name === 'Plan A' ? 'Plan B' : 'Plan A';
                                    onUpdateProfile({
                                      ...profile,
                                      diets: profile.diets?.map(d => d.id === diet.id ? { ...d, name: newName } : d)
                                    });
                                  }}
                                >
                                  <Edit2 size={14} />
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="icon" 
                                  className="h-10 w-10 rounded-full shadow-lg shadow-destructive/20"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDietToDelete(diet.id);
                                  }}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                      {profile.nutritionPlan?.id === diet.id && (
                        <div className="absolute top-2 right-2 bg-primary text-background p-1 rounded-full">
                          <Sparkles size={12} />
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>

            <Card className="bg-surface border-l-4 border-secondary p-8 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <Info className="text-secondary" />
                <h3 className="font-headline text-xl font-bold text-secondary uppercase tracking-widest">{t('analisisNutricional')}</h3>
              </div>
              <p className="text-on-surface leading-relaxed text-lg italic">"{profile.nutritionPlan.reasoning}"</p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.nutritionPlan.meals.map((meal, idx) => (
                <Card key={idx} className="bg-surface border-none overflow-hidden flex flex-col group hover:bg-surface-variant/30 transition-all duration-500">
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={meal.imageUrl || `https://picsum.photos/seed/${meal.name.replace(/\s/g, '')}/800/600`} 
                      alt={meal.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-6">
                      <span className="bg-primary text-background text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest">
                        {meal.type}
                      </span>
                      <h4 className="text-xl font-headline font-black text-on-surface mt-2">{meal.name}</h4>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-primary">Ingredientes</h5>
                      <div className="flex flex-wrap gap-2">
                        {meal.ingredients.map((ing, i) => (
                          <span key={i} className="text-xs bg-background px-3 py-1 rounded-full text-on-surface-variant font-medium">
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-secondary">Preparación</h5>
                      <p className="text-xs text-on-surface-variant leading-relaxed italic">
                        {meal.preparation}
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-4 border-t border-outline-variant/10">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase">{t('prot')}</p>
                        <p className="font-headline font-bold text-primary">{meal.macros.p}g</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase">{t('carb')}</p>
                        <p className="font-headline font-bold text-secondary">{meal.macros.c}g</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase">{t('grasa')}</p>
                        <p className="font-headline font-bold text-tertiary">{meal.macros.f}g</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase">{t('kcal')}</p>
                        <p className="font-headline font-bold text-on-surface">{meal.macros.kcal}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {profile.nutritionPlan.weeklySchedule && (
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <Calendar className="text-primary" />
                  <h3 className="text-2xl font-headline font-black uppercase italic tracking-tighter">Calendario Semanal</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                  {profile.nutritionPlan.weeklySchedule.map((day, dIdx) => (
                    <Card key={dIdx} className="bg-surface/50 border-none p-4 space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-2">{day.day}</h4>
                      <div className="space-y-2">
                        {day.meals.map((mName, mIdx) => (
                          <div key={mIdx} className="text-[10px] font-bold text-on-surface-variant bg-background/50 p-2 rounded-lg leading-tight">
                            {mName}
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-6 text-center max-w-sm mx-auto">
            <div className="w-20 h-20 bg-surface rounded-3xl flex items-center justify-center border border-outline-variant/10">
              <Utensils className="text-on-surface-variant opacity-20" size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-headline font-black uppercase text-on-surface-variant">No hay dietas activas</h3>
              <p className="text-on-surface-variant text-sm mt-2">Personaliza y genera tu plan nutricional para ver tus dietas aquí.</p>
            </div>
            <Button onClick={() => setStep('goal')} className="rounded-full bg-primary text-background font-black uppercase tracking-widest w-full h-14 shadow-lg shadow-primary/20">
              <PlusCircle className="mr-2" size={20} /> Generar nueva dieta
            </Button>
          </div>
        )}
      </motion.div>
    ) : null}
      </AnimatePresence>
    </div>
  );
}
