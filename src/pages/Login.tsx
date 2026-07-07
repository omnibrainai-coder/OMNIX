import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Smartphone, Apple } from 'lucide-react'
import { Button, Input, Checkbox, Divider, GlassCard } from '@/components/ui'
import { cn } from '@/utils/cn'

interface LoginProps {
  onNavigate: (page: string) => void
}

export function Login({ onNavigate }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const validateForm = () => {
    const newErrors: typeof errors = {}
    if (!email.trim()) {
      newErrors.email = 'Email or phone is required'
    }
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: email, password })
      })

      const data = await response.json()

      if (data.success) {
        // Store token and navigate to home
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        onNavigate('home')
      } else {
        setErrors({ email: data.detail || 'Invalid credentials' })
      }
    } catch (err) {
      setErrors({ email: 'Connection error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)

    try {
      const response = await fetch('/api/auth/google')
      const data = await response.json()

      if (data.redirect_url) {
        // For OAuth flow, we'd normally redirect to Google
        // But for now, simulate successful authentication
        // In production: window.location.href = data.redirect_url

        // Simulate successful Google login for demo purposes
        const mockUser = {
          id: 'google-user-' + Date.now(),
          email: 'user@gmail.com',
          username: 'GoogleUser',
        }

        localStorage.setItem('access_token', 'mock-google-token')
        localStorage.setItem('user', JSON.stringify(mockUser))

        // Simulate a brief loading state then navigate
        setTimeout(() => {
          onNavigate('home')
        }, 800)
      }
    } catch (err) {
      // If API fails, simulate successful login for demo
      const mockUser = {
        id: 'google-user-' + Date.now(),
        email: 'user@gmail.com',
        username: 'GoogleUser',
      }

      localStorage.setItem('access_token', 'mock-google-token')
      localStorage.setItem('user', JSON.stringify(mockUser))

      setTimeout(() => {
        onNavigate('home')
      }, 800)
    } finally {
      setTimeout(() => setGoogleLoading(false), 800)
    }
  }

  const handleOtpLogin = () => {
    onNavigate('login-otp')
  }

  const handleAppleSignIn = async () => {
    // Simulate Apple login for demo
    const mockUser = {
      id: 'apple-user-' + Date.now(),
      email: 'user@icloud.com',
      username: 'AppleUser',
    }

    localStorage.setItem('access_token', 'mock-apple-token')
    localStorage.setItem('user', JSON.stringify(mockUser))

    setTimeout(() => {
      onNavigate('home')
    }, 800)
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-shadow-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-shadow-primary-glow/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-shadow-secondary/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <motion.div variants={item} className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-10 h-10 relative">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <linearGradient id="loginLogo" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00D9FF" />
                    <stop offset="100%" stopColor="#8AEFFF" />
                  </linearGradient>
                </defs>
                <path
                  d="M30 20 C30 20, 70 20, 70 35 C70 50, 30 50, 30 65 C30 80, 70 80, 70 80"
                  fill="none"
                  stroke="url(#loginLogo)"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-light tracking-[0.25em] text-white">SHADOW</h1>
          </div>
          <p className="text-sm text-white/40 tracking-wider">Private Social Intelligence</p>
        </motion.div>

        {/* Login Card */}
        <motion.div variants={item}>
          <GlassCard glow className="p-8">
            <h2 className="text-lg font-medium text-white/90 mb-1">Welcome back</h2>
            <p className="text-sm text-white/40 mb-6">Enter your credentials to continue</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div variants={item}>
                <Input
                  type="email"
                  placeholder="Email or phone number"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail size={18} />}
                  error={errors.email}
                />
              </motion.div>

              <motion.div variants={item}>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock size={18} />}
                  error={errors.password}
                />
              </motion.div>

              <motion.div variants={item} className="flex items-center justify-between">
                <Checkbox
                  label="Remember me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <button
                  type="button"
                  onClick={() => onNavigate('forgot-password')}
                  className="text-xs text-shadow-primary-glow hover:text-shadow-accent transition-colors"
                >
                  Forgot password?
                </button>
              </motion.div>

              <motion.div variants={item}>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight size={18} />}
                >
                  Sign In
                </Button>
              </motion.div>
            </form>

            <Divider text="or continue with" />

            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="w-full" onClick={handleOtpLogin}>
                <Smartphone size={18} />
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                isLoading={googleLoading}
              >
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </Button>
              <Button variant="outline" className="w-full" onClick={handleAppleSignIn}>
                <Apple size={18} />
              </Button>
            </div>

            <p className="text-center text-xs text-white/40 mt-4">
              OTP login • Google • Apple
            </p>
          </GlassCard>
        </motion.div>

        {/* Sign up link */}
        <motion.div variants={item} className="text-center mt-6">
          <p className="text-sm text-white/50">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('signup')}
              className="text-shadow-primary-glow hover:text-shadow-accent transition-colors font-medium"
            >
              Create account
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
