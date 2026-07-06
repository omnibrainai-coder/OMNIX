import { cn } from '@/utils/cn';

interface DividerProps {
  text?: string;
  className?: string;
}

export function Divider({ text, className }: DividerProps) {
  if (text) {
    return (
      <div className={cn('flex items-center gap-4 my-4', className)}>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <span className="text-xs text-white/40 uppercase tracking-widest whitespace-nowrap">
          {text}
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4',
        className
      )}
    />
  );
}
