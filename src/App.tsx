import { useState, useEffect } from 'react';
import { Login } from './pages/Login';
import { Home } from './pages/Home';

type Page = 'login' | 'signup' | 'home' | 'search' | 'create' | 'chat' | 'profile' | 'forgot-password' | 'login-otp';

interface User {
  id: string;
  email: string;
  username: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('access_token');

        if (storedUser && accessToken) {
          setUser(JSON.parse(storedUser));
          setCurrentPage('home');
        }
      } catch (err) {
        console.error('Failed to parse stored user:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleNavigate = (page: string) => {
    switch (page) {
      case 'home':
      case 'search':
      case 'create':
      case 'chat':
      case 'profile':
        // These pages require authentication
        if (!user) {
          setCurrentPage('login');
        } else {
          setCurrentPage(page as Page);
        }
        break;
      case 'login':
      case 'signup':
      case 'forgot-password':
      case 'login-otp':
        setCurrentPage(page as Page);
        break;
      default:
        setCurrentPage('login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setCurrentPage('login');
  };

  // Handle user update (for when user data changes)
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-shadow-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-shadow-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 text-sm font-mono tracking-wider">LOADING...</p>
        </div>
      </div>
    );
  }

  // Render appropriate page
  switch (currentPage) {
    case 'home':
      return <Home user={user || undefined} onNavigate={handleNavigate} />;
    case 'login':
    default:
      return <Login onNavigate={handleNavigate} />;
  }
}
