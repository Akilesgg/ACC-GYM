import { useEffect, useCallback, useRef, useState } from 'react';
import { UserProfile, Screen } from './types';
import TopNav from './components/TopNav';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import Nutrition from './components/Nutrition';
import Evolution from './components/Evolution';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import SportsTab from './components/SportsTab';
import Profile from './components/Profile';
import UserPanel from './components/UserPanel';
import Devices from './components/Devices';
import News from './components/News';
import Movies from './components/Movies';
import DynamicBackground from './components/DynamicBackground';
import { motion, AnimatePresence } from 'motion/react';
import { auth, onAuthStateChanged } from './lib/firebase';
import { subscribeToProfile, createUserProfile, updateUserProfile } from './services/users';
import { useStore } from './store/useStore';
import { seedSports } from './services/sports';
import { INITIAL_SPORTS } from './constants';
import { chatService } from './services/chatService';
import { Card } from '@/components/ui/card';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const { 
    user, setUser, 
    profile, setProfile, 
    activeScreen, setActiveScreen: _setActiveScreen, 
    language, setLanguage,
    loading, setLoading 
  } = useStore();

  const [error, setError] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const setActiveScreen = useCallback((screen: Screen) => {
    console.log(`[NAV] Navigating to: ${screen}`);
    _setActiveScreen(screen);
  }, [_setActiveScreen]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      console.log(`[CLICK] Target: ${target.tagName}, ID: ${target.id}, Class: ${target.className}`);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        console.log(`[SEED] Starting sports seeding with ${INITIAL_SPORTS.length} sports...`);
        await seedSports(INITIAL_SPORTS);
        console.log(`[SEED] Sports seeding completed.`);
      } catch (error) {
        console.error("Seeding error:", error);
      }
    };
    init();
  }, []);

  const activeScreenRef = useRef(activeScreen);
  useEffect(() => {
    activeScreenRef.current = activeScreen;
  }, [activeScreen]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("[AUTH] State changed:", currentUser?.uid ? "User Logged In" : "No User");
      setUser(currentUser);
      setIsAuthReady(true);
      
      if (!currentUser) {
        setProfile(null);
        setActiveScreen('login');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setUser, setProfile, setActiveScreen, setLoading]);

  useEffect(() => {
    if (!user) return;

    console.log("[PROFILE] Starting subscription for:", user.uid);
    setLoading(true);

    const unsubProfile = subscribeToProfile(user.uid, (fetchedProfile) => {
      console.log("[PROFILE] Snapshot received:", fetchedProfile?.username || "No Profile");
      
      const sanitizedProfile = fetchedProfile ? {
        ...fetchedProfile,
        selectedSports: fetchedProfile.selectedSports || []
      } : null;
      
      setProfile(sanitizedProfile);
      
      if (sanitizedProfile) {
        console.log("[PROFILE] Valid profile found, current screen:", activeScreenRef.current);
        // If we have a profile and we are on a "guest" screen, go to dashboard
        if (activeScreenRef.current === 'login' || activeScreenRef.current === 'onboarding') {
          console.log("[PROFILE] Redirecting from guest screen to dashboard");
          setActiveScreen('dashboard');
        }
        if (sanitizedProfile.status !== 'invisible') {
          chatService.updateUserStatus(user.uid, 'online');
        }
      } else {
        // User is logged in but has no profile document -> Onboarding
        // ONLY redirect if we are NOT already on onboarding or login
        if (activeScreenRef.current !== 'onboarding' && activeScreenRef.current !== 'login') {
          console.log("[PROFILE] No profile document found, redirecting to onboarding");
          setActiveScreen('onboarding');
        }
        chatService.updateUserStatus(user.uid, 'online');
      }
      setLoading(false);
    }, (error) => {
      console.error("[PROFILE] Subscription error:", error);
      // Don't set loading to false immediately on error, maybe retry or wait for timeout
      // But if it's a permission error, we should probably stop
      if (error.message?.includes('permission-denied')) {
        setError("Error de permisos al acceder al perfil. Contacta con soporte.");
        setLoading(false);
      }
    });

    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn("[PROFILE] Loading timeout reached");
      setLoading(false);
    }, 5000);

    return () => {
      unsubProfile();
      clearTimeout(timeout);
      chatService.updateUserStatus(user.uid, 'offline');
    };
  }, [user, setProfile, setActiveScreen, setLoading]);

  // Recovery effect: if stuck in "Cargando perfil..." state after loading finished
  useEffect(() => {
    if (user && !profile && !loading && activeScreen !== 'onboarding' && activeScreen !== 'login') {
      console.log("[RECOVERY] Stuck in loading profile state, forcing onboarding");
      setActiveScreen('onboarding');
    }
  }, [user, profile, loading, activeScreen, setActiveScreen]);

  const handleOnboardingComplete = async (newProfile: UserProfile) => {
    if (!user) return;
    console.log("[App] Starting onboarding completion for user:", user.uid);
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout al guardar el perfil. Verifica tu conexión.")), 15000)
    );

    try {
      const fullProfile: UserProfile = { 
        ...newProfile, 
        uid: user.uid, 
        email: user.email || '',
        role: 'user',
        selectedSports: [],
        progress: {},
        streak: 0,
        status: 'online',
        lastSeen: new Date().toISOString(),
        weightHistory: [{ date: new Date().toISOString().split('T')[0], weight: newProfile.weight }],
        photos: []
      };
      
      console.log("[App] Creating user profile in Firestore...");
      await Promise.race([createUserProfile(fullProfile), timeoutPromise]);
      
      console.log("[App] Profile created successfully. Updating local state...");
      setProfile(fullProfile);
      setActiveScreen('dashboard');
    } catch (error: any) {
      console.error("[App] Error saving profile:", error);
      throw error;
    }
  };

  const handleProfileUpdate = async (updatedProfile: UserProfile) => {
    if (!user) return;
    try {
      setError(null);
      // Optimistic update
      setProfile(updatedProfile);
      await updateUserProfile(user.uid, updatedProfile);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      if (error.message === 'QUOTA_EXCEEDED') {
        setError("Límite de datos alcanzado para hoy. Tu progreso se guardará localmente pero no en la nube hasta mañana.");
      }
    }
  };

  if (!isAuthReady || (loading && !profile && user)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-on-surface-variant font-bold animate-pulse uppercase tracking-widest text-xs">Sincronizando sesión...</p>
      </div>
    );
  }

  const renderScreen = () => {
    if (activeScreen === 'onboarding') {
      return <Onboarding onComplete={handleOnboardingComplete} />;
    }

    if (activeScreen === 'login') {
      return <Login language={language} />;
    }

    if (!profile && user) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary/20 rounded-full" />
            <div className="absolute inset-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="text-center space-y-4 max-w-sm">
            <h2 className="font-headline text-2xl font-black uppercase italic tracking-tight text-primary">Sincronizando Perfil</h2>
            <p className="text-on-surface-variant text-sm font-medium leading-relaxed">
              Estamos recuperando tus datos de atleta de la nube. Si esto tarda demasiado, es posible que haya un problema de conexión.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button onClick={() => window.location.reload()} variant="outline" className="rounded-2xl font-black uppercase tracking-widest h-14 border-primary/20 hover:bg-primary/5">
              <RotateCcw className="mr-2" size={18} />
              Reintentar Conexión
            </Button>
            <Button onClick={() => setActiveScreen('onboarding')} variant="ghost" className="text-on-surface-variant/60 font-bold uppercase tracking-widest text-[10px] h-10">
              ¿No tienes perfil? Ir a Registro
            </Button>
          </div>
        </div>
      );
    }

    switch (activeScreen) {
      case 'dashboard': return <Dashboard profile={profile!} onUpdateProfile={handleProfileUpdate} onAddSport={() => setActiveScreen('workout')} onGoToTracking={() => setActiveScreen('evolution')} onGoToProfile={() => setActiveScreen('profile')} onGoToNews={() => setActiveScreen('news')} onGoToMovies={() => setActiveScreen('movies')} language={language} />;
      case 'workout': return <SportsTab onUpdateProfile={handleProfileUpdate} onBack={() => setActiveScreen('dashboard')} language={language} />;
      case 'nutrition': return <Nutrition profile={profile!} onUpdateProfile={handleProfileUpdate} onBack={() => setActiveScreen('dashboard')} language={language} />;
      case 'evolution': return <Evolution profile={profile!} onUpdateProfile={handleProfileUpdate} onBack={() => setActiveScreen('dashboard')} language={language} />;
      case 'profile': return <Profile profile={profile!} onUpdateProfile={handleProfileUpdate} onBack={() => setActiveScreen('dashboard')} language={language} />;
      case 'devices': return <Devices profile={profile!} onUpdateProfile={handleProfileUpdate} onBack={() => setActiveScreen('dashboard')} language={language} />;
      case 'community': return <UserPanel language={language} />;
      case 'news': return <News language={language} />;
      case 'movies': return <Movies language={language} />;
      default: return <Dashboard profile={profile!} onUpdateProfile={handleProfileUpdate} onAddSport={() => setActiveScreen('workout')} onGoToTracking={() => setActiveScreen('evolution')} onGoToProfile={() => setActiveScreen('profile')} onGoToNews={() => setActiveScreen('news')} onGoToMovies={() => setActiveScreen('movies')} language={language} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface relative">
      <div className="sports-bg-overlay">
        <img 
          src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1920&auto=format&fit=crop" 
          className="sports-bg-image" 
          alt=""
          referrerPolicy="no-referrer"
        />
      </div>
      <DynamicBackground />

      <TopNav 
        userPhoto={user?.photoURL || undefined} 
        language={language} 
        onLanguageChange={setLanguage} 
        onProfileClick={() => setActiveScreen('profile')}
      />
      
      <div className="relative z-20">
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-6"
            >
              <Card className="bg-destructive text-destructive-foreground p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
                <Button variant="ghost" size="icon" onClick={() => setError(null)} className="rounded-full hover:bg-white/20">
                  <RotateCcw size={16} />
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        <main className="pt-24 pb-32 px-6 max-w-5xl mx-auto relative z-30">
          <ErrorBoundary key={activeScreen}>
            {renderScreen()}
          </ErrorBoundary>
        </main>
      </div>

      {activeScreen !== 'onboarding' && user && (
        <BottomNav 
          activeScreen={activeScreen} 
          onScreenChange={setActiveScreen} 
          language={language}
        />
      )}
    </div>
  );
}


