import { useState, useMemo, useEffect } from 'react';
import { Sport, Language, SportConfig } from '../types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Search, Check, Dumbbell, Users, User, Zap, MoreHorizontal, LayoutGrid } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import * as Icons from 'lucide-react';

interface SportsListProps {
  sports: Sport[];
  selectedSports: string[];
  onSelect: (sportName: string) => void;
  onConfirm?: (configs: SportConfig[]) => void;
  language: Language;
}

interface CategoryGroup {
  category: string;
  icon: any;
  items: Sport[];
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function SportsList({ sports, selectedSports, onSelect, onConfirm, language }: SportsListProps) {
  const t = useTranslation(language);
  const [search, setSearch] = useState('');
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [sportConfigs, setSportConfigs] = useState<Record<string, { goal: string, frequency: number, duration: number, isCombined: boolean }>>({});

  const toggleSport = (sportName: string) => {
    onSelect(sportName);
    if (!selectedSports.includes(sportName)) {
      setSportConfigs(prev => ({
        ...prev,
        [sportName]: { goal: 'Fuerza y Tonificación', frequency: 3, duration: 60, isCombined: true }
      }));
    }
  };

  const updateSportConfig = (sportName: string, updates: Partial<{ goal: string, frequency: number, duration: number, isCombined: boolean }>) => {
    setSportConfigs(prev => ({
      ...prev,
      [sportName]: { ...prev[sportName], ...updates }
    }));
  };

  const handleConfirm = () => {
    if (onConfirm) {
      const configs: SportConfig[] = selectedSports.map(name => ({
        sport: name,
        goal: sportConfigs[name]?.goal || 'Fuerza y Tonificación',
        daysPerWeek: sportConfigs[name]?.frequency || 3,
        durationPerSession: sportConfigs[name]?.duration || 60,
        isCombined: sportConfigs[name]?.isCombined ?? true
      }));
      onConfirm(configs);
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

    sports.forEach(sport => {
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
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative z-10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={20} />
        <Input 
          placeholder={t('buscarDeporte')} 
          className="bg-surface border-none pl-12 h-14 rounded-2xl font-medium text-lg shadow-inner"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Alphabet Filter */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/60">Filtrar por letra</span>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => toggleAllCategories(true)}
              className="text-[10px] font-black uppercase tracking-widest text-primary"
            >
              Expandir Todo
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => toggleAllCategories(false)}
              className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40"
            >
              Contraer Todo
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 justify-center bg-surface/30 p-2 rounded-2xl backdrop-blur-sm">
          <button
            onClick={() => {
              setSelectedLetter(null);
              toggleAllCategories(true);
            }}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${!selectedLetter ? 'bg-primary text-on-primary scale-110' : 'text-on-surface-variant hover:bg-surface'}`}
          >
            ALL
          </button>
          {ALPHABET.map(letter => (
            <button
              key={letter}
              onClick={() => {
                const newLetter = selectedLetter === letter ? null : letter;
                setSelectedLetter(newLetter);
                if (newLetter) toggleAllCategories(true);
              }}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${selectedLetter === letter ? 'bg-primary text-on-primary scale-110' : 'text-on-surface-variant hover:bg-surface'}`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-20 opacity-40">
            <Dumbbell size={48} className="mx-auto mb-4" />
            <p className="font-headline font-bold uppercase tracking-widest">
              {language === 'es' ? 'No se encontraron disciplinas' : 'No disciplines found'}
            </p>
          </div>
        ) : (
          filteredCategories.map((group) => (
            <div key={group.category} className="space-y-2">
              <button
                onClick={() => toggleCategory(group.category)}
                className="w-full flex items-center justify-between p-5 bg-surface rounded-2xl hover:bg-surface-variant/30 transition-all group border border-white/5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <group.icon size={24} />
                  </div>
                  <span className="font-headline font-bold text-xl uppercase tracking-tight group-hover:scale-110 transition-transform origin-left">{group.category}</span>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-2">
                      {group.items.map((sport) => {
                        const isSelected = selectedSports.includes(sport.name);
                        const SportIcon = (Icons as any)[sport.icon] || Dumbbell;
                        
                        return (
                        <div className="space-y-3">
                          <motion.button
                            key={sport.name}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleSport(sport.name)}
                            className={`relative w-full flex items-center gap-4 p-3 rounded-2xl transition-all group/item overflow-hidden border border-white/5 h-24 ${
                              isSelected 
                                ? 'bg-primary text-on-primary shadow-xl shadow-primary/30' 
                                : 'bg-surface/50 hover:bg-surface text-on-surface-variant'
                            }`}
                          >
                            {/* Sport Image Background (Subtle) */}
                            {sport.imageUrl && (
                              <div className="absolute inset-0 opacity-30 group-hover/item:opacity-50 transition-opacity">
                                <img 
                                  src={sport.imageUrl} 
                                  alt="" 
                                  className="w-full h-full object-cover grayscale"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}

                            <div className={`relative w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${isSelected ? 'bg-white/20' : 'bg-background/50'}`}>
                              <SportIcon size={28} strokeWidth={2.5} />
                            </div>

                            <div className="relative flex flex-col items-start text-left">
                              <span className="font-headline font-bold text-lg uppercase tracking-tight group-hover/item:scale-105 transition-transform origin-left">
                                {sport.name}
                              </span>
                              <span className={`text-[10px] font-bold uppercase tracking-widest opacity-60 ${isSelected ? 'text-white' : 'text-primary'}`}>
                                {sport.category}
                              </span>
                            </div>

                            {isSelected && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <Check size={20} strokeWidth={3} />
                              </div>
                            )}
                          </motion.button>

                          {/* Inline Config "Subcategories" */}
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="bg-surface-variant/10 rounded-2xl p-4 space-y-4 border border-outline-variant/10 backdrop-blur-md">
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Objetivo para {sport.name}</label>
                                    <div className="grid grid-cols-2 gap-2">
                                      {['Fuerza', 'Hipertrofia', 'Resistencia', 'Pérdida de Peso'].map(goal => (
                                        <button
                                          key={goal}
                                          onClick={() => updateSportConfig(sport.name, { goal })}
                                          className={`h-10 rounded-xl text-[10px] font-bold uppercase transition-all ${
                                            (sportConfigs[sport.name]?.goal || 'Fuerza') === goal 
                                              ? 'bg-primary text-background' 
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
                                              ? 'bg-primary text-background' 
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
                                              ? 'bg-primary text-background' 
                                              : 'bg-background/30 text-on-surface-variant hover:bg-background/50'
                                          }`}
                                        >
                                          {dur.label}
                                        </button>
                                      ))}
                                    </div>
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
                                    <Button 
                                      size="sm" 
                                      onClick={() => toggleSport(sport.name)}
                                      className="bg-primary text-background text-[10px] font-black uppercase tracking-widest px-6 rounded-xl h-10"
                                    >
                                      {t('aceptar')}
                                    </Button>
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

      {selectedSports.length > 0 && onConfirm && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-6"
        >
          <Button 
            onClick={handleConfirm}
            className="w-full h-16 rounded-2xl bg-primary text-on-primary font-black text-xl uppercase tracking-tighter shadow-2xl shadow-primary/40 hover:scale-105 transition-transform"
          >
            {t('generarPlan')} ({selectedSports.length})
          </Button>
        </motion.div>
      )}
    </div>
  );
}
