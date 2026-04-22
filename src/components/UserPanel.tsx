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

  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'league'>('chat');

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
  }, [currentUser?.uid, currentUser?.status]);

  if (!currentUser) return null;

  // Virtual League Logic
  const leagueUsers = [...users].sort((a, b) => (b.points || 0) - (a.points || 0));

  if (activeSubTab === 'league' && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
        <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center animate-pulse">
          <Users size={40} className="text-white/20" />
        </div>
        <div className="space-y-1">
          <h3 className="font-headline text-3xl font-black uppercase tracking-tight">Sincronizando Atletas</h3>
          <p className="text-on-surface-variant font-medium uppercase tracking-widest text-[10px]">Conectando con el servidor de la liga...</p>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center gap-4">
            <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-none">
              {t('usuarios').toUpperCase()} <span className="text-primary italic">LAB.</span>
            </h2>
            <div className="flex bg-white/5 p-1 rounded-2xl items-center self-end mb-2">
               <button 
                onClick={() => setActiveSubTab('chat')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'chat' ? 'bg-primary text-on-primary' : 'hover:bg-white/5'}`}
               >
                 {t('chat')}
               </button>
               <button 
                onClick={() => setActiveSubTab('league')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'league' ? 'bg-secondary text-background' : 'hover:bg-white/5'}`}
               >
                 {t('ligaVirtual')}
               </button>
            </div>
          </div>
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

      <AnimatePresence mode="wait">
        {activeSubTab === 'chat' ? (
          <motion.div 
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
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

                <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
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
          </motion.div>
        ) : (
          <motion.div
            key="league"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
               {/* Podio: 2nd, 1st, 3rd */}
               {[leagueUsers[1], leagueUsers[0], leagueUsers[2]].filter(Boolean).map((user) => {
                 const isFirst = leagueUsers[0]?.uid === user.uid;
                 const isSecond = leagueUsers[1]?.uid === user.uid;
                 const rank = leagueUsers.findIndex(u => u.uid === user.uid) + 1;
                 
                 return (
                   <Card key={user.uid} className={`relative overflow-hidden border-none p-8 flex flex-col items-center text-center gap-4 transition-all duration-500 ${
                     isFirst ? 'bg-gradient-to-br from-secondary/20 to-primary/20 ring-2 ring-secondary/40 h-[420px] scale-105 z-10' : 'bg-surface h-[360px]'
                   }`}>
                     <div className="relative">
                       <Avatar className={`w-24 h-24 border-4 ${isFirst ? 'border-secondary' : isSecond ? 'border-zinc-400' : 'border-amber-700'}`}>
                         <AvatarImage src={user.photos?.[0]?.url} />
                         <AvatarFallback className="text-2xl font-black">{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                       </Avatar>
                       <div className={`absolute -top-4 -right-4 w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-xl ${
                         isFirst ? 'bg-secondary text-background' : isSecond ? 'bg-zinc-400 text-background' : 'bg-amber-700 text-white'
                       }`}>
                         {rank}
                       </div>
                     </div>
                     <div>
                       <h3 className="text-xl font-headline font-black uppercase tracking-tight">{user.username}</h3>
                       <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{user.rank || 'Principiante'}</p>
                     </div>
                     <div className="w-full h-px bg-white/5" />
                     <div className="flex items-center gap-2">
                       <span className="text-3xl font-headline font-black text-primary italic">{user.points || 0}</span>
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">puntos</span>
                     </div>
                     {isFirst && <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-[0.3em] text-secondary animate-pulse">Líder Actual</div>}
                   </Card>
                 );
               })}
            </div>

            <Card className="bg-surface border-none p-0 overflow-hidden">
               <div className="p-6 border-b border-white/5 flex items-center justify-between">
                 <h4 className="font-headline font-bold uppercase tracking-widest text-xs">Clasificación General</h4>
                 <div className="flex items-center gap-4 text-xs font-bold opacity-40 uppercase tracking-widest">
                    <span>Usuario</span>
                    <span className="w-20 text-center">Rango</span>
                    <span className="w-24 text-right">Puntos</span>
                 </div>
               </div>
               <div className="divide-y divide-white/5">
                 {leagueUsers.slice(3).map((user, idx) => (
                   <div key={user.uid} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-all">
                      <span className="w-8 font-black text-on-surface-variant/40 text-center">{idx + 4}</span>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.photos?.[0]?.url} />
                        <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{user.username}</p>
                        <p className="text-[10px] opacity-40 uppercase tracking-widest">@{user.username.toLowerCase()}</p>
                      </div>
                      <span className="w-20 text-center text-[10px] font-black uppercase tracking-widest text-primary">{user.rank || 'Novato'}</span>
                      <span className="w-24 text-right font-headline font-black text-xl italic">{user.points || 0}</span>
                   </div>
                 ))}
               </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
