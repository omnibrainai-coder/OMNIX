import { forwardRef, InputHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  description?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, checked, ...props }, ref) => {
    return (
      <label className={cn('flex items-start gap-3 cursor-pointer group', className)}>
        <div className="relative mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            className="sr-only"
            checked={checked}
            {...props}
          />
          <motion.div
            initial={false}
            animate={{
              backgroundColor: checked ? '#00D9FF' : 'transparent',
              borderColor: checked ? '#00D9FF' : 'rgba(0, 217, 255, 0.25)',
            }}
            className="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
          >
            {checked && (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-3 h-3 text-shadow-bg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </motion.svg>
            )}
          </motion.div>
        </div>
        <div className="flex-1">
          <span className="text-sm text-white/80 group-hover:text-white transition-colors">
            {label}
          </span>
          {description && (
            <p className="text-xs text-white/40 mt-0.5">{description}</p>
          )}
        </div>
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'
