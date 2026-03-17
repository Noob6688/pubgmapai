'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface HolographicMapCardProps {
  name: string
  slug: string
  secretCount: number
  tileUrl: string
}

export default function HolographicMapCard({ name, slug, secretCount, tileUrl }: HolographicMapCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const rotateX = ((y - centerY) / centerY) * -10
    const rotateY = ((x - centerX) / centerX) * 10
    
    setRotateX(rotateX)
    setRotateY(rotateY)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
    setIsHovered(false)
  }

  return (
    <div className="group relative perspective-1000">
      <div
        ref={cardRef}
        className="relative w-full aspect-[4/3] cursor-pointer transition-all duration-300 ease-out"
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        <Link href={`/map/${slug}`} className="block w-full h-full">
          <div className="relative w-full h-full overflow-hidden rounded-xl bg-[#0a0a12]/80 backdrop-blur-sm border border-cyan-500/30 transition-all duration-300 group-hover:border-cyan-400/60 group-hover:shadow-[0_0_30px_rgba(0,240,255,0.3)]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
            
            <div className="absolute inset-0 scanline opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan" />
            
            <div className="absolute inset-0 overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-80 transition-opacity duration-300 scale-105 group-hover:scale-110"
                style={{ backgroundImage: `url(${tileUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a12] via-transparent to-transparent" />
            </div>
            
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#00f0ff]" />
              <span className="text-xs font-mono text-cyan-400/80 uppercase tracking-wider">Online</span>
            </div>
            
            <div className="absolute top-3 right-3">
              <div className="px-2 py-1 rounded bg-cyan-500/20 border border-cyan-500/40">
                <span className="text-xs font-mono text-cyan-300">SECRET: {secretCount}</span>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors duration-300 flex items-center gap-2">
                <span className="w-1 h-5 bg-cyan-500 rounded-full" />
                {name}
              </h3>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-cyan-400/60 font-mono">TACTICAL MAP</span>
                <div className="w-8 h-8 rounded-full border border-cyan-500/50 flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:border-cyan-400 transition-all duration-300">
                  <svg className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-500/10 rotate-45 transform translate-x-16 -translate-y-16" />
            </div>
            <div className="absolute bottom-0 left-0 w-20 h-20 overflow-hidden">
              <div className="absolute bottom-0 left-0 w-28 h-28 bg-cyan-500/10 rotate-45 transform -translate-x-16 translate-y-16" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
