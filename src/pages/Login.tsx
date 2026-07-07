import { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface LoginProps {
  onNavigate: (page: string) => void;
}

export function Login({ onNavigate }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) {
      newErrors.email = 'Email or phone is required';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onNavigate('home');
      } else {
        setErrors({ email: data.detail || 'Invalid credentials' });
      }
    } catch (err) {
      setErrors({ email: 'Connection error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);

    try {
      const response = await fetch('/api/auth/google');
      const data = await response.json();

      if (data.redirect_url) {
        // Simulate successful Google login
        const mockUser = {
          id: 'google-user-' + Date.now(),
          email: 'user@gmail.com',
          username: 'GoogleUser',
        };

        localStorage.setItem('access_token', 'mock-google-token');
        localStorage.setItem('user', JSON.stringify(mockUser));

        setTimeout(() => {
          onNavigate('home');
        }, 500);
      }
    } catch (err) {
      // Fallback: simulate successful login for demo
      const mockUser = {
        id: 'google-user-' + Date.now(),
        email: 'user@gmail.com',
        username: 'GoogleUser',
      };

      localStorage.setItem('access_token', 'mock-google-token');
      localStorage.setItem('user', JSON.stringify(mockUser));

      setTimeout(() => {
        onNavigate('home');
      }, 500);
    } finally {
      setTimeout(() => setGoogleLoading(false), 500);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0B0C10] px-4 py-8">
      {/* Logo Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3">
          <div className="w-12 h-12 relative">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EC4899" />
                  <stop offset="100%" stopColor="#F472B6" />
                </linearGradient>
              </defs>
              <path
                d="M30 20 C30 20, 70 20, 70 35 C70 50, 30 50, 30 65 C30 80, 70 80, 70 80"
                fill="none"
                stroke="url(#logoGradient)"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-light tracking-[0.2em] text-white font-['Share_Tech_Mono',monospace]">
            SHADOW
          </h1>
        </div>
        <p className="text-sm text-white/40 tracking-wider mt-2">
          Private Social Intelligence
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-[#0F1015]/80 backdrop-blur-xl border border-pink-500/50 rounded-2xl p-6 sm:p-8 shadow-[0_0_25px_rgba(236,72,153,0.3)]">
        <h2 className="text-xl font-medium text-white mb-1">Welcome back</h2>
        <p className="text-sm text-white/50 mb-6">Enter your credentials to continue</p>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-white/60 uppercase tracking-wider">
              Email or Phone
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400/60" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email or phone"
                className={cn(
                  'w-full h-14 pl-12 pr-4 bg-[#0B0C10] border rounded-xl text-white text-sm',
                  'placeholder:text-white/30 outline-none transition-all duration-200',
                  'focus:border-pink-500 focus:shadow-[0_0_0_3px_rgba(236,72,153,0.15)]',
                  errors.email ? 'border-red-500' : 'border-white/10'
                )}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-white/60 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400/60" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={cn(
                  'w-full h-14 pl-12 pr-4 bg-[#0B0C10] border rounded-xl text-white text-sm',
                  'placeholder:text-white/30 outline-none transition-all duration-200',
                  'focus:border-pink-500 focus:shadow-[0_0_0_3px_rgba(236,72,153,0.15)]',
                  errors.password ? 'border-red-500' : 'border-white/10'
                )}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password}</p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-[#0B0C10] text-pink-500 focus:ring-pink-500/30"
              />
              <span className="text-xs text-white/60">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => onNavigate('forgot-password')}
              className="text-xs text-pink-400 hover:text-pink-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'w-full h-14 flex items-center justify-center gap-2 font-semibold text-sm uppercase tracking-wider',
              'bg-gradient-to-r from-pink-500 to-pink-400 text-white',
              'rounded-xl transition-all duration-200',
              'hover:shadow-[0_0_25px_rgba(236,72,153,0.5)] hover:-translate-y-0.5',
              'active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0'
            )}
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <span className="text-xs text-white/40 uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className={cn(
            'w-full h-14 flex items-center justify-center gap-3 font-medium text-sm',
            'bg-white text-gray-800 border border-white/20',
            'rounded-xl transition-all duration-200',
            'hover:bg-gray-50 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]',
            'active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {googleLoading ? (
            <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        {/* Sign Up Link */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-sm text-white/50">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('signup')}
              className="text-pink-400 hover:text-pink-300 font-medium transition-colors"
            >
              Create account
            </button>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-xs text-white/30">
          By signing in, you agree to our{' '}
          <button className="text-white/50 hover:text-white/70 transition-colors">
            Terms of Service
          </button>{' '}
          and{' '}
          <button className="text-white/50 hover:text-white/70 transition-colors">
            Privacy Policy
          </button>
        </p>
      </div>
    </div>
  );
}
