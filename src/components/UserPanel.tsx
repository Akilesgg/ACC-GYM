import { useState, useEffect } from 'react';
import { UserProfile, Language, Message } from '../types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MessageSquare, EyeOff, Eye, Users, ChevronRight, X } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { chatService } from '../services/chatService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useStore } from '../store/useStore';
import ChatWindow from './ChatWindow';

export default function UserPanel({ language }: { language: Language }) {
  const t = useTranslation(language);
  const { profile: currentUser } = useStore();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = chatService.subscribeToUsers((allUsers) => {
      // Filter out invisible users unless it's the current user
      const visibleUsers = allUsers.filter(u => 
        u.uid === currentUser.uid || u.status !== 'invisible'
      );
      setUsers(visibleUsers);
    });
    return () => unsubscribe();
  }, [currentUser?.uid]);

  if (!currentUser) return null;

  const toggleInvisible = async () => {
    const newStatus = currentUser.status === 'invisible' ? 'online' : 'invisible';
    await chatService.updateUserStatus(currentUser.uid, newStatus);
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const displayUsers = showAll ? filteredUsers : filteredUsers.slice(0, 5);

  return (
    <div className="space-y-8 pb-32">
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <p className="font-headline text-secondary font-bold uppercase tracking-widest text-sm mb-1">
            {t('comunidad')}
          </p>
          <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-none">
            {t('usuarios').toUpperCase()} <span className="text-primary italic">LAB.</span>
          </h2>
        </div>
        <Button 
          variant="outline" 
          onClick={toggleInvisible}
          className={`rounded-full h-12 px-6 font-bold uppercase tracking-widest text-xs transition-all ${
            currentUser.status === 'invisible' ? 'bg-tertiary/10 text-tertiary border-tertiary/30' : ''
          }`}
        >
          {currentUser.status === 'invisible' ? <Eye size={16} className="mr-2" /> : <EyeOff size={16} className="mr-2" />}
          {t('invisible')}
        </Button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-surface border-none p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Users size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">{t('totalUsuarios')}</span>
              </div>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black">{users.length}</span>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={16} />
              <Input 
                placeholder={t('buscarUsuario')} 
                className="bg-background border-none pl-10 h-10 rounded-xl text-sm"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              {displayUsers.map((user) => (
                <button
                  key={user.uid}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all hover:bg-background group ${
                    selectedUser?.uid === user.uid ? 'bg-background ring-1 ring-primary/20' : ''
                  }`}
                >
                  <div className="relative">
                    <Avatar className="w-10 h-10 border border-outline-variant/10">
                      <AvatarImage src={user.photos?.[0]?.url} />
                      <AvatarFallback className="font-bold text-xs">{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-surface ${
                      user.status === 'online' ? 'bg-green-500' : user.status === 'invisible' ? 'bg-tertiary' : 'bg-on-surface-variant/30'
                    }`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-sm truncate">{user.username}</p>
                    <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">@{user.username.toLowerCase().replace(' ', '')}</p>
                  </div>
                  <ChevronRight size={14} className="text-on-surface-variant/20 group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>

            {filteredUsers.length > 5 && (
              <Button 
                variant="ghost" 
                className="w-full text-primary font-bold uppercase tracking-widest text-[10px]"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? t('atras') : t('verTodos')}
              </Button>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2 min-h-[500px]">
          <AnimatePresence mode="wait">
            {selectedUser ? (
              <motion.div
                key={selectedUser.uid}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <ChatWindow 
                  currentUser={currentUser} 
                  targetUser={selectedUser} 
                  onClose={() => setSelectedUser(null)}
                  language={language}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 bg-surface/30 rounded-[32px] border border-dashed border-outline-variant/20"
              >
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6">
                  <MessageSquare className="text-primary" size={40} />
                </div>
                <h3 className="text-2xl font-headline font-black uppercase tracking-tight mb-2">{t('chat')}</h3>
                <p className="text-on-surface-variant max-w-xs">{t('noMensajes')}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
