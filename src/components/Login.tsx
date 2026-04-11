import { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../lib/firebase';
import { Language } from '../types';
import { useTranslation } from '../lib/i18n';

interface LoginProps {
  language: Language;
}

export default function Login({ language }: LoginProps) {
  const t = useTranslation(language);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error logging in with Google:", error);
      setError("Error con Google Login");
    }
  };

  const handleEmailAuth = async () => {
    setError(null);
    if (!email || !password) {
      setError("Completa todos los campos");
      return;
    }
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "Error de autenticación");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden -mx-6">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop" 
          alt="Fitness Motivation" 
          className="w-full h-full object-cover opacity-40 grayscale contrast-125"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      {/* Logo */}
      <header className="fixed top-0 w-full z-50 flex justify-center py-10">
        <div className="font-headline text-4xl font-black italic text-primary tracking-tighter">ACF SPORT</div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-md px-8 flex flex-col items-center">
        <div className="text-center mb-12 space-y-4">
          <h1 className="font-headline text-5xl font-extrabold leading-tight tracking-tight uppercase">
            {t('maximoRendimiento').split(' ')[0]} <br /> <span className="text-secondary italic">{t('maximoRendimiento').split(' ')[1]}</span>
          </h1>
          <p className="text-on-surface-variant font-medium text-lg leading-relaxed max-w-[280px] mx-auto">
            {t('accede')}
          </p>
        </div>

        <div className="w-full space-y-6">
          <Button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-primary text-background py-8 rounded-full font-headline font-bold text-lg active:scale-95 transition-all duration-200 shadow-[0_0_40px_rgba(243,255,202,0.2)]"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {t('continuarGoogle')}
          </Button>

          <div className="h-10 flex items-center justify-center">
            <span className="text-[10px] font-bold tracking-[0.2em] text-outline opacity-40 uppercase">{t('oUsaCredenciales')}</span>
          </div>

          <div className="space-y-4">
            {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}
            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center text-outline-variant group-focus-within:text-secondary">
                <Mail size={20} />
              </div>
              <Input 
                className="w-full bg-surface border-none rounded-xl py-8 pl-14 pr-6 text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-secondary/20 transition-all" 
                placeholder={t('correo')} 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center text-outline-variant group-focus-within:text-secondary">
                <Lock size={20} />
              </div>
              <Input 
                className="w-full bg-surface border-none rounded-xl py-8 pl-14 pr-6 text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-secondary/20 transition-all" 
                placeholder={t('contrasena')} 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={handleEmailAuth}
            className="w-full py-8 rounded-full bg-surface-variant text-secondary font-headline font-bold tracking-wide hover:bg-surface active:scale-95 transition-all"
          >
            {isRegistering ? <UserPlus size={20} className="mr-2" /> : <LogIn size={20} className="mr-2" />}
            {isRegistering ? t('registrateHoy') : t('entrar')}
          </Button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-outline text-sm">
            {isRegistering ? t('yaTienesCuenta') : t('noTienesPerfil')} 
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-primary font-bold ml-1 hover:underline underline-offset-4"
            >
              {isRegistering ? t('entrar') : t('unete')}
            </button>
          </p>
        </div>
      </main>

      {/* Decorative Blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
}
