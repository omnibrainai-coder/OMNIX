import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glow?: boolean;
}

export function GlassCard({
  children,
  glow,
  className,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'bg-shadow-card/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6',
        'transition-all duration-300',
        glow && 'hover:border-shadow-primary/40 hover:shadow-[0_0_30px_rgba(0,212,255,0.15)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
