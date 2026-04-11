import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Message, Language } from '../types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, Smile, Paperclip, MoreVertical } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { chatService } from '../services/chatService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

interface ChatWindowProps {
  currentUser: UserProfile;
  targetUser: UserProfile;
  onClose: () => void;
  language: Language;
}

export default function ChatWindow({ currentUser, targetUser, onClose, language }: ChatWindowProps) {
  const t = useTranslation(language);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const locale = language === 'es' ? es : enUS;

  useEffect(() => {
    const unsubscribe = chatService.subscribeToMessages(
      currentUser.uid,
      targetUser.uid,
      (msgs) => {
        setMessages(msgs);
        setTimeout(() => {
          scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }, 100);
      }
    );
    return () => unsubscribe();
  }, [currentUser.uid, targetUser.uid]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;
    
    const text = newMessage.trim();
    setNewMessage('');
    await chatService.sendMessage(currentUser.uid, targetUser.uid, text);
  };

  return (
    <Card className="bg-surface border-none h-full flex flex-col overflow-hidden shadow-2xl shadow-black/20 rounded-[32px]">
      {/* Header */}
      <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="w-12 h-12 border-2 border-primary/20">
              <AvatarImage src={targetUser.photos?.[0]?.url} />
              <AvatarFallback className="font-black text-sm">{targetUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-surface ${
              targetUser.status === 'online' ? 'bg-green-500' : targetUser.status === 'invisible' ? 'bg-tertiary' : 'bg-on-surface-variant/30'
            }`} />
          </div>
          <div>
            <h4 className="font-headline font-black text-xl uppercase tracking-tight leading-none">{targetUser.username}</h4>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em] mt-1">
              {targetUser.status === 'online' ? t('online') : targetUser.status === 'invisible' ? t('invisible') : t('offline')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full text-on-surface-variant/40 hover:text-primary">
            <MoreVertical size={20} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-on-surface-variant/40 hover:text-destructive">
            <X size={20} />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide bg-background/30"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
            <p className="text-sm font-medium italic">{t('noMensajes')}</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUser.uid;
            return (
              <motion.div
                key={msg.id || idx}
                initial={{ opacity: 0, scale: 0.9, x: isMe ? 20 : -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                    isMe 
                      ? 'bg-primary text-on-primary rounded-tr-none shadow-lg shadow-primary/20' 
                      : 'bg-surface text-on-surface rounded-tl-none shadow-md'
                  }`}>
                    {msg.text}
                  </div>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest px-1">
                    {format(new Date(msg.timestamp), 'HH:mm', { locale })}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Input */}
      <form 
        onSubmit={handleSend}
        className="p-6 bg-surface/50 backdrop-blur-md border-t border-outline-variant/10"
      >
        <div className="flex items-center gap-3 bg-background/50 p-2 rounded-2xl border border-outline-variant/10 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <Button type="button" variant="ghost" size="icon" className="rounded-xl text-on-surface-variant/40 hover:text-primary">
            <Smile size={20} />
          </Button>
          <Input 
            placeholder={t('escribeMensaje')} 
            className="bg-transparent border-none h-12 text-sm font-medium focus-visible:ring-0"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
          />
          <Button type="button" variant="ghost" size="icon" className="rounded-xl text-on-surface-variant/40 hover:text-primary hidden sm:flex">
            <Paperclip size={20} />
          </Button>
          <Button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="bg-primary text-on-primary w-12 h-12 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            <Send size={20} />
          </Button>
        </div>
      </form>
    </Card>
  );
}
