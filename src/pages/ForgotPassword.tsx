import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, ArrowRight, ArrowLeft, Check, Key } from 'lucide-react'
import { Button, Input, GlassCard, OtpInput } from '@/components/ui'

interface ForgotPasswordProps {
  onNavigate: (page: string) => void
}

type Step = 'email' | 'otp' | 'reset' | 'success'

export function ForgotPassword({ onNavigate }: ForgotPasswordProps) {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateEmail = () => {
    if (!email.trim()) {
      setErrors({ email: 'Email is required' })
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Please enter a valid email' })
      return false
    }
    setErrors({})
    return true
  }

  const validateOtp = () => {
    if (otp.length !== 6) {
      setErrors({ otp: 'Please enter the complete code' })
      return false
    }
    setErrors({})
    return true
  }

  const validatePassword = () => {
    const newErrors: Record<string, string> = {}
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSendOtp = () => {
    if (!validateEmail()) return
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setStep('otp')
    }, 1500)
  }

  const handleVerifyOtp = () => {
    if (!validateOtp()) return
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setStep('reset')
    }, 1500)
  }

  const handleResetPassword = () => {
    if (!validatePassword()) return
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setStep('success')
    }, 1500)
  }

  const handleComplete = () => {
    onNavigate('login')
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  const stepTitles = {
    email: 'Reset Password',
    otp: 'Verify Identity',
    reset: 'New Password',
    success: 'Success',
  }

  return (
    <div className="min-h-screen bg-shadow-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-shadow-primary-glow/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-shadow-secondary/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <motion.div variants={item} className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 relative">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <linearGradient id="forgotLogo" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00D9FF" />
                    <stop offset="100%" stopColor="#8AEFFF" />
                  </linearGradient>
                </defs>
                <path
                  d="M30 20 C30 20, 70 20, 70 35 C70 50, 30 50, 30 65 C30 80, 70 80, 70 80"
                  fill="none"
                  stroke="url(#forgotLogo)"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-light tracking-[0.2em] text-white">SHADOW</h1>
          </div>
          <p className="text-xs text-white/40 tracking-widest">{stepTitles[step]}</p>
        </motion.div>

        {/* Progress steps */}
        <motion.div variants={item} className="flex items-center justify-center gap-1 mb-6">
          {['email', 'otp', 'reset', 'success'].map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div
                className={`
                  w-6 h-0.5 transition-all duration-300
                  ${['email', 'otp', 'reset', 'success'].indexOf(step) >= i
                    ? 'bg-shadow-primary-glow'
                    : 'bg-shadow-border-strong'
                  }
                `}
              />
            </div>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 1: Email */}
          {step === 'email' && (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <GlassCard glow className="p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-shadow-primary-glow/10 flex items-center justify-center">
                  <Key className="w-7 h-7 text-shadow-primary-glow" />
                </div>

                <h3 className="text-lg font-medium text-white mb-2">Forgot your password?</h3>
                <p className="text-sm text-white/40 mb-6">
                  Enter your email address and we'll send you a code to reset your password.
                </p>

                <div className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) setErrors({})
                    }}
                    icon={<Mail size={18} />}
                    error={errors.email}
                  />

                  <Button
                    className="w-full"
                    size="lg"
                    isLoading={isLoading}
                    onClick={handleSendOtp}
                    rightIcon={<ArrowRight size={18} />}
                  >
                    Send Verification Code
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <GlassCard glow className="p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-shadow-primary-glow/10 flex items-center justify-center">
                  <Lock className="w-7 h-7 text-shadow-primary-glow" />
                </div>

                <h3 className="text-lg font-medium text-white mb-2">Verify your identity</h3>
                <p className="text-sm text-white/40 mb-6">
                  We've sent a verification code to<br />
                  <span className="text-white/60">{email}</span>
                </p>

                <div className="mb-6">
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    error={errors.otp}
                  />
                </div>

                <Button
                  className="w-full mb-4"
                  size="lg"
                  isLoading={isLoading}
                  onClick={handleVerifyOtp}
                >
                  Verify Code
                </Button>

                <div className="flex items-center justify-between text-xs text-white/40">
                  <button
                    onClick={() => setStep('email')}
                    className="flex items-center gap-1 hover:text-white/60 transition-colors"
                  >
                    <ArrowLeft size={14} />
                    Change email
                  </button>
                  <button className="text-shadow-primary-glow hover:text-shadow-accent transition-colors">
                    Resend code
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Step 3: Reset Password */}
          {step === 'reset' && (
            <motion.div
              key="reset"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <GlassCard glow className="p-6">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-shadow-primary-glow/10 flex items-center justify-center">
                    <Lock className="w-7 h-7 text-shadow-primary-glow" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Create new password</h3>
                  <p className="text-sm text-white/40">
                    Your identity has been verified. Enter a new secure password.
                  </p>
                </div>

                <div className="space-y-4">
                  <Input
                    type="password"
                    placeholder="New password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errors.password) setErrors(prev => ({ ...prev, password: '' }))
                    }}
                    icon={<Lock size={18} />}
                    error={errors.password}
                  />

                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }))
                    }}
                    icon={<Lock size={18} />}
                    error={errors.confirmPassword}
                  />

                  <Button
                    className="w-full"
                    size="lg"
                    isLoading={isLoading}
                    onClick={handleResetPassword}
                    rightIcon={<ArrowRight size={18} />}
                  >
                    Reset Password
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <GlassCard glow className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-shadow-primary-glow/20 flex items-center justify-center"
                >
                  <Check size={40} className="text-shadow-primary-glow" />
                </motion.div>

                <h3 className="text-xl font-medium text-white mb-2">Password Reset!</h3>
                <p className="text-sm text-white/50 mb-8">
                  Your password has been successfully reset.<br />
                  You can now sign in with your new password.
                </p>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleComplete}
                  rightIcon={<ArrowRight size={18} />}
                >
                  Back to Sign In
                </Button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login link */}
        {step !== 'success' && (
          <motion.div variants={item} className="text-center mt-6">
            <p className="text-sm text-white/50">
              Remember your password?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-shadow-primary-glow hover:text-shadow-accent transition-colors font-medium"
              >
                Sign in
              </button>
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
