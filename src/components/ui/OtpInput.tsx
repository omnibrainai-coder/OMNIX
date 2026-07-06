import { useState, useRef, KeyboardEvent } from 'react';
import { cn } from '@/utils/cn';

interface OtpInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
  className?: string;
}

export function OtpInput({
  length = 6,
  onComplete,
  className,
}: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== '')) {
      onComplete?.(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const newOtp = [...otp];
    pastedData.split('').forEach((char, i) => {
      if (i < length) newOtp[i] = char;
    });
    setOtp(newOtp);
    if (newOtp.every((digit) => digit !== '')) {
      onComplete?.(newOtp.join(''));
    }
  };

  return (
    <div className={cn('flex gap-3 justify-center', className)} onPaste={handlePaste}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className={cn(
            'w-12 h-14 text-center text-xl font-mono font-bold',
            'bg-shadow-input border-2 rounded-xl text-white',
            'outline-none transition-all duration-200',
            'focus:border-shadow-primary focus:shadow-[0_0_20px_rgba(0,212,255,0.2)]',
            digit ? 'border-shadow-primary' : 'border-white/10'
          )}
        />
      ))}
    </div>
  );
}
