'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Map, Crosshair, Target, Compass } from 'lucide-react'

export default function HomePage() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-[#151922] overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-900/20 via-[#151922] to-[#151922]" />
      
      <div 
        className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(249,115,22,0.4) 0%, transparent 70%)',
          left: `${mousePos.x}%`,
          top: `${mousePos.y}%`,
          transform: 'translate(-50%, -50%)',
          transition: 'left 0.3s ease-out, top 0.3s ease-out',
        }}
      />

      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-orange-500/50 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#f97316" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="absolute top-8 left-8 flex items-center gap-2 text-orange-500/60">
          <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '10s' }} />
          <span className="text-sm font-mono tracking-widest">PUBG MAP</span>
        </div>

        <div className="absolute top-8 right-8 flex gap-4 text-orange-500/40 text-xs font-mono">
          <span>LAT: {mousePos.y.toFixed(2)}</span>
          <span>LNG: {mousePos.x.toFixed(2)}</span>
        </div>

        <div className="relative mb-8">
          <div className="absolute -inset-4 bg-orange-500/20 blur-xl rounded-full animate-pulse" />
          <div className="absolute -inset-8 bg-orange-500/10 blur-2xl rounded-full" />
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 border-2 border-orange-500/30 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute inset-4 border border-orange-500/50 rounded-full" />
            <Target className="w-16 h-16 text-orange-500 relative z-10" />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-center mb-4 relative">
          <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
            PUBG 地图
          </span>
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-amber-500/20 blur-xl -z-10" />
        </h1>

        <p className="text-xl md:text-2xl text-orange-200/80 mb-2 text-center">
          精准定位 战术制胜
        </p>
        <p className="text-sm text-orange-400/60 mb-12 text-center max-w-md">
          实时战术地图 | 标记点位追踪 | 战术路线规划
        </p>

        <Link href="/map">
          <button className="group relative px-12 py-4 bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(249,115,22,0.5)]">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-3">
              <Map className="w-5 h-5" />
              <span className="text-lg font-semibold">进入地图</span>
              <Crosshair className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            </div>
          </button>
        </Link>

        <div className="mt-16 flex gap-8 text-orange-500/40">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 border border-orange-500/30 rounded flex items-center justify-center">
              <Crosshair className="w-6 h-6" />
            </div>
            <span className="text-xs">精准标记</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 border border-orange-500/30 rounded flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <span className="text-xs">实时追踪</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 border border-orange-500/30 rounded flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <span className="text-xs">战术规划</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#151922] to-transparent" />
    </div>
  )
}