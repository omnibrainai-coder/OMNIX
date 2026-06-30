import { useState, useRef, ChangeEvent, KeyboardEvent } from 'react'
import { cn } from '@/utils/cn'

interface OtpInputProps {
  length?: number
  value?: string
  onChange: (value: string) => void
  error?: string
}

export function OtpInput({ length = 6, value = '', onChange, error }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '').slice(-1)
    const otpArray = value.split('')
    otpArray[index] = newValue
    const newOtp = otpArray.join('').slice(0, length)
    onChange(newOtp)

    if (newValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    onChange(pastedData)
    inputRefs.current[Math.min(pastedData.length, length - 1)]?.focus()
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2 justify-center">
        {Array.from({ length }).map((_, index) => (
          <div key={index} className="relative">
            <input
              ref={(el) => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={value[index] || ''}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              onPaste={handlePaste}
              className={cn(
                'w-12 h-14 text-center text-xl font-mono font-semibold',
                'bg-shadow-bg/50 border rounded-xl',
                'text-white placeholder:text-white/20',
                'focus:outline-none transition-all duration-200',
                value[index]
                  ? 'border-shadow-primary-glow bg-shadow-primary-glow/5'
                  : 'border-shadow-border-strong hover:border-shadow-border-glow',
                focusedIndex === index && 'ring-1 ring-shadow-primary-glow/30 border-shadow-primary-glow',
                error && 'border-red-500/50'
              )}
            />
          </div>
        ))}
      </div>
      {error && <p className="text-red-400 text-xs text-center">{error}</p>}
    </div>
  )
}
