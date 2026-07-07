import { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  error?: string;
}

export function Input({
  icon,
  error,
  className,
  ...props
}: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
          {icon}
        </div>
      )}
      <input
        className={cn(
          'w-full h-14 px-4 bg-shadow-input border rounded-xl text-white',
          'placeholder:text-white/30 outline-none transition-all duration-200',
          'focus:border-shadow-primary focus:shadow-[0_0_0_3px_rgba(0,212,255,0.15)]',
          error ? 'border-red-500' : 'border-white/10',
          icon ? 'pl-12' : '',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
