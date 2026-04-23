import { useState, useMemo, useEffect } from 'react';
import { Sport, Language, SportConfig } from '../types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Search, Check, Dumbbell, Users, User, Zap, MoreHorizontal, LayoutGrid, Plus } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import * as Icons from 'lucide-react';

interface SportsListProps {
  sports: Sport[];
  selectedSportNames: string[];
  savedSportNames?: string[];
  onSelect: (sportName: string) => void;
  onConfirm?: (configs: SportConfig[], isCombined: boolean) => void;
  language: Language;
}

interface CategoryGroup {
  category: string;
  icon: any;
  items: Sport[];
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const equipmentOptions: Record<string, {key: string, label: string, icon: string}[]> = {
  'Fuerza': [
    { key: 'hasGym', label: 'Gimnasio completo', icon: '🏋️' },
    { key: 'hasBarbell', label: 'Barra + discos', icon: '🔩' },
    { key: 'hasDumbbells', label: 'Mancuernas', icon: '💪' },
    { key: 'hasPullupBar', label: 'Barra dominadas', icon: '🔗' },
    { key: 'hasBands', label: 'Bandas elásticas', icon: '🪢' },
  ],
  'Cardio': [
    { key: 'hasBike', label: 'Bicicleta', icon: '🚴' },
    { key: 'hasPool', label: 'Piscina', icon: '🏊' },
    { key: 'hasRoller', label: 'Rodillo indoor', icon: '⚙️' },
    { key: 'hasBands', label: 'Bandas elásticas', icon: '🪢' },
  ],
  'Contacto': [
    { key: 'hasGym', label: 'Gimnasio/Dojo', icon: '🥋' },
    { key: 'hasBands', label: 'Saco de boxeo', icon: '🥊' },
    { key: 'hasDumbbells', label: 'Pesas', icon: '💪' },
  ],
  'Combate': [
    { key: 'hasGym', label: 'Gimnasio/Dojo', icon: '🥋' },
    { key: 'hasBands', label: 'Saco de boxeo', icon: '🥊' },
    { key: 'hasDumbbells', label: 'Pesas', icon: '💪' },
  ],
};

const defaultEquipmentOptions = [
  { key: 'hasGym', label: 'Gimnasio/Instalación', icon: '🏢' },
  { key: 'hasBands', label: 'Bandas/Material básico', icon: '🪢' },
];

export default function SportsList({ sports, selectedSportNames, savedSportNames = [], onSelect, onConfirm, language }: SportsListProps) {
  const t = useTranslation(language);
  const [search, setSearch] = useState('');
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [sportConfigs, setSportConfigs] = useState<Record<string, { goal: string, frequency: number, duration: number, isCombined: boolean, subtype?: string, equipment?: any }>>({});
  const [configuringSport, setConfiguringSport] = useState<string | null>(null);

  const toggleSport = (sportName: string) => {
    const isCurrentlySelected = selectedSportNames.includes(sportName);
    onSelect(sportName);
    
    if (!isCurrentlySelected) {
      setSportConfigs(prev => ({
        ...prev,
        [sportName]: { goal: 'Fuerza y Tonificación', frequency: 3, duration: 60, isCombined: true }
      }));
      setConfiguringSport(sportName);
    } else {
      if (configuringSport === sportName) {
        setConfiguringSport(null);
      }
    }
  };

  const updateSportConfig = (sportName: string, updates: Partial<{ goal: string, frequency: number, duration: number, isCombined: boolean, subtype: string, equipment: any }>) => {
    setSportConfigs(prev => ({
      ...prev,
      [sportName]: { ...prev[sportName], ...updates }
    }));
  };

  const handleConfirm = (isCombined: boolean) => {
    if (onConfirm) {
      const configs: SportConfig[] = selectedSportNames.map(name => ({
        sport: name,
        goal: sportConfigs[name]?.goal || 'Fuerza y Tonificación',
        daysPerWeek: sportConfigs[name]?.frequency || 3,
        durationPerSession: sportConfigs[name]?.duration || 60,
        isCombined: isCombined,
        subtype: sportConfigs[name]?.subtype,
        equipment: sportConfigs[name]?.equipment || {},
        hasInstructor: !!sportConfigs[name]?.equipment?.hasInstructor
      }));
      onConfirm(configs, isCombined);
    }
  };

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  const toggleAllCategories = (expand: boolean) => {
    if (expand) {
      setOpenCategories(categories.map(c => c.category));
    } else {
      setOpenCategories([]);
    }
  };

  useEffect(() => {
    console.log(`[SportsList] Received ${sports.length} sports.`);
  }, [sports]);

  const categories: CategoryGroup[] = useMemo(() => {
    const groups: Record<string, Sport[]> = {
      [t('artesMarciales')]: [],
      [t('deportesContacto')]: [],
      [t('deportesEquipo')]: [],
      [t('deportesIndividuales')]: [],
      [t('fitness')]: [],
      [t('otros')]: []
    };

    const icons: Record<string, any> = {
      [t('artesMarciales')]: Zap,
      [t('deportesContacto')]: Zap,
      [t('deportesEquipo')]: Users,
      [t('deportesIndividuales')]: User,
      [t('fitness')]: Dumbbell,
      [t('otros')]: MoreHorizontal
    };

    // ENSURE UNIQUE SPORTS BY NAME
    const uniqueSports = Array.from(new Map(sports.map(s => [s.name, s])).values());

    uniqueSports.forEach(sport => {
      let cat = t('otros');
      const lowerCat = sport.category.toLowerCase();
      const lowerName = sport.name.toLowerCase();
      
      if (lowerCat.includes('contacto') || lowerName.includes('boxeo') || lowerName.includes('boxing') || lowerName.includes('kickboxing') || lowerName.includes('muay thai') || lowerName.includes('savate')) cat = t('deportesContacto');
      else if (lowerCat.includes('combate')) cat = t('artesMarciales');
      else if (lowerCat.includes('equipo')) cat = t('deportesEquipo');
      else if (lowerCat.includes('cardio') || lowerCat.includes('fuerza') || lowerCat.includes('híbrido')) cat = t('fitness');
      else if (lowerCat.includes('raqueta') || lowerCat.includes('atletismo') || lowerCat.includes('agua') || lowerCat.includes('invierno')) cat = t('deportesIndividuales');

      if (groups[cat]) {
        groups[cat].push(sport);
      } else {
        groups[t('otros')].push(sport);
      }
    });

    return Object.entries(groups).map(([name, items]) => ({
      category: name,
      icon: icons[name],
      items: items.sort((a, b) => a.name.localeCompare(b.name))
    })).filter(g => g.items.length > 0);
  }, [sports, t]);

  const filteredCategories = useMemo(() => {
    let result = categories;
    
    if (selectedLetter) {
      const letter = selectedLetter.toUpperCase();
      result = result.map(cat => ({
        ...cat,
        items: cat.items.filter(item => item.name.toUpperCase().startsWith(letter))
      })).filter(cat => cat.items.length > 0);
    }

    if (search) {
      const term = search.toLowerCase();
      result = result.map(cat => ({
        ...cat,
        items: cat.items.filter(item => 
          item.name.toLowerCase().includes(term) || 
          cat.category.toLowerCase().includes(term)
        )
      })).filter(cat => cat.items.length > 0);
    }

    return result;
  }, [categories, search, selectedLetter]);

  useEffect(() => {
    if (search || selectedLetter) {
      setOpenCategories(categories.map(c => c.category));
    }
  }, [search, selectedLetter, categories]);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {categories.length === 0 ? (
          <div className="text-center py-20 opacity-40">
            <Dumbbell size={48} className="mx-auto mb-4" />
            <p className="font-headline font-bold uppercase tracking-widest">
              {language === 'es' ? 'No se encontraron disciplinas' : 'No disciplines found'}
            </p>
          </div>
        ) : (
          categories.map((group) => (
            <div key={group.category} className="space-y-2">
              <button
                onClick={() => toggleCategory(group.category)}
                className="w-full flex items-center justify-between p-6 bg-[#111318] rounded-2xl hover:bg-[#1a1c23] transition-all group border border-white/5 shadow-lg"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <group.icon size={24} />
                  </div>
                  <span className="font-headline font-bold text-lg uppercase tracking-widest text-white">{group.category}</span>
                </div>
                <motion.div
                  animate={{ rotate: openCategories.includes(group.category) ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="text-on-surface-variant/40 group-hover:text-primary transition-colors" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openCategories.includes(group.category) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 gap-3 p-2">
                      {group.items.map((sport) => {
                        const isSelected = selectedSportNames.includes(sport.name);
                        const isSaved = savedSportNames.includes(sport.name);
                        const SportIcon = (Icons as any)[sport.icon] || Dumbbell;
                        
                        return (
                        <div key={sport.name} className="space-y-3">
                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => toggleSport(sport.name)}
                            className={`relative w-full flex items-center gap-4 p-4 rounded-2xl transition-all group/item overflow-hidden border border-white/5 h-20 ${
                              isSelected 
                                ? 'bg-primary text-on-primary shadow-xl shadow-primary/20' 
                                : isSaved
                                  ? 'bg-secondary/10 border-secondary/20 text-secondary'
                                  : 'bg-[#1a1c23] hover:bg-[#22252e] text-on-surface-variant'
                            }`}
                          >
                            <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-white/20' : isSaved ? 'bg-secondary/20' : 'bg-background/50'}`}>
                              <SportIcon size={24} strokeWidth={2.5} />
                            </div>

                            <div className="relative flex flex-col items-start text-left">
                              <span className="font-headline font-bold text-base uppercase tracking-tight">
                                {sport.name}
                              </span>
                              {isSaved && !isSelected && (
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">YA AÑADIDO</span>
                              )}
                            </div>

                            {(isSelected || isSaved) && (
                              <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? 'bg-white/20' : 'bg-secondary text-background'}`}>
                                <Check size={18} strokeWidth={3} />
                              </div>
                            )}
                          </motion.button>

                          {/* Inline Config "Subcategories" */}
                          <AnimatePresence>
                            {(isSelected || configuringSport === sport.name) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="bg-surface-variant/10 rounded-2xl p-4 space-y-4 border border-outline-variant/10 backdrop-blur-md">
                                  {sport.subtypes && (
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Subtipo de {sport.name}</label>
                                      <div className="grid grid-cols-2 gap-2">
                                        {sport.subtypes.map(st => (
                                          <button
                                            key={st}
                                            onClick={() => updateSportConfig(sport.name, { subtype: st })}
                                            className={`h-10 rounded-xl text-[10px] font-bold uppercase transition-all ${
                                              (sportConfigs[sport.name]?.subtype) === st 
                                                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                                                : 'bg-background/30 text-on-surface-variant hover:bg-background/50'
                                            }`}
                                          >
                                            {st}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Objetivo para {sport.name}</label>
                                    <div className="grid grid-cols-2 gap-2">
                                      {['Fuerza', 'Hipertrofia', 'Resistencia', 'Pérdida de Peso'].map(goal => (
                                        <button
                                          key={goal}
                                          onClick={() => updateSportConfig(sport.name, { goal })}
                                          className={`h-10 rounded-xl text-[10px] font-bold uppercase transition-all ${
                                            (sportConfigs[sport.name]?.goal || 'Fuerza') === goal 
                                              ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                                              : 'bg-background/30 text-on-surface-variant hover:bg-background/50'
                                          }`}
                                        >
                                          {goal}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Días por Semana</label>
                                    <div className="flex gap-2">
                                      {[1, 2, 3, 4, 5, 6, 7].map(d => (
                                        <button
                                          key={d}
                                          onClick={() => updateSportConfig(sport.name, { frequency: d })}
                                          className={`flex-1 h-10 rounded-xl text-xs font-bold transition-all ${
                                            (sportConfigs[sport.name]?.frequency || 3) === d 
                                              ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                                              : 'bg-background/30 text-on-surface-variant hover:bg-background/50'
                                          }`}
                                        >
                                          {d}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t('duracionSesion')}</label>
                                    <div className="grid grid-cols-3 gap-2">
                                      {[
                                        { label: '30 min', value: 30 },
                                        { label: '1 h', value: 60 },
                                        { label: '1.5 h', value: 90 },
                                        { label: '2 h', value: 120 },
                                        { label: '3 h', value: 180 }
                                      ].map(dur => (
                                        <button
                                          key={dur.value}
                                          onClick={() => updateSportConfig(sport.name, { duration: dur.value })}
                                          className={`h-10 rounded-xl text-[10px] font-bold uppercase transition-all ${
                                            (sportConfigs[sport.name]?.duration || 60) === dur.value 
                                              ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                                              : 'bg-background/30 text-on-surface-variant hover:bg-background/50'
                                          }`}
                                        >
                                          {dur.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="space-y-3 pt-3 border-t border-white/10">
                                    <div className="flex items-center justify-between p-4 bg-background/30 rounded-2xl border border-white/5 mb-4 group/inst">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary group-hover/inst:scale-110 transition-transform">
                                          <Icons.GraduationCap size={20} />
                                        </div>
                                        <div>
                                          <p className="text-[10px] font-black uppercase tracking-widest text-white">¿Tienes un profesor?</p>
                                          <p className="text-[9px] font-medium opacity-40 uppercase">Para clases guiadas o entrenamiento personal</p>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => updateSportConfig(sport.name, {
                                          equipment: { ...sportConfigs[sport.name]?.equipment, hasInstructor: !sportConfigs[sport.name]?.equipment?.hasInstructor }
                                        })}
                                        className={`w-12 h-6 rounded-full transition-all relative ${sportConfigs[sport.name]?.equipment?.hasInstructor ? 'bg-secondary' : 'bg-surface-variant'}`}
                                      >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${sportConfigs[sport.name]?.equipment?.hasInstructor ? 'right-1' : 'left-1'}`} />
                                      </button>
                                    </div>

                                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary">
                                      ¿Con qué recursos cuentas?
                                    </p>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                      {(equipmentOptions[sport.category] || defaultEquipmentOptions).map(opt => (
                                        <button
                                          key={opt.key}
                                          onClick={() => updateSportConfig(sport.name, {
                                            equipment: { ...sportConfigs[sport.name]?.equipment, [opt.key]: !sportConfigs[sport.name]?.equipment?.[opt.key] }
                                          })}
                                          className={`flex items-center gap-2 p-2 rounded-xl text-[10px] font-bold border transition-all ${
                                            sportConfigs[sport.name]?.equipment?.[opt.key]
                                              ? 'border-primary bg-primary/10 text-primary'
                                              : 'border-white/10 text-on-surface-variant'
                                          }`}
                                        >
                                          <span>{opt.icon}</span> {opt.label}
                                        </button>
                                      ))}
                                    </div>
                                    
                                    <textarea
                                      placeholder="Otras limitaciones o equipo disponible..."
                                      className="w-full bg-background/50 border border-white/10 rounded-xl p-3 text-xs text-on-surface resize-none h-16"
                                      value={sportConfigs[sport.name]?.equipment?.limitations || ''}
                                      onChange={(e) => updateSportConfig(sport.name, {
                                        equipment: { ...sportConfigs[sport.name]?.equipment, limitations: e.target.value }
                                      })}
                                    />
                                  </div>

                                  <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => updateSportConfig(sport.name, { isCombined: !sportConfigs[sport.name]?.isCombined })}
                                        className={`w-10 h-6 rounded-full transition-all relative ${sportConfigs[sport.name]?.isCombined !== false ? 'bg-secondary' : 'bg-surface-variant'}`}
                                      >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${sportConfigs[sport.name]?.isCombined !== false ? 'right-1' : 'left-1'}`} />
                                      </button>
                                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{t('combinarConOtros')}</span>
                                    </div>
                                    <div className="flex flex-col gap-2 w-full">
                                      <Button 
                                        disabled={savedSportNames.includes(sport.name)}
                                        onClick={() => {
                                          if (onConfirm) {
                                            if (!selectedSportNames.includes(sport.name)) {
                                              onSelect(sport.name);
                                            }
                                            const config: SportConfig = {
                                              sport: sport.name,
                                              goal: sportConfigs[sport.name]?.goal || 'Fuerza y Tonificación',
                                              daysPerWeek: sportConfigs[sport.name]?.frequency || 3,
                                              durationPerSession: sportConfigs[sport.name]?.duration || 60,
                                              isCombined: sportConfigs[sport.name]?.isCombined ?? false,
                                              subtype: sportConfigs[sport.name]?.subtype,
                                              equipment: sportConfigs[sport.name]?.equipment || {},
                                              hasInstructor: !!sportConfigs[sport.name]?.equipment?.hasInstructor
                                            };
                                            onConfirm([config], config.isCombined ?? false);
                                          }
                                        }}
                                        className={`text-[10px] font-black uppercase tracking-widest px-6 rounded-xl h-10 shadow-lg w-full transition-all ${
                                          savedSportNames.includes(sport.name)
                                            ? 'bg-secondary text-background shadow-secondary/20 cursor-default opacity-80'
                                            : 'bg-primary text-on-primary shadow-primary/20 hover:scale-105 active:scale-95'
                                        }`}
                                      >
                                        {savedSportNames.includes(sport.name) ? (
                                          <div className="flex items-center gap-1 justify-center w-full">
                                            <Check size={14} className="animate-in zoom-in duration-300" />
                                            DEPORTE AÑADIDO
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-1 justify-center w-full">
                                            <Plus size={14} />
                                            Añadir deporte
                                          </div>
                                        )}
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => setConfiguringSport(null)}
                                        className="border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest px-4 rounded-xl h-10 hover:bg-primary/10 w-full"
                                      >
                                        {language === 'es' ? 'Añadir más disciplinas' : 'Add more disciplines'}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>

      {selectedSportNames.length > 0 && onConfirm && (
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[250] w-full max-w-lg px-4"
        >
          <div className="relative group">
            {/* Outer Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-[3rem] blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative bg-[#111318]/95 backdrop-blur-3xl p-8 rounded-[3.5rem] border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,1)] space-y-6">
              <div className="flex items-start justify-between px-2">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(var(--primary),0.8)] animate-pulse" />
                    <span className="text-sm font-black uppercase tracking-[0.3em] text-primary">
                      {selectedSportNames.length} {selectedSportNames.length === 1 ? 'Disciplina' : 'Disciplinas'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedSportNames.map(s => (
                      <span key={s} className="text-[10px] font-black bg-white/5 text-on-surface-variant px-4 py-1.5 rounded-xl uppercase border border-white/5">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    selectedSportNames.forEach(name => onSelect(name));
                    setConfiguringSport(null);
                    setSearch('');
                    setSelectedLetter(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 h-12 px-6 group/btn"
                >
                  <Search size={14} className="mr-2 text-primary group-hover/btn:scale-125 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Buscar más</span>
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => handleConfirm(false)}
                  className="h-24 rounded-[2.5rem] bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-2 group/add"
                >
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center group-hover/add:bg-primary/20 group-hover/add:text-primary transition-all">
                    <Plus size={20} />
                  </div>
                  <span>{selectedSportNames.every(name => savedSportNames.includes(name)) ? 'Deporte añadido' : 'Añadir deporte'}</span>
                </Button>
                
                <Button 
                  onClick={() => handleConfirm(true)}
                  disabled={selectedSportNames.length < 2}
                  className={`h-24 rounded-[2.5rem] font-black text-xs uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-2 shadow-2xl relative overflow-hidden group/combine ${
                    selectedSportNames.length >= 2 
                      ? 'bg-primary text-on-primary shadow-primary/40 hover:scale-[1.02] active:scale-95' 
                      : 'bg-white/5 text-white/20 cursor-not-allowed grayscale'
                  }`}
                >
                  {/* Internal button shine */}
                  {selectedSportNames.length >= 2 && (
                    <motion.div
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                    />
                  )}
                  
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    selectedSportNames.length >= 2 
                      ? 'bg-black/20 group-hover/combine:bg-black/30' 
                      : 'bg-white/5'
                  }`}>
                    <Zap size={20} fill="currentColor" />
                  </div>
                  <span className="relative z-10">Combinar Deportes</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
