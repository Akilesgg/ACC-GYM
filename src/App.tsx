import { useState, useEffect } from 'react';
import { Screen, UserProfile } from './types';
import TopNav from './components/TopNav';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import Nutrition from './components/Nutrition';
import Gallery from './components/Gallery';
import WorkoutSession from './components/WorkoutSession';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import { motion, AnimatePresence } from 'motion/react';

import SportsTab from './components/SportsTab';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem('kinetic_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    if (!profile) {
      setActiveScreen('onboarding');
    } else {
      setActiveScreen('dashboard');
    }
  };

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('kinetic_profile', JSON.stringify(newProfile));
    setActiveScreen('dashboard');
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('kinetic_profile', JSON.stringify(updatedProfile));
  };

  const renderScreen = () => {
    if (activeScreen === 'onboarding') {
      return <Onboarding onComplete={handleOnboardingComplete} />;
    }

    switch (activeScreen) {
      case 'dashboard': return profile ? <Dashboard profile={profile} /> : <Onboarding onComplete={handleOnboardingComplete} />;
      case 'workout': return profile ? <SportsTab profile={profile} onUpdateProfile={handleProfileUpdate} /> : <Onboarding onComplete={handleOnboardingComplete} />;
      case 'nutrition': return <Nutrition />;
      case 'gallery': return <Gallery />;
      case 'login': return <Login onLogin={handleLogin} />;
      default: return <Dashboard profile={profile!} />;
    }
  };

  if (!isLoggedIn && activeScreen === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopNav userPhoto="https://picsum.photos/seed/athlete/200/200" />
      
      <main className="pt-24 px-6 max-w-5xl mx-auto">
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


