import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import HomeSignedInPreview from './pages/HomeSignedInPreview';
import Explore from './pages/Explore';
import Library from './pages/Library';
import BookDetail from './pages/BookDetail';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import { AudioPlayerProvider } from './context/AudioPlayerContext.jsx';
import AppLayout from './components/AppLayout';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getSessionProfile } from './lib/supabaseData';

function App() {
  const { i18n } = useTranslation();
  const [isDark, setIsDark] = useState(true);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  // Apply dark class to body so global styles work too
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    let isActive = true;

    async function bootstrapSession() {
      if (!isSupabaseConfigured || !supabase) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const nextState = await getSessionProfile();
        if (isActive) {
          setSession(nextState.session);
          setProfile(nextState.profile);
        }
      } catch (error) {
        console.error('Unable to bootstrap Supabase session', error);
      } finally {
        if (isActive) {
          setIsBootstrapping(false);
        }
      }
    }

    bootstrapSession();

    if (!supabase) {
      return undefined;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        setProfile(null);
        return;
      }

      try {
        const nextState = await getSessionProfile();
        if (isActive) {
          setProfile(nextState.profile);
        }
      } catch (error) {
        console.error('Unable to refresh profile after auth change', error);
      }
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  async function refreshProfile() {
    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    const nextState = await getSessionProfile();
    setSession(nextState.session);
    setProfile(nextState.profile);
  }

  return (
    <AudioPlayerProvider>
    <Router>
      <div className="min-h-screen flex flex-col font-sans pb-24 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-forest/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-honey/10 blur-[120px] rounded-full pointer-events-none" />
        
        <NavBar
          isDark={isDark}
          toggleTheme={() => setIsDark(!isDark)}
          changeLanguage={(lng) => i18n.changeLanguage(lng)}
          currentLang={i18n.language}
          profile={profile}
          session={session}
        />
        
        <AppLayout>
          <main className="flex-1 overflow-y-auto z-10">
            <Routes>
              <Route path="/" element={<Home session={session} profile={profile} isBootstrapping={isBootstrapping} />} />
              <Route path="/preview/signed-in-home" element={<HomeSignedInPreview />} />
              <Route path="/explore" element={<Explore session={session} profile={profile} />} />
              <Route path="/library" element={<Library profile={profile} session={session} />} />
              <Route path="/book/:id" element={<BookDetail profile={profile} />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile key={profile?.id || 'guest'} profile={profile} session={session} refreshProfile={refreshProfile} />} />
            </Routes>
          </main>
        </AppLayout>
      </div>
    </Router>
    </AudioPlayerProvider>
  );
}

export default App;
