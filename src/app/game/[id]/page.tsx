'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Game } from '@/types/database'
import { GamePlayer } from '@/components/game/GamePlayer'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Gamepad2, Info, Loader2 } from 'lucide-react'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import { useTranslation } from '@/i18n'

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useTranslation()
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadGame = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) {
        setError(t('games.gameNotFound'))
      } else {
        setGame(data)
      }
      setLoading(false)
    }

    if (params.id) {
      loadGame()
    }
  }, [params.id, t])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>{t('games.loading')}</span>
        </div>
      </div>
    )
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 rounded-full border border-cyan-500/50 flex items-center justify-center bg-cyan-500/10">
          <Gamepad2 className="h-8 w-8 text-cyan-400" />
        </div>
        <p className="text-cyan-100 text-lg">{error || t('games.gameNotFound')}</p>
        <Button
          onClick={() => router.push('/games')}
          className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('games.backToList')}
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a12] relative overflow-hidden">
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
            onClick={() => router.push('/games')}
          >
            <ArrowLeft className="h-5 w-5 text-cyan-400" />
          </div>
          <span className="text-lg font-bold text-white tracking-wide">
            <span className="text-cyan-400">GAMES</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
        </div>
      </header>

      <main className="relative z-10 px-4 py-8 md:px-8 lg:px-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-cyan-500 bg-clip-text text-transparent">
                {game.title}
              </span>
            </h1>
            {game.description && (
              <p className="text-cyan-200/50 text-sm">{game.description}</p>
            )}
          </div>

          <div className="mb-8 rounded-lg overflow-hidden border border-cyan-500/30 bg-slate-900/50">
            <GamePlayer game={game} />
          </div>

          {game.description && (
            <div className="bg-slate-900/50 rounded-lg p-6 border border-cyan-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-cyan-400" />
                <h2 className="text-sm font-medium text-cyan-300">{t('games.gameIntro')}</h2>
              </div>
              <p className="text-cyan-200/70 text-sm leading-relaxed">
                {game.description}
              </p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Button
              onClick={() => router.push('/games')}
              className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('games.backToList')}
            </Button>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-cyan-500/10 py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-cyan-500/40">
          <span>© 2026 PUBG Tactical Map</span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
            <span>{t('home.online')}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
