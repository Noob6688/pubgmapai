'use client'

import { Game } from '@/types/database'

interface GamePlayerProps {
  game: Game
}

export function GamePlayer({ game }: GamePlayerProps) {
  return (
    <div
      className="relative overflow-hidden rounded-lg"
      style={{
        backgroundColor: game.color || '#3f007e',
        aspectRatio: parseInt(game.width) / parseInt(game.height) || '16/9',
      }}
    >
      <iframe
        src={game.url}
        title={game.title}
        width={game.width || '100%'}
        height={game.height || '480px'}
        frameBorder="0"
        allowFullScreen
        allow="autoplay; fullscreen"
        className="absolute left-0 top-0 h-full w-full"
        style={{
          aspectRatio: parseInt(game.width) / parseInt(game.height) || '16/9',
        }}
      />
    </div>
  )
}
