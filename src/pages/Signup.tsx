import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Phone, Lock, ArrowRight, ArrowLeft, Check, Shield } from 'lucide-react'
import { Button, Input, Checkbox, Divider, GlassCard, OtpInput } from '@/components/ui'

interface SignupProps {
  onNavigate: (page: string) => void
}

type Step = 'details' | 'otp' | 'success'

export function Signup({ onNavigate }: SignupProps) {
  const [step, setStep] = useState<Step>('details')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptPrivacy: false,
  })
  const [otp, setOtp] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateDetails = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    if (!formData.acceptPrivacy) {
      newErrors.acceptPrivacy = 'You must accept the privacy policy'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = () => {
    if (validateDetails()) {
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
        setStep('otp')
      }, 1000)
    }
  }

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      setErrors({ otp: 'Please enter the complete code' })
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setStep('success')
    }, 1500)
  }

  const handleComplete = () => {
    onNavigate('home')
  }

  const updateForm = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-shadow-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-shadow-primary-glow/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-shadow-secondary/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <motion.div variants={item} className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 relative">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <linearGradient id="signupLogo" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00D9FF" />
                    <stop offset="100%" stopColor="#8AEFFF" />
                  </linearGradient>
                </defs>
                <path
                  d="M30 20 C30 20, 70 20, 70 35 C70 50, 30 50, 30 65 C30 80, 70 80, 70 80"
                  fill="none"
                  stroke="url(#signupLogo)"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-light tracking-[0.2em] text-white">SHADOW</h1>
          </div>
          <p className="text-xs text-white/40 tracking-widest">CREATE ACCOUNT</p>
        </motion.div>

        {/* Progress indicator */}
        <motion.div variants={item} className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                  transition-all duration-300
                  ${step === 'details' && s === 1
                    ? 'bg-shadow-primary-glow text-shadow-bg'
                    : step === 'otp' && s === 2
                    ? 'bg-shadow-primary-glow text-shadow-bg'
                    : step === 'success' && s === 3
                    ? 'bg-shadow-primary-glow text-shadow-bg'
                    : 'bg-shadow-card text-white/40 border border-shadow-border-strong'
                  }
                `}
              >
                {((step === 'otp' && s === 1) || (step === 'success' && s <= 2)) ? (
                  <Check size={14} />
                ) : (
                  s
                )}
              </div>
              {i < 2 && (
                <div className={`
                  w-10 h-0.5 transition-all duration-300
                  ${(step === 'otp' && i === 0) || (step === 'success' && i < 2)
                    ? 'bg-shadow-primary-glow'
                    : 'bg-shadow-border-strong'
                  }
                `} />
              )}
            </div>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 1: Details */}
          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <GlassCard glow className="p-6">
                <form className="space-y-4">
                  <motion.div variants={item}>
                    <Input
                      placeholder="Username"
                      value={formData.username}
                      onChange={(e) => updateForm('username', e.target.value)}
                      icon={<User size={18} />}
                      error={errors.username}
                    />
                  </motion.div>

                  <motion.div variants={item}>
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={(e) => updateForm('email', e.target.value)}
                      icon={<Mail size={18} />}
                      error={errors.email}
                    />
                  </motion.div>

                  <motion.div variants={item}>
                    <Input
                      type="tel"
                      placeholder="Phone number"
                      value={formData.phone}
                      onChange={(e) => updateForm('phone', e.target.value)}
                      icon={<Phone size={18} />}
                      error={errors.phone}
                    />
                  </motion.div>

                  <motion.div variants={item}>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => updateForm('password', e.target.value)}
                      icon={<Lock size={18} />}
                      error={errors.password}
                    />
                  </motion.div>

                  <motion.div variants={item}>
                    <Input
                      type="password"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateForm('confirmPassword', e.target.value)}
                      icon={<Lock size={18} />}
                      error={errors.confirmPassword}
                    />
                  </motion.div>

                  <motion.div variants={item}>
                    <Checkbox
                      label="I accept the Privacy Policy and Terms of Service"
                      checked={formData.acceptPrivacy}
                      onChange={(e) => updateForm('acceptPrivacy', e.target.checked)}
                    />
                    {errors.acceptPrivacy && (
                      <p className="text-red-400 text-xs mt-1">{errors.acceptPrivacy}</p>
                    )}
                  </motion.div>

                  <motion.div variants={item}>
                    <Button
                      type="button"
                      className="w-full"
                      size="lg"
                      isLoading={isLoading}
                      onClick={handleContinue}
                      rightIcon={<ArrowRight size={18} />}
                    >
                      Continue
                    </Button>
                  </motion.div>
                </form>
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
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-shadow-primary-glow/10 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-shadow-primary-glow" />
                </div>

                <h3 className="text-lg font-medium text-white mb-2">Verify your account</h3>
                <p className="text-sm text-white/40 mb-6">
                  We've sent a verification code to<br />
                  <span className="text-white/60">{formData.email}</span>
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
                  Verify & Create Account
                </Button>

                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="flex items-center gap-1 text-xs text-white/40 hover:text-white/60 mx-auto transition-colors"
                >
                  <ArrowLeft size={14} />
                  Go back
                </button>

                <p className="text-xs text-white/30 mt-4">
                  Didn't receive the code?{' '}
                  <button className="text-shadow-primary-glow hover:text-shadow-accent transition-colors">
                    Resend
                  </button>
                </p>
              </GlassCard>
            </motion.div>
          )}

          {/* Step 3: Success */}
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

                <h3 className="text-xl font-medium text-white mb-2">Account Created!</h3>
                <p className="text-sm text-white/50 mb-8">
                  Welcome to SHADOW, {formData.username}.<br />
                  Your private social journey begins now.
                </p>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleComplete}
                  rightIcon={<ArrowRight size={18} />}
                >
                  Enter SHADOW
                </Button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login link */}
        {step === 'details' && (
          <motion.div variants={item} className="text-center mt-6">
            <p className="text-sm text-white/50">
              Already have an account?{' '}
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
