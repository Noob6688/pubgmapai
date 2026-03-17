'use client'

import { useState, useEffect } from 'react'
import { getPhase, startWormholeTransition, endWormholeTransition } from '@/lib/wormhole'
import { useTranslation } from '@/i18n'

export { startWormholeTransition, endWormholeTransition } from '@/lib/wormhole'

export default function BlackHoleLoading() {
  const { t } = useTranslation()
  const [phase, setPhase] = useState<'idle' | 'entering' | 'exiting'>('idle')

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(getPhase())
    }, 100)
    return () => clearInterval(interval)
  }, [])

  if (phase === 'idle') return null

  const showEnteringAnimation = phase === 'entering'

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden">
      <style jsx global>{`
        @keyframes shoot-out-0 { 0% { transform: rotate(0deg) translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: rotate(0deg) translateY(-120px); opacity: 0; } }
        @keyframes shoot-out-30 { 0% { transform: rotate(30deg) translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: rotate(30deg) translateY(-150px); opacity: 0; } }
        @keyframes shoot-out-60 { 0% { transform: rotate(60deg) translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: rotate(60deg) translateY(-100px); opacity: 0; } }
        @keyframes shoot-out-90 { 0% { transform: rotate(90deg) translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: rotate(90deg) translateY(-180px); opacity: 0; } }
        @keyframes shoot-out-120 { 0% { transform: rotate(120deg) translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: rotate(120deg) translateY(-130px); opacity: 0; } }
        @keyframes shoot-out-150 { 0% { transform: rotate(150deg) translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: rotate(150deg) translateY(-160px); opacity: 0; } }
        @keyframes shoot-out-180 { 0% { transform: rotate(180deg) translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: rotate(180deg) translateY(-120px); opacity: 0; } }
        @keyframes shoot-out-210 { 0% { transform: rotate(210deg) translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: rotate(210deg) translateY(-170px); opacity: 0; } }
        @keyframes shoot-out-240 { 0% { transform: rotate(240deg) translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: rotate(240deg) translateY(-140px); opacity: 0; } }
        @keyframes shoot-out-270 { 0% { transform: rotate(270deg) translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: rotate(270deg) translateY(-190px); opacity: 0; } }
        @keyframes shoot-out-300 { 0% { transform: rotate(300deg) translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: rotate(300deg) translateY(-110px); opacity: 0; } }
        @keyframes shoot-out-330 { 0% { transform: rotate(330deg) translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: rotate(330deg) translateY(-160px); opacity: 0; } }
        @keyframes pulse-ring { 0%, 100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.1); opacity: 0.6; } }
        @keyframes fade-in-out { 0%, 100% { opacity: 0; } 20%, 80% { opacity: 1; } }
        @keyframes center-expand { 
          0% { transform: scale(0.5); opacity: 1; }
          40% { transform: scale(0.3); opacity: 0.5; }
          100% { transform: scale(80); opacity: 0; }
        }
        .line-0 { animation: shoot-out-0 0.8s ease-out infinite; }
        .line-1 { animation: shoot-out-30 0.9s ease-out infinite; animation-delay: 0.1s; }
        .line-2 { animation: shoot-out-60 0.7s ease-out infinite; animation-delay: 0.2s; }
        .line-3 { animation: shoot-out-90 1s ease-out infinite; animation-delay: 0.3s; }
        .line-4 { animation: shoot-out-120 0.85s ease-out infinite; animation-delay: 0.15s; }
        .line-5 { animation: shoot-out-150 0.75s ease-out infinite; animation-delay: 0.25s; }
        .line-6 { animation: shoot-out-180 0.95s ease-out infinite; animation-delay: 0.05s; }
        .line-7 { animation: shoot-out-210 0.8s ease-out infinite; animation-delay: 0.35s; }
        .line-8 { animation: shoot-out-240 0.9s ease-out infinite; animation-delay: 0.12s; }
        .line-9 { animation: shoot-out-270 0.85s ease-out infinite; animation-delay: 0.22s; }
        .line-10 { animation: shoot-out-300 0.8s ease-out infinite; animation-delay: 0.18s; }
        .line-11 { animation: shoot-out-330 0.95s ease-out infinite; animation-delay: 0.28s; }
        .pulse-ring { animation: pulse-ring 2s ease-in-out infinite; }
        .loading-text { animation: fade-in-out 1.5s ease-in-out infinite; }
        .exit-animation { animation: center-expand 1.2s ease-out forwards; }
      `}</style>

      <div 
        className={`relative ${phase === 'exiting' ? 'exit-animation' : ''}`}
        style={{ transform: 'scale(2.5)' }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-black border border-cyan-500/60 shadow-[0_0_20px_rgba(0,240,255,0.5)]" />
        </div>
        
        {showEnteringAnimation && (
          <>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 rounded-full bg-cyan-500/5 blur-xl" />
            </div>

            <div className="relative w-40 h-40 flex items-center justify-center">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className={`line-${i} absolute left-1/2 top-1/2 h-1 origin-left bg-gradient-to-t from-cyan-400 to-transparent`}
                  style={{
                    width: '3px',
                    transformOrigin: 'left center',
                  }}
                />
              ))}
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="pulse-ring w-40 h-40 rounded-full border border-cyan-500/30" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="pulse-ring w-28 h-28 rounded-full border border-cyan-400/40" style={{ animationDelay: '0.3s' }} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="pulse-ring w-16 h-16 rounded-full border border-cyan-300/50" style={{ animationDelay: '0.6s' }} />
            </div>
          </>
        )}
      </div>

      <div className="absolute bottom-32">
        <p className="loading-text text-cyan-400 text-xl font-mono tracking-widest">
          {phase === 'exiting' ? t('blackHole.exiting') : t('blackHole.entering')}
        </p>
      </div>
    </div>
  )
}
