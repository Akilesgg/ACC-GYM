import { useState, useEffect } from 'react';
import { Screen, UserProfile } from './types';
import TopNav from './components/TopNav';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import Nutrition from './components/Nutrition';
import Gallery from './components/Gallery';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, onAuthStateChanged, doc, getDoc, setDoc, onSnapshot, User } from './lib/firebase';

import SportsTab from './components/SportsTab';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Listen to profile changes in real-time
        const profileRef = doc(db, 'users', currentUser.uid);
        const unsubProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
            if (activeScreen === 'login') setActiveScreen('dashboard');
          } else {
            setProfile(null);
            setActiveScreen('onboarding');
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
  }, [activeScreen]);

  const handleOnboardingComplete = async (newProfile: UserProfile) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), newProfile);
      setProfile(newProfile);
      setActiveScreen('dashboard');
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleProfileUpdate = async (updatedProfile: UserProfile) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), updatedProfile);
      setProfile(updatedProfile);
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

    switch (activeScreen) {
      case 'dashboard': return profile ? <Dashboard profile={profile} onUpdateProfile={handleProfileUpdate} onAddSport={() => setActiveScreen('workout')} /> : <Onboarding onComplete={handleOnboardingComplete} />;
      case 'workout': return profile ? <SportsTab profile={profile} onUpdateProfile={handleProfileUpdate} onBack={() => setActiveScreen('dashboard')} /> : <Onboarding onComplete={handleOnboardingComplete} />;
      case 'nutrition': return <Nutrition onBack={() => setActiveScreen('dashboard')} />;
      case 'gallery': return <Gallery onBack={() => setActiveScreen('dashboard')} />;
      case 'login': return <Login />;
      default: return <Dashboard profile={profile!} onUpdateProfile={handleProfileUpdate} onAddSport={() => setActiveScreen('workout')} />;
    }
  };

  if (!user && activeScreen === 'login') {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopNav userPhoto={user?.photoURL || undefined} />
      
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

      {activeScreen !== 'onboarding' && (
        <BottomNav 
          activeScreen={activeScreen} 
          onScreenChange={setActiveScreen} 
        />
      )}
    </div>
  );
}


