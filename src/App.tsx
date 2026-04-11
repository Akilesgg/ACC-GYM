import { useEffect } from 'react';
import { UserProfile } from './types';
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
import { motion, AnimatePresence } from 'motion/react';
import { auth, onAuthStateChanged } from './lib/firebase';
import { subscribeToProfile, createUserProfile, updateUserProfile } from './services/users';
import { useStore } from './store/useStore';
import { seedSports } from './services/sports';

const INITIAL_SPORTS = [
  { name: "Musculación", icon: "Dumbbell", category: "Fuerza" },
  { name: "Ciclismo", icon: "Bike", category: "Cardio" },
  { name: "Natación", icon: "Waves", category: "Cardio" },
  { name: "Running", icon: "Footprints", category: "Cardio" },
  { name: "CrossFit", icon: "Flame", category: "Híbrido" },
  { name: "Yoga", icon: "Heart", category: "Bienestar" },
  { name: "Boxeo", icon: "Trophy", category: "Combate" },
  { name: "Triatlón", icon: "Timer", category: "Cardio" },
  { name: "Fútbol", icon: "Activity", category: "Equipo" },
  { name: "Senderismo", icon: "Mountain", category: "Aventura" },
  { name: "Escalada", icon: "Mountain", category: "Aventura" },
  { name: "Surf", icon: "Wind", category: "Agua" },
  { name: "Remo", icon: "Anchor", category: "Cardio" },
  { name: "Esquí", icon: "MountainSnow", category: "Invierno" },
  { name: "Danza", icon: "Palette", category: "Arte" },
  { name: "Karate", icon: "Sword", category: "Combate" },
  { name: "Judo", icon: "Sword", category: "Combate" },
  { name: "Jiu-Jitsu Brasileño", icon: "Sword", category: "Combate" },
  { name: "Muay Thai", icon: "Sword", category: "Combate" },
  { name: "Taekwondo", icon: "Sword", category: "Combate" },
  { name: "Kung Fu", icon: "Sword", category: "Combate" },
  { name: "Krav Maga", icon: "Sword", category: "Combate" },
  { name: "Aikido", icon: "Sword", category: "Combate" },
  { name: "Kendo", icon: "Sword", category: "Combate" },
  { name: "Kickboxing", icon: "Sword", category: "Combate" },
  { name: "Sambo", icon: "Sword", category: "Combate" },
  { name: "Capoeira", icon: "Sword", category: "Combate" },
  { name: "Hapkido", icon: "Sword", category: "Combate" },
  { name: "Wing Chun", icon: "Sword", category: "Combate" },
  { name: "Savate", icon: "Sword", category: "Combate" },
  { name: "Tai Chi", icon: "Sword", category: "Combate" },
  { name: "Tenis", icon: "Activity", category: "Raqueta" },
  { name: "Pádel", icon: "Activity", category: "Raqueta" },
  { name: "Baloncesto", icon: "Activity", category: "Equipo" },
  { name: "Voleibol", icon: "Activity", category: "Equipo" },
  { name: "Balonmano", icon: "Activity", category: "Equipo" },
  { name: "Rugby", icon: "Activity", category: "Equipo" },
  { name: "Golf", icon: "Activity", category: "Precisión" },
  { name: "Bádminton", icon: "Activity", category: "Raqueta" },
  { name: "Tenis de Mesa", icon: "Activity", category: "Raqueta" },
  { name: "Squash", icon: "Activity", category: "Raqueta" },
  { name: "Béisbol", icon: "Activity", category: "Equipo" },
  { name: "Sóftbol", icon: "Activity", category: "Equipo" },
  { name: "Críquet", icon: "Activity", category: "Equipo" },
  { name: "Hockey sobre Hierba", icon: "Activity", category: "Equipo" },
  { name: "Hockey sobre Hielo", icon: "MountainSnow", category: "Invierno" },
  { name: "Patinaje sobre Hielo", icon: "MountainSnow", category: "Invierno" },
  { name: "Patinaje en Línea", icon: "Activity", category: "Ruedas" },
  { name: "Skateboarding", icon: "Activity", category: "Ruedas" },
  { name: "BMX", icon: "Bike", category: "Ruedas" },
  { name: "Motocross", icon: "Bike", category: "Motor" },
  { name: "Automovilismo", icon: "Activity", category: "Motor" },
  { name: "Karting", icon: "Activity", category: "Motor" },
  { name: "Esgrima", icon: "Sword", category: "Combate" },
  { name: "Tiro con Arco", icon: "Target", category: "Precisión" },
  { name: "Tiro Deportivo", icon: "Target", category: "Precisión" },
  { name: "Equitación", icon: "Activity", category: "Animal" },
  { name: "Polo", icon: "Activity", category: "Animal" },
  { name: "Pentatlón Moderno", icon: "Timer", category: "Híbrido" },
  { name: "Decatlón", icon: "Timer", category: "Atletismo" },
  { name: "Heptatlón", icon: "Timer", category: "Atletismo" },
  { name: "Maratón", icon: "Footprints", category: "Atletismo" },
  { name: "Ultramaratón", icon: "Footprints", category: "Atletismo" },
  { name: "Trail Running", icon: "Mountain", category: "Aventura" },
  { name: "Orientación", icon: "Mountain", category: "Aventura" },
  { name: "Parkour", icon: "Flame", category: "Urbano" },
  { name: "Calistenia", icon: "Dumbbell", category: "Fuerza" },
  { name: "Pilates", icon: "Heart", category: "Bienestar" },
  { name: "Zumba", icon: "Palette", category: "Danza" },
  { name: "Aeróbic", icon: "Activity", category: "Cardio" },
  { name: "Spinning", icon: "Bike", category: "Cardio" },
  { name: "BodyPump", icon: "Dumbbell", category: "Fuerza" },
  { name: "TRX", icon: "Dumbbell", category: "Fuerza" },
  { name: "Kettlebell Training", icon: "Dumbbell", category: "Fuerza" },
  { name: "Powerlifting", icon: "Dumbbell", category: "Fuerza" },
  { name: "Halterofilia", icon: "Dumbbell", category: "Fuerza" },
  { name: "Strongman", icon: "Dumbbell", category: "Fuerza" },
  { name: "Lucha Libre", icon: "Sword", category: "Combate" },
  { name: "Lucha Grecorromana", icon: "Sword", category: "Combate" },
  { name: "Sumo", icon: "Sword", category: "Combate" },
  { name: "Kárate Kyokushin", icon: "Sword", category: "Combate" },
  { name: "Jeet Kune Do", icon: "Sword", category: "Combate" },
  { name: "Ninjutsu", icon: "Sword", category: "Combate" },
  { name: "Bujinkan", icon: "Sword", category: "Combate" },
  { name: "Iaido", icon: "Sword", category: "Combate" },
  { name: "Kyudo", icon: "Target", category: "Precisión" },
  { name: "Arnis/Eskrima", icon: "Sword", category: "Combate" },
  { name: "Silat", icon: "Sword", category: "Combate" },
  { name: "Lethwei", icon: "Sword", category: "Combate" },
  { name: "Vale Tudo", icon: "Sword", category: "Combate" },
  { name: "MMA", icon: "Sword", category: "Combate" },
  { name: "Grappling", icon: "Sword", category: "Combate" },
  { name: "Luta Livre", icon: "Sword", category: "Combate" },
  { name: "Pankration", icon: "Sword", category: "Combate" },
  { name: "Savate Pro", icon: "Sword", category: "Combate" },
  { name: "Muay Boran", icon: "Sword", category: "Combate" },
  { name: "Pradal Serey", icon: "Sword", category: "Combate" },
  { name: "Bokator", icon: "Sword", category: "Combate" },
  { name: "Krabi Krabong", icon: "Sword", category: "Combate" },
  { name: "Bando", icon: "Sword", category: "Combate" }
];

export default function App() {
  const { 
    user, setUser, 
    profile, setProfile, 
    activeScreen, setActiveScreen, 
    language, setLanguage,
    loading, setLoading 
  } = useStore();

  useEffect(() => {
    seedSports(INITIAL_SPORTS);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const unsubProfile = subscribeToProfile(currentUser.uid, (fetchedProfile) => {
          setProfile(fetchedProfile);
          if (!fetchedProfile) {
            setActiveScreen('onboarding');
          } else if (activeScreen === 'login') {
            setActiveScreen('dashboard');
          }
          setLoading(false);
        });
        return () => unsubProfile();
      } else {
        setProfile(null);
        setActiveScreen('login');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setUser, setProfile, setActiveScreen, setLoading]);

  const handleOnboardingComplete = async (newProfile: UserProfile) => {
    if (!user) return;
    try {
      await createUserProfile({ ...newProfile, uid: user.uid, email: user.email || '' });
      setActiveScreen('dashboard');
    } catch (error) {
      console.error("Error saving profile:", error);
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

    if (!profile && user) return <Onboarding onComplete={handleOnboardingComplete} />;

    switch (activeScreen) {
      case 'dashboard': return <Dashboard profile={profile!} onUpdateProfile={handleProfileUpdate} onAddSport={() => setActiveScreen('workout')} onGoToTracking={() => setActiveScreen('tracking')} language={language} />;
      case 'workout': return <SportsTab profile={profile!} onUpdateProfile={handleProfileUpdate} onBack={() => setActiveScreen('dashboard')} language={language} />;
      case 'nutrition': return <Nutrition profile={profile!} onUpdateProfile={handleProfileUpdate} onBack={() => setActiveScreen('dashboard')} language={language} />;
      case 'gallery': return <Gallery profile={profile!} onUpdateProfile={handleProfileUpdate} onBack={() => setActiveScreen('dashboard')} language={language} />;
      case 'tracking': return <Tracking profile={profile!} onUpdateProfile={handleProfileUpdate} onBack={() => setActiveScreen('dashboard')} language={language} />;
      case 'profile': return <Profile profile={profile!} onUpdateProfile={handleProfileUpdate} onBack={() => setActiveScreen('dashboard')} language={language} />;
      case 'login': return <Login language={language} />;
      default: return <Dashboard profile={profile!} onUpdateProfile={handleProfileUpdate} onAddSport={() => setActiveScreen('workout')} onGoToTracking={() => setActiveScreen('tracking')} language={language} />;
    }
  };

  if (!user && activeScreen === 'login') {
    return <Login language={language} />;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface relative overflow-hidden">
      {/* Animated B&W Background */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.15 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 grayscale bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"
        />
      </div>

      <div className="relative z-10">
        <TopNav 
          userPhoto={user?.photoURL || undefined} 
          language={language} 
          onLanguageChange={setLanguage} 
          onProfileClick={() => setActiveScreen('profile')}
        />
        
        <main className="pt-24 pb-32 px-6 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScreen}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </main>

        {activeScreen !== 'onboarding' && user && (
          <BottomNav 
            activeScreen={activeScreen} 
            onScreenChange={setActiveScreen} 
            language={language}
          />
        )}
      </div>
    </div>
  );
}


