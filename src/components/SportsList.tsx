import { useState, useMemo, useEffect } from 'react';
import { Sport, Language } from '../types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Search, Check, Dumbbell, Users, User, Zap, MoreHorizontal } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

interface SportsListProps {
  sports: Sport[];
  selectedSports: string[];
  onSelect: (sportName: string) => void;
  onConfirm?: () => void;
  language: Language;
}

interface CategoryGroup {
  category: string;
  icon: any;
  items: Sport[];
}

export default function SportsList({ sports, selectedSports, onSelect, onConfirm, language }: SportsListProps) {
  const t = useTranslation(language);
  const [search, setSearch] = useState('');
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const categories: CategoryGroup[] = useMemo(() => {
    const groups: Record<string, Sport[]> = {
      [t('artesMarciales')]: [],
      [t('deportesEquipo')]: [],
      [t('deportesIndividuales')]: [],
      [t('fitness')]: [],
      [t('otros')]: []
    };

    const icons: Record<string, any> = {
      [t('artesMarciales')]: Zap,
      [t('deportesEquipo')]: Users,
      [t('deportesIndividuales')]: User,
      [t('fitness')]: Dumbbell,
      [t('otros')]: MoreHorizontal
    };

    sports.forEach(sport => {
      let cat = t('otros');
      const lowerCat = sport.category.toLowerCase();
      
      if (lowerCat.includes('combate')) cat = t('artesMarciales');
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
    if (!search) return categories;
    
    const term = search.toLowerCase();
    return categories.map(cat => ({
      ...cat,
      items: cat.items.filter(item => 
        item.name.toLowerCase().includes(term) || 
        cat.category.toLowerCase().includes(term)
      )
    })).filter(cat => cat.items.length > 0);
  }, [categories, search]);

  useEffect(() => {
    if (!openCategory && filteredCategories.length > 0 && !search) {
      setOpenCategory(filteredCategories[0].category);
    }
  }, [filteredCategories, search, openCategory]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={20} />
        <Input 
          placeholder={t('buscarDeporte')} 
          className="bg-surface border-none pl-12 h-14 rounded-2xl font-medium"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
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
              onClick={() => setOpenCategory(openCategory === group.category ? null : group.category)}
              className="w-full flex items-center justify-between p-5 bg-surface rounded-2xl hover:bg-surface-variant/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <group.icon size={20} />
                </div>
                <span className="font-headline font-bold text-lg uppercase tracking-tight group-hover:scale-110 transition-transform origin-left">{group.category}</span>
              </div>
              <motion.div
                animate={{ rotate: openCategory === group.category ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="text-on-surface-variant/40 group-hover:text-primary transition-colors" />
              </motion.div>
            </button>

            <AnimatePresence>
              {(openCategory === group.category || search) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                    {group.items.map((sport) => {
                      const isSelected = selectedSports.includes(sport.name);
                      return (
                        <motion.button
                          key={sport.name}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onSelect(sport.name)}
                          className={`flex items-center justify-between p-4 rounded-xl transition-all group/item ${
                            isSelected 
                              ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                              : 'bg-surface/50 hover:bg-surface text-on-surface-variant'
                          }`}
                        >
                          <span className="font-bold group-hover/item:scale-110 transition-transform origin-left">{sport.name}</span>
                          {isSelected && <Check size={18} />}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )))}
      </div>

      {selectedSports.length > 0 && onConfirm && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-6"
        >
          <Button 
            onClick={onConfirm}
            className="w-full h-16 rounded-2xl bg-primary text-on-primary font-black text-xl uppercase tracking-tighter shadow-2xl shadow-primary/40 hover:scale-105 transition-transform"
          >
            {t('continuar')} ({selectedSports.length})
          </Button>
        </motion.div>
      )}
    </div>
  );
}
