'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Loader2 className={cn('animate-spin', sizeMap[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
}

export function LoadingOverlay({ isLoading, children, text }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
          <LoadingSpinner size="lg" text={text} />
        </div>
      )}
    </div>
  );
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-6 space-y-4', className)}>
      <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
      <div className="space-y-2">
        <div className="h-8 w-2/3 bg-muted animate-pulse rounded" />
        <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}

interface ChartSkeletonProps {
  className?: string;
  height?: string;
}

export function ChartSkeleton({ className, height = 'h-80' }: ChartSkeletonProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-6 w-6 bg-muted animate-pulse rounded" />
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
      </div>
      <div className={cn('relative', height)}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-3 w-10 bg-muted animate-pulse rounded" />
          ))}
        </div>
        {/* Chart area */}
        <div className="ml-14 h-full flex items-end gap-1 pb-8">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className="flex-1 bg-muted animate-pulse rounded-t"
              style={{ 
                height: `${30 + Math.random() * 60}%`,
                animationDelay: `${i * 100}ms`
              }}
            />
          ))}
        </div>
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-14 right-0 flex justify-between">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-3 w-8 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PieChartSkeleton({ className, height = 'h-80' }: ChartSkeletonProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-6 w-6 bg-muted animate-pulse rounded" />
        <div className="h-6 w-28 bg-muted animate-pulse rounded" />
      </div>
      <div className={cn('flex items-center justify-center', height)}>
        <div className="relative">
          <div className="w-40 h-40 rounded-full bg-muted animate-pulse" />
          <div className="absolute inset-8 rounded-full bg-card" />
        </div>
      </div>
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-muted animate-pulse" />
          <div className="h-3 w-16 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-muted animate-pulse" />
          <div className="h-3 w-20 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card/50 backdrop-blur p-6', className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="h-5 w-24 bg-muted animate-pulse rounded" />
        <div className="h-6 w-6 bg-muted animate-pulse rounded" />
      </div>
      <div className="h-10 w-32 bg-muted animate-pulse rounded mb-1" />
      <div className="h-4 w-20 bg-muted animate-pulse rounded" />
    </div>
  );
}
