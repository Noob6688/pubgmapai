'use client'

import { useEffect, useState } from 'react'
import HolographicMapCard from '@/components/home/HolographicMapCard'
import { useTranslation } from '@/i18n'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'

const MAPS = [
  {
    name: '艾伦格',
    slug: 'Erangel',
    secretCount: 15,
  },
  {
    name: '泰戈',
    slug: 'Taego',
    secretCount: 12,
  },
  {
    name: '荣都',
    slug: 'Rondo',
    secretCount: 4,
  },
]

export default function HomePage() {
  const { t } = useTranslation()
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

  const version = t('common.version')

  return (
    <div className="min-h-screen bg-[#0a0a12] overflow-hidden relative">
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
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
          <div className="w-10 h-10 rounded-lg border border-cyan-500/50 flex items-center justify-center bg-cyan-500/10">
            <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white tracking-wide">
            PUBG <span className="text-cyan-400">TACTICAL</span> MAP
          </span>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <div className="px-3 py-1 rounded border border-cyan-500/30 bg-cyan-500/5">
            <span className="text-xs font-mono text-cyan-400">{version}</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-4 py-12 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block relative mb-4">
              <div className="absolute -inset-4 bg-cyan-500/20 blur-xl rounded-full" />
              <div className="relative">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-cyan-500/10 overflow-hidden">
                  <img src="https://r2.pubgmaptile.top/public/logo.png" alt="Logo" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-cyan-500 bg-clip-text text-transparent">
                {t('home.title')}
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-cyan-200/70 mb-2">
              {t('home.subtitle')}
            </p>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-sm text-cyan-300/80">{t('home.seasonInfo')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {MAPS.map((map, index) => (
              <div
                key={map.slug}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <HolographicMapCard
                  name={t(`home.maps.${map.slug}`)}
                  slug={map.slug}
                  secretCount={map.secretCount}
                />
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#0a0a12]/80 border border-cyan-500/20 backdrop-blur-sm">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm text-cyan-300/70">
                {t('home.clickToEnter')}
              </span>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-cyan-500/10 py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-cyan-500/40">
          <div className="flex items-center gap-4">
            <span>© 2026 PUBG Tactical Map</span>
            <span className="hidden md:inline">|</span>
            <span className="hidden md:inline">{t('common.dataUpdated')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
            <span>{t('common.systemOnline')}</span>
          </div>
        </div>
      </footer>

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
    </div>
  )
}
