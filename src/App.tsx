import { useEffect, useCallback, useRef } from 'react';
import { UserProfile, Screen } from './types';
import TopNav from './components/TopNav';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import Nutrition from './components/Nutrition';
import Gallery from './components/Gallery';
import Tracking from './components/Tracking';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import SportsTab from './components/SportsTab';
import Profile from './components/Profile';
import UserPanel from './components/UserPanel';
import Devices from './components/Devices';
import DynamicBackground from './components/DynamicBackground';
import { motion, AnimatePresence } from 'motion/react';
import { auth, onAuthStateChanged } from './lib/firebase';
import { subscribeToProfile, createUserProfile, updateUserProfile } from './services/users';
import { useStore } from './store/useStore';
import { seedSports } from './services/sports';
import { INITIAL_SPORTS } from './constants';
import { chatService } from './services/chatService';
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
        // If we have a profile and we are on a "guest" screen, go to dashboard
        if (activeScreenRef.current === 'login' || activeScreenRef.current === 'onboarding') {
          setActiveScreen('dashboard');
        }
        if (sanitizedProfile.status !== 'invisible') {
          chatService.updateUserStatus(user.uid, 'online');
        }
      } else {
        // User is logged in but has no profile document -> Onboarding
        console.log("[PROFILE] No profile document found, redirecting to onboarding");
        setActiveScreen('onboarding');
        chatService.updateUserStatus(user.uid, 'online');
      }
      setLoading(false);
    }, (error) => {
      console.error("[PROFILE] Subscription error:", error);
      setLoading(false);
    });

    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn("[PROFILE] Loading timeout reached");
      setLoading(false);
    }, 10000);

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
      await createUserProfile(fullProfile);
      setProfile(fullProfile);
      setActiveScreen('dashboard');
    } catch (error) {
      console.error("Error saving profile:", error);
      throw error;
    }
  };

  const handleProfileUpdate = async (updatedProfile: UserProfile) => {
    if (!user) return;
    try {
      await updateUserProfile(user.uid, updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
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
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="text-center space-y-2">
            <p className="text-on-surface-variant font-bold animate-pulse">Cargando perfil...</p>
            <p className="text-xs text-on-surface-variant/60 px-6">Si esto tarda demasiado, es posible que necesites completar tu registro o reintentar la conexión.</p>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-xs px-6">
            <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl font-black uppercase tracking-widest h-12">
              Reintentar Carga
            </Button>
            <Button onClick={() => setActiveScreen('onboarding')} variant="ghost" className="text-primary font-black uppercase tracking-widest h-12">
              Ir a Registro
            </Button>
          </div>
        </div>
      );
    }

    switch (activeScreen) {
      case 'dashboard': return <Dashboard profile={profile!} onUpdateProfile={handleProfileUpdate} onAddSport={() => setActiveScreen('workout')} onGoToTracking={() => setActiveScreen('tracking')} onGoToProfile={() => setActiveScreen('profile')} language={language} />;
      case 'workout': return <SportsTab onUpdateProfile={handleProfileUpdate} onBack={() => setActiveScreen('dashboard')} language={language} />;
      case 'nutrition': return <Nutrition profile={profile!} onUpdateProfile={handleProfileUpdate} onBack={() => setActiveScreen('dashboard')} language={language} />;
      case 'gallery': return <Gallery profile={profile!} onUpdateProfile={handleProfileUpdate} onBack={() => setActiveScreen('dashboard')} language={language} />;
      case 'tracking': return <Tracking profile={profile!} onUpdateProfile={handleProfileUpdate} onBack={() => setActiveScreen('dashboard')} language={language} />;
      case 'profile': return <Profile profile={profile!} onUpdateProfile={handleProfileUpdate} onBack={() => setActiveScreen('dashboard')} language={language} />;
      case 'devices': return <Devices profile={profile!} onUpdateProfile={handleProfileUpdate} onBack={() => setActiveScreen('dashboard')} language={language} />;
      case 'community': return <UserPanel language={language} />;
      default: return <Dashboard profile={profile!} onUpdateProfile={handleProfileUpdate} onAddSport={() => setActiveScreen('workout')} onGoToTracking={() => setActiveScreen('tracking')} onGoToProfile={() => setActiveScreen('profile')} language={language} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface relative">
      <DynamicBackground />

      <TopNav 
        userPhoto={user?.photoURL || undefined} 
        language={language} 
        onLanguageChange={setLanguage} 
        onProfileClick={() => setActiveScreen('profile')}
      />
      
      <div className="relative z-20">
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


