'use client'

import { useEffect, useRef } from 'react'
import { Game } from '@/types/database'
import { GameCard } from './GameCard'
import { Loader2 } from 'lucide-react'
import { useTranslation } from '@/i18n'

interface GameGridProps {
  games: Game[]
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
  onGameClick: (game: Game) => void
}

export function GameGrid({ games, loading, hasMore, onLoadMore, onGameClick }: GameGridProps) {
  const { t } = useTranslation()
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore()
        }
      },
      { rootMargin: '200px' }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      observerRef.current?.disconnect()
    }
  }, [hasMore, loading, onLoadMore])

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {games.map((game) => (
          <GameCard key={game.id} game={game} onClick={() => onGameClick(game)} />
        ))}
      </div>

      <div ref={loadMoreRef} className="mt-8 flex justify-center py-4">
        {loading && (
          <div className="flex items-center gap-2 text-cyan-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">{t('games.loading')}</span>
          </div>
        )}
        {!loading && !hasMore && games.length > 0 && (
          <span className="text-sm text-cyan-500/50">{t('games.noMoreGames')}</span>
        )}
        {!loading && games.length === 0 && (
          <span className="text-sm text-cyan-500/50">{t('games.noGames')}</span>
        )}
      </div>
    </div>
  )
}
