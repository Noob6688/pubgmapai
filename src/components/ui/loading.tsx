'use client'

import { cn } from '@/lib/utils'

interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

export function TableSkeleton({ rows = 5, columns = 5, className }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={`row-${rowIndex}`} className="border-b">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={`cell-${rowIndex}-${colIndex}`} className="p-4">
              <div
                className={cn(
                  'h-4 animate-pulse rounded bg-slate-100',
                  colIndex === 0 ? 'w-32' : colIndex === columns - 1 ? 'w-12' : 'w-24'
                )}
                style={{
                  animationDelay: `${(rowIndex * columns + colIndex) * 50}ms`,
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

interface CardSkeletonProps {
  className?: string
}

export function CardSkeleton({ className }: CardSkeletonProps) {
  return (
    <div className={cn('rounded-lg border p-6', className)}>
      <div className="space-y-3">
        <div className="h-6 w-1/3 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
        <div className="space-y-2 pt-2">
          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    </div>
  )
}

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-slate-200 border-t-primary',
          sizeClasses[size]
        )}
      />
    </div>
  )
}

interface PageLoaderProps {
  text?: string
}

export function PageLoader({ text = '加载中...' }: PageLoaderProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-200">
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500" />
        </div>
        <div className="absolute inset-2 animate-spin rounded-full border-4 border-slate-200">
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-yellow-500" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
        <div className="absolute inset-4 animate-spin rounded-full border-4 border-slate-200">
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-500" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }} />
        </div>
      </div>
      <p className="text-sm font-medium text-muted-foreground animate-pulse">{text}</p>
    </div>
  )
}

interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border bg-card p-6 shadow-sm',
        className
      )}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-4/6 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    </div>
  )
}
