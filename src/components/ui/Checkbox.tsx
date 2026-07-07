import { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export function Checkbox({
  label,
  className,
  checked,
  ...props
}: CheckboxProps) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          {...props}
        />
        <div
          className={cn(
            'w-5 h-5 rounded border-2 transition-all duration-200',
            'border-white/20 peer-checked:border-shadow-primary peer-checked:bg-shadow-primary',
            'peer-focus:ring-2 peer-focus:ring-shadow-primary/30',
            className ? String(className) : ''
          )}
        >
          <svg
            className={cn(
              'w-full h-full text-black transition-opacity duration-200',
              checked ? 'opacity-100' : 'opacity-0'
            )}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>
      {label && (
        <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
          {label}
        </span>
      )}
    </label>
  );
}
