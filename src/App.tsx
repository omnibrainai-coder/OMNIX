import { useState, useEffect } from 'react';
import { supabase } from './supabase/supabaseClient';
import { Login } from './pages/Login';
import { Home } from './pages/Home';

type Page = 'login' | 'signup' | 'home' | 'search' | 'create' | 'chat' | 'profile' | 'forgot-password' | 'login-otp';

interface User {
  id: string;
  email: string;
  username?: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          username: session.user.user_metadata?.username || session.user.user_metadata?.full_name
        });
        setCurrentPage('home');
      } else {
        setUser(null);
        setCurrentPage('login');
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && session.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          username: session.user.user_metadata?.username || session.user.user_metadata?.full_name
        });
        setCurrentPage('home');
      } else {
        setUser(null);
        setCurrentPage('login');
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleNavigate = (page: string) => {
    if (['search', 'create', 'chat', 'profile', 'home'].includes(page) && !user) {
      setCurrentPage('login');
      return;
    }
    setCurrentPage(page as Page);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('login');
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0512] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-[#ff007f] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_#ff007f]" />
        <p className="text-[#ff007f] font-mono tracking-widest text-sm animate-pulse">SHADOW INITIALIZING...</p>
      </div>
    );
  }

  switch (currentPage) {
    case 'home':
      return <Home user={user || undefined} onNavigate={handleNavigate} onLogout={handleLogout} />;
    case 'login':
    default:
      return <Login onNavigate={handleNavigate} />;
  }
}
