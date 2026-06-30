import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/utils/cn'

interface GlassCardProps extends HTMLMotionProps<'div'> {
  glow?: boolean
  hover?: boolean
}

export function GlassCard({ className, glow, hover, children, ...props }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'relative bg-shadow-card/80 backdrop-blur-xl border rounded-2xl p-6',
        'border-shadow-border overflow-hidden',
        glow && 'shadow-glow-sm',
        hover && 'hover:border-shadow-border-strong hover:shadow-card-hover transition-all duration-300',
        className
      )}
      {...props}
    >
      {glow && (
        <div className="absolute inset-0 bg-glow-radial opacity-50 pointer-events-none" />
      )}
      {children}
    </motion.div>
  )
}
