'use client'

import Image from 'next/image'
import { Game } from '@/types/database'
import { cn } from '@/lib/utils'

interface GameCardProps {
  game: Game
  onClick?: () => void
}

export function GameCard({ game, onClick }: GameCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-lg border cursor-pointer',
        'transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
        'border-cyan-500/30 hover:border-cyan-400/50',
        'bg-slate-900/50 hover:bg-slate-900/80',
        'backdrop-blur-sm'
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-800/50">
        {game.thumb ? (
          <Image
            src={game.thumb}
            alt={game.title}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <svg
              className="h-12 w-12 text-cyan-400/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
      </div>
      <div className="p-3">
        <h3 className="truncate text-sm font-medium text-cyan-100 group-hover:text-cyan-300">
          {game.title}
        </h3>
        {game.description && (
          <p className="mt-1 line-clamp-2 text-xs text-cyan-200/50">
            {game.description}
          </p>
        )}
      </div>
    </div>
  )
}
