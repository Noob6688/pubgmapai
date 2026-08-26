'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Game } from '@/types/database'
import { GameGrid } from '@/components/game/GameGrid'
import { EyeLogo } from '@/components/game/EyeLogo'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import { useTranslation } from '@/i18n'

const PAGE_SIZE = 12

export default function GamesPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [lastCreatedAt, setLastCreatedAt] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const loadGames = useCallback(async (append = false) => {
    const supabase = createClient()

    let query = supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE)

    if (append && lastCreatedAt) {
      query = query.lt('created_at', lastCreatedAt)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to load games:', error)
      return
    }

    if (data) {
      if (append) {
        setGames(prev => [...prev, ...data])
      } else {
        setGames(data)
      }
      setHasMore(data.length === PAGE_SIZE)
      if (data.length > 0) {
        setLastCreatedAt(data[data.length - 1].created_at)
      }
    }
  }, [lastCreatedAt])

  useEffect(() => {
    loadGames(false).finally(() => setLoading(false))
  }, [])

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadGames(true)
    }
  }

  const handleGameClick = (game: Game) => {
    router.push(`/game/${game.id}`)
  }

  return (
    <div className="min-h-screen bg-[#0a0a12] overflow-hidden relative">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0.5; }
          50% { transform: translateY(-20px); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>

      <div className="absolute inset-0">
        <div
          className="absolute w-[800px] h-[800px] rounded-full blur-[150px] opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(0,240,255,0.4) 0%, transparent 70%)',
            left: `${mousePos.x}%`,
            top: `${mousePos.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      <div className="absolute inset-0">
        {mounted && [...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-[2px] h-[2px] bg-cyan-400/50 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${4 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full">
          <defs>
            <pattern id="holo-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00f0ff" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#holo-grid)" />
        </svg>
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-cyan-500/10">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg border border-cyan-500/50 flex items-center justify-center bg-cyan-500/10 cursor-pointer hover:bg-cyan-500/20 transition-colors"
            onClick={() => router.push('/')}
          >
            <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white tracking-wide">
            <span className="text-cyan-400">GAMES</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
        </div>
      </header>

      <main className="relative z-10 px-4 py-12 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block relative mb-4">
              <div className="absolute -inset-4 bg-cyan-500/20 blur-xl rounded-full" />
              <div className="relative mx-auto">
                <EyeLogo size={80} />
              </div>
            </div>

            <p className="text-lg md:text-xl text-cyan-200/70">
              {t('games.title')}
            </p>
          </div>

          <GameGrid
            games={games}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            onGameClick={handleGameClick}
          />
        </div>
      </main>

      <footer className="relative z-10 border-t border-cyan-500/10 py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-cyan-500/40">
          <div className="flex items-center gap-4">
            <span>© 2026 PUBG Tactical Map</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
            <span>Online</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
