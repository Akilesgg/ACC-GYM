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
import UserPanel from './components/UserPanel';
import Devices from './components/Devices';
import DynamicBackground from './components/DynamicBackground';
import { motion, AnimatePresence } from 'motion/react';
import { auth, onAuthStateChanged } from './lib/firebase';
import { subscribeToProfile, createUserProfile, updateUserProfile } from './services/users';
import { useStore } from './store/useStore';
import { seedSports } from './services/sports';
import { chatService } from './services/chatService';

const INITIAL_SPORTS = [
  { name: "Musculación", icon: "Dumbbell", category: "Fuerza", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop" },
  { name: "Ciclismo", icon: "Bike", category: "Cardio", imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=400&auto=format&fit=crop" },
  { name: "Natación", icon: "Waves", category: "Cardio", imageUrl: "https://images.unsplash.com/photo-1530549387074-dca99938023a?q=80&w=400&auto=format&fit=crop" },
  { name: "Running", icon: "Footprints", category: "Cardio", imageUrl: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=400&auto=format&fit=crop" },
  { name: "CrossFit", icon: "Flame", category: "Híbrido", imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop" },
  { name: "Yoga", icon: "Heart", category: "Bienestar", imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400&auto=format&fit=crop" },
  { name: "Boxeo", icon: "Trophy", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=400&auto=format&fit=crop" },
  { name: "Triatlón", icon: "Timer", category: "Cardio", imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=400&auto=format&fit=crop" },
  { name: "Fútbol", icon: "Activity", category: "Equipo", imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=400&auto=format&fit=crop" },
  { name: "Senderismo", icon: "Mountain", category: "Aventura", imageUrl: "https://images.unsplash.com/photo-1551632432-c735e7a0328b?q=80&w=400&auto=format&fit=crop" },
  { name: "Escalada", icon: "Mountain", category: "Aventura", imageUrl: "https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=400&auto=format&fit=crop" },
  { name: "Surf", icon: "Wind", category: "Agua", imageUrl: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=400&auto=format&fit=crop" },
  { name: "Remo", icon: "Anchor", category: "Cardio", imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400&auto=format&fit=crop" },
  { name: "Esquí", icon: "MountainSnow", category: "Invierno", imageUrl: "https://images.unsplash.com/photo-1551698618-1fed5d978044?q=80&w=400&auto=format&fit=crop" },
  { name: "Danza", icon: "Palette", category: "Arte", imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=400&auto=format&fit=crop" },
  { name: "Karate", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Judo", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Jiu-Jitsu Brasileño", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Muay Thai", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Taekwondo", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Kung Fu", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Krav Maga", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Aikido", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Kendo", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Kickboxing", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Sambo", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Capoeira", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Hapkido", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Wing Chun", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Savate", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Tai Chi", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Tenis", icon: "Activity", category: "Raqueta", imageUrl: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=400&auto=format&fit=crop" },
  { name: "Pádel", icon: "Activity", category: "Raqueta", imageUrl: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=400&auto=format&fit=crop" },
  { name: "Baloncesto", icon: "Activity", category: "Equipo", imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=400&auto=format&fit=crop" },
  { name: "Voleibol", icon: "Activity", category: "Equipo", imageUrl: "https://images.unsplash.com/photo-1592656670411-2918d70c6a44?q=80&w=400&auto=format&fit=crop" },
  { name: "Balonmano", icon: "Activity", category: "Equipo", imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=400&auto=format&fit=crop" },
  { name: "Rugby", icon: "Activity", category: "Equipo", imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=400&auto=format&fit=crop" },
  { name: "Golf", icon: "Activity", category: "Precisión", imageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=400&auto=format&fit=crop" },
  { name: "Bádminton", icon: "Activity", category: "Raqueta", imageUrl: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=400&auto=format&fit=crop" },
  { name: "Tenis de Mesa", icon: "Activity", category: "Raqueta", imageUrl: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=400&auto=format&fit=crop" },
  { name: "Squash", icon: "Activity", category: "Raqueta", imageUrl: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=400&auto=format&fit=crop" },
  { name: "Béisbol", icon: "Activity", category: "Equipo", imageUrl: "https://images.unsplash.com/photo-1508344928928-7165b67de128?q=80&w=400&auto=format&fit=crop" },
  { name: "Sóftbol", icon: "Activity", category: "Equipo", imageUrl: "https://images.unsplash.com/photo-1508344928928-7165b67de128?q=80&w=400&auto=format&fit=crop" },
  { name: "Críquet", icon: "Activity", category: "Equipo", imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=400&auto=format&fit=crop" },
  { name: "Hockey sobre Hierba", icon: "Activity", category: "Equipo", imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=400&auto=format&fit=crop" },
  { name: "Hockey sobre Hielo", icon: "MountainSnow", category: "Invierno", imageUrl: "https://images.unsplash.com/photo-1551698618-1fed5d978044?q=80&w=400&auto=format&fit=crop" },
  { name: "Patinaje sobre Hielo", icon: "MountainSnow", category: "Invierno", imageUrl: "https://images.unsplash.com/photo-1551698618-1fed5d978044?q=80&w=400&auto=format&fit=crop" },
  { name: "Patinaje en Línea", icon: "Activity", category: "Ruedas", imageUrl: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?q=80&w=400&auto=format&fit=crop" },
  { name: "Skateboarding", icon: "Activity", category: "Ruedas", imageUrl: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?q=80&w=400&auto=format&fit=crop" },
  { name: "BMX", icon: "Bike", category: "Ruedas", imageUrl: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?q=80&w=400&auto=format&fit=crop" },
  { name: "Motocross", icon: "Bike", category: "Motor", imageUrl: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?q=80&w=400&auto=format&fit=crop" },
  { name: "Automovilismo", icon: "Activity", category: "Motor", imageUrl: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?q=80&w=400&auto=format&fit=crop" },
  { name: "Karting", icon: "Activity", category: "Motor", imageUrl: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?q=80&w=400&auto=format&fit=crop" },
  { name: "Esgrima", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Tiro con Arco", icon: "Target", category: "Precisión", imageUrl: "https://images.unsplash.com/photo-1511078573293-423810aeaf01?q=80&w=400&auto=format&fit=crop" },
  { name: "Tiro Deportivo", icon: "Target", category: "Precisión", imageUrl: "https://images.unsplash.com/photo-1511078573293-423810aeaf01?q=80&w=400&auto=format&fit=crop" },
  { name: "Equitación", icon: "Activity", category: "Animal", imageUrl: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=400&auto=format&fit=crop" },
  { name: "Polo", icon: "Activity", category: "Animal", imageUrl: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=400&auto=format&fit=crop" },
  { name: "Pentatlón Moderno", icon: "Timer", category: "Híbrido", imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=400&auto=format&fit=crop" },
  { name: "Decatlón", icon: "Timer", category: "Atletismo", imageUrl: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=400&auto=format&fit=crop" },
  { name: "Heptatlón", icon: "Timer", category: "Atletismo", imageUrl: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=400&auto=format&fit=crop" },
  { name: "Maratón", icon: "Footprints", category: "Atletismo", imageUrl: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=400&auto=format&fit=crop" },
  { name: "Ultramaratón", icon: "Footprints", category: "Atletismo", imageUrl: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=400&auto=format&fit=crop" },
  { name: "Trail Running", icon: "Mountain", category: "Aventura", imageUrl: "https://images.unsplash.com/photo-1551632432-c735e7a0328b?q=80&w=400&auto=format&fit=crop" },
  { name: "Orientación", icon: "Mountain", category: "Aventura", imageUrl: "https://images.unsplash.com/photo-1551632432-c735e7a0328b?q=80&w=400&auto=format&fit=crop" },
  { name: "Parkour", icon: "Flame", category: "Urbano", imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop" },
  { name: "Calistenia", icon: "Dumbbell", category: "Fuerza", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop" },
  { name: "Pilates", icon: "Heart", category: "Bienestar", imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400&auto=format&fit=crop" },
  { name: "Zumba", icon: "Palette", category: "Danza", imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=400&auto=format&fit=crop" },
  { name: "Aeróbic", icon: "Activity", category: "Cardio", imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=400&auto=format&fit=crop" },
  { name: "Spinning", icon: "Bike", category: "Cardio", imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=400&auto=format&fit=crop" },
  { name: "BodyPump", icon: "Dumbbell", category: "Fuerza", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop" },
  { name: "TRX", icon: "Dumbbell", category: "Fuerza", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop" },
  { name: "Kettlebell Training", icon: "Dumbbell", category: "Fuerza", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop" },
  { name: "Powerlifting", icon: "Dumbbell", category: "Fuerza", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop" },
  { name: "Halterofilia", icon: "Dumbbell", category: "Fuerza", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop" },
  { name: "Strongman", icon: "Dumbbell", category: "Fuerza", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop" },
  { name: "Lucha Libre", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Lucha Grecorromana", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Sumo", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Kárate Kyokushin", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Jeet Kune Do", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Ninjutsu", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Bujinkan", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Iaido", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Kyudo", icon: "Target", category: "Precisión", imageUrl: "https://images.unsplash.com/photo-1511078573293-423810aeaf01?q=80&w=400&auto=format&fit=crop" },
  { name: "Arnis/Eskrima", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Silat", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Lethwei", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Vale Tudo", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "MMA", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Grappling", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Luta Livre", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Pankration", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Savate Pro", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Muay Boran", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Pradal Serey", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Bokator", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Krabi Krabong", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Bando", icon: "Sword", category: "Combate", imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop" },
  { name: "Ajedrez", icon: "Target", category: "Mente", imageUrl: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=400&auto=format&fit=crop" },
  { name: "Billar", icon: "Target", category: "Precisión", imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400&auto=format&fit=crop" },
  { name: "Bowling", icon: "Target", category: "Precisión", imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400&auto=format&fit=crop" }
];

import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const { 
    user, setUser, 
    profile, setProfile, 
    activeScreen, setActiveScreen, 
    language, setLanguage,
    loading, setLoading 
  } = useStore();

  useEffect(() => {
    const init = async () => {
      try {
        await seedSports(INITIAL_SPORTS);
      } catch (error) {
        console.error("Seeding error:", error);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const unsubProfile = subscribeToProfile(currentUser.uid, (fetchedProfile) => {
          console.log("Profile updated:", fetchedProfile?.username, "Screen:", activeScreen);
          const sanitizedProfile = fetchedProfile ? {
            ...fetchedProfile,
            selectedSports: fetchedProfile.selectedSports || []
          } : null;
          
          setProfile(sanitizedProfile);
          
          // Only set online if not already invisible
          if (sanitizedProfile && sanitizedProfile.status !== 'invisible') {
            chatService.updateUserStatus(currentUser.uid, 'online');
          } else if (!sanitizedProfile) {
            // First time user
            chatService.updateUserStatus(currentUser.uid, 'online');
          }

          if (!sanitizedProfile) {
            setActiveScreen('onboarding');
          } else if (activeScreen === 'login') {
            setActiveScreen('dashboard');
          }
          setLoading(false);
        }, (error) => {
          console.error("Profile subscription error:", error);
          setLoading(false);
        });

        // Fallback to stop loading after 5 seconds if profile sub doesn't fire
        const timeout = setTimeout(() => setLoading(false), 5000);

        return () => {
          unsubProfile();
          clearTimeout(timeout);
          chatService.updateUserStatus(currentUser.uid, 'offline');
        };
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

    if (!profile && user) return <Onboarding onComplete={handleOnboardingComplete} />;

    switch (activeScreen) {
      case 'dashboard': return <Dashboard profile={profile!} onUpdateProfile={handleProfileUpdate} onAddSport={() => setActiveScreen('workout')} onGoToTracking={() => setActiveScreen('tracking')} language={language} />;
      case 'workout': return <SportsTab onUpdateProfile={handleProfileUpdate} onBack={() => setActiveScreen('dashboard')} language={language} />;
      case 'nutrition': return <Nutrition profile={profile!} onUpdateProfile={handleProfileUpdate} onBack={() => setActiveScreen('dashboard')} language={language} />;
      case 'gallery': return <Gallery profile={profile!} onUpdateProfile={handleProfileUpdate} onBack={() => setActiveScreen('dashboard')} language={language} />;
      case 'tracking': return <Tracking profile={profile!} onUpdateProfile={handleProfileUpdate} onBack={() => setActiveScreen('dashboard')} language={language} />;
      case 'profile': return <Profile profile={profile!} onUpdateProfile={handleProfileUpdate} onBack={() => setActiveScreen('dashboard')} language={language} />;
      case 'devices': return <Devices profile={profile!} onUpdateProfile={handleProfileUpdate} onBack={() => setActiveScreen('dashboard')} language={language} />;
      case 'community': return <UserPanel language={language} />;
      case 'login': return <Login language={language} />;
      default: return <Dashboard profile={profile!} onUpdateProfile={handleProfileUpdate} onAddSport={() => setActiveScreen('workout')} onGoToTracking={() => setActiveScreen('tracking')} language={language} />;
    }
  };

  if (!user && activeScreen === 'login') {
    return <Login language={language} />;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface relative overflow-hidden">
      <DynamicBackground />

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
              <ErrorBoundary key={activeScreen}>
                {renderScreen()}
              </ErrorBoundary>
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


