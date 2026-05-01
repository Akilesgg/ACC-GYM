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
import AdminDashboard from './components/AdminDashboard';
import Supplements from './components/Supplements';
import { motion, AnimatePresence } from 'motion/react';
import { auth, onAuthStateChanged } from './lib/firebase';
import { subscribeToProfile, createUserProfile, updateUserProfile } from './services/users';
import { useStore } from './store/useStore';
import { seedSports } from './services/sports';
import { INITIAL_SPORTS } from './constants';
import { chatService } from './services/chatService';
import { Card } from '@/components/ui/card';
import { RotateCcw, ShieldAlert } from 'lucide-react';
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

  // Global Sports Seeding
  useEffect(() => {
    const init = async () => {
      try {
        console.log(`[SEED] Checking/Seeding sports...`);
        await seedSports(INITIAL_SPORTS);
        console.log(`[SEED] Success.`);
      } catch (error: any) {
        console.error("[SEED] CRITICAL ERROR:", error.message);
        setError(`Error de inicialización: ${error.message || 'Fallo en la base de datos'}`);
      }
    };
    init();
  }, [setError]);

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
        // Only redirect if not already on login
        if (activeScreenRef.current !== 'login') {
          setActiveScreen('login');
        }
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
      console.log("[PROFILE] Snapshot received at:", new Date().toLocaleTimeString());
      console.log("[PROFILE] Data exists:", !!fetchedProfile);
      if (fetchedProfile) {
        console.log("[PROFILE] Username:", fetchedProfile.username);
        console.log("[PROFILE] Sports count:", fetchedProfile.sports?.length || 0);
      }
      
      const sanitizedProfile = fetchedProfile ? {
        ...fetchedProfile,
        sports: fetchedProfile.sports || [],
        nutritionPlan: fetchedProfile.nutritionPlan || null
      } : null;
      
      // Mergear Firestore con lo que hay en localStorage con precaución
      const localProfile = useStore.getState().profile;
      if (sanitizedProfile) {
        // Para evitar que deportes o dietas recién añadidos desaparezcan por snapshots lentos,
        // o que elementos borrados reaparezcan (el bug anterior), comparamos las colecciones.
        // La fuente de verdad es sanitizedProfile (servidor), PERO si el local tiene un cambio muy reciente
        // (medido por longitud o timestamps si los tuviéramos), lo respetamos brevemente.
        
        // REGLA: Si la longitud local es mayor, es probable un "Añadir" pendiente de sync.
        // Si la longitud local es menor, es probable un "Borrar" ya procesado localmente.
        // En ambos casos, el estado local suele ser más "fresco" respecto a la intención del usuario inmediata.
        
        const merged = {
          ...sanitizedProfile,
          sports: (localProfile?.sports && localProfile.sports.length !== (sanitizedProfile.sports || []).length)
            ? localProfile.sports
            : sanitizedProfile.sports,
          archivedSports: (localProfile?.archivedSports && localProfile.archivedSports.length !== (sanitizedProfile.archivedSports || []).length)
            ? localProfile.archivedSports
            : sanitizedProfile.archivedSports,
          plan: (localProfile?.plan && !sanitizedProfile.plan)
            ? localProfile.plan
            : sanitizedProfile.plan,
          nutritionPlan: (localProfile?.nutritionPlan && !sanitizedProfile.nutritionPlan)
            ? localProfile.nutritionPlan
            : sanitizedProfile.nutritionPlan,
          diets: (localProfile?.diets && localProfile.diets.length !== (sanitizedProfile.diets || []).length)
            ? localProfile.diets
            : sanitizedProfile.diets,
          archivedDiets: (localProfile?.archivedDiets && localProfile.archivedDiets.length !== (sanitizedProfile.archivedDiets || []).length)
            ? localProfile.archivedDiets
            : sanitizedProfile.archivedDiets
        };
        
        setProfile(merged);
      } else if (!localProfile) {
        setProfile(null);
      }
      
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
      clearTimeout(timeout); // Clear timeout on success
    }, (error) => {
      console.error("[PROFILE] Subscription error:", error);
      setLoading(false);
      if (error.message?.includes('permission-denied')) {
        setError("Error de permisos al acceder al perfil. Contacta con soporte.");
      } else {
        setError("Error al sincronizar el perfil. Verifica tu conexión.");
      }
    });

    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn("[PROFILE] Loading timeout reached");
      setLoading(false);
    }, 8000);

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
    const { setOnboardingStep } = useStore.getState();
    if (!user) return;
    console.log("[App] Starting onboarding completion for user:", user.uid);
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("La operación ha tardado demasiado. Verifica tu conexión a internet.")), 30000)
    );

    try {
      const fullProfile: UserProfile = { 
        ...newProfile, 
        uid: user.uid, 
        email: user.email || '',
        role: 'user',
        sports: [],
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
      setOnboardingStep(1); // Reset step for future use
      setActiveScreen('dashboard');
    } catch (error: any) {
      console.error("[App] Error saving profile:", error);
      throw error;
    }
  };

  const handleProfileUpdate = async (updatedProfile: UserProfile) => {
    if (!user) return;
    
    // 1. Guardar en estado local y localStorage INMEDIATAMENTE (nunca falla)
    setProfile(updatedProfile);
    
    // 2. Intentar sincronizar con Firestore en segundo plano (puede fallar sin bloquear)
    updateUserProfile(user.uid, updatedProfile).catch((err) => {
      console.warn("[App] Firestore sync failed (datos guardados localmente):", err.message);
      // No mostrar error al usuario — los datos están en localStorage
    });
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
      case 'workout': return <SportsTab profile={profile!} onUpdateProfile={handleProfileUpdate} onBack={() => setActiveScreen('dashboard')} language={language} />;
      case 'nutrition': return <Nutrition profile={profile!} onUpdateProfile={handleProfileUpdate} onBack={() => setActiveScreen('dashboard')} language={language} />;
      case 'evolution': return <Evolution profile={profile!} onUpdateProfile={handleProfileUpdate} onBack={() => setActiveScreen('dashboard')} language={language} />;
      case 'profile': return <Profile profile={profile!} onUpdateProfile={handleProfileUpdate} onBack={() => setActiveScreen('dashboard')} language={language} />;
      case 'devices': return <Devices profile={profile!} onUpdateProfile={handleProfileUpdate} onBack={() => setActiveScreen('dashboard')} language={language} />;
      case 'community': return <UserPanel language={language} />;
      case 'news': return <News language={language} />;
      case 'movies': return <Movies language={language} />;
      case 'admin': 
        if (profile?.role === 'admin') {
          return <AdminDashboard profile={profile!} onBack={() => setActiveScreen('dashboard')} language={language} />;
        }
        setActiveScreen('dashboard');
        return null;
      case 'supplements': return <Supplements profile={profile!} onUpdateProfile={handleProfileUpdate} onBack={() => setActiveScreen('dashboard')} language={language} />;
      default: return <Dashboard profile={profile!} onUpdateProfile={handleProfileUpdate} onAddSport={() => setActiveScreen('workout')} onGoToTracking={() => setActiveScreen('evolution')} onGoToProfile={() => setActiveScreen('profile')} onGoToNews={() => setActiveScreen('news')} onGoToMovies={() => setActiveScreen('movies')} language={language} />;
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-on-surface relative">
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
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-[500] w-full max-w-lg px-6"
            >
              <Card className="bg-destructive text-destructive-foreground p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2 border-white/20 backdrop-blur-xl flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                      <ShieldAlert size={24} />
                    </div>
                    <h4 className="font-headline font-black uppercase tracking-widest text-lg">Error de Sistema</h4>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setError(null)} className="rounded-full hover:bg-white/20 -mt-1 -mr-1">
                    <RotateCcw size={20} />
                  </Button>
                </div>
                <p className="text-sm font-bold uppercase tracking-tight leading-relaxed italic opacity-90 border-l-4 border-white/30 pl-4">
                   {error}
                </p>
                <div className="pt-2 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.location.reload()}
                    className="bg-white/10 hover:bg-white/20 border-white/20 text-[10px] font-black uppercase tracking-widest h-10 px-6 rounded-xl"
                  >
                    Recargar Aplicación
                  </Button>
                </div>
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
          profile={profile}
        />
      )}
    </div>
  );
}


