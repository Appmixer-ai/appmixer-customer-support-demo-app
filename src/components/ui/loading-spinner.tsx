import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

/**
 * Reusable loading spinner component
 * Replaces inline loading state implementations
 *
 * @example
 * {isLoading ? (
 *   <LoadingSpinner size="md" label="Loading tickets..." />
 * ) : (
 *   <Content />
 * )}
 */
export function LoadingSpinner({ size = 'md', className, label }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}

/**
 * Full-screen centered loading spinner
 */
export function LoadingSpinnerFullScreen({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full">
      <LoadingSpinner size="lg" label={label} />
    </div>
  );
}

/**
 * Inline loading spinner for buttons
 */
export function LoadingSpinnerInline({ className }: { className?: string }) {
  return <Loader2 className={cn('animate-spin w-4 h-4', className)} />;
}
