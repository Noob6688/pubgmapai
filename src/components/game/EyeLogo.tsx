'use client'

import { useEffect, useRef, useState } from 'react'

interface EyeLogoProps {
  size?: number
}

export function EyeLogo({ size = 80 }: EyeLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const dx = e.clientX - centerX
      const dy = e.clientY - centerY

      const maxMove = size * 0.12
      const distance = Math.sqrt(dx * dx + dy * dy)
      const angle = Math.atan2(dy, dx)

      const clampedDistance = Math.min(distance, maxMove * 6)
      const moveRatio = maxMove / (maxMove * 6)
      const actualDistance = Math.min(clampedDistance, maxMove)

      const offsetX = Math.cos(angle) * actualDistance
      const offsetY = Math.sin(angle) * actualDistance

      setPupilPos({ x: offsetX, y: offsetY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [size])

  const cx = size / 2
  const cy = size / 2
  const eyeRadiusX = size * 0.42
  const eyeRadiusY = size * 0.28
  const irisRadius = size * 0.16
  const pupilRadius = size * 0.08
  const highlightRadius = size * 0.035

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        <defs>
          <radialGradient id={`eyelidGlow-${size}`} cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="#06b6d4" stopOpacity="0" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.25" />
          </radialGradient>
          <radialGradient id={`irisGradient-${size}`} cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="60%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#155e75" />
          </radialGradient>
          <radialGradient id={`pupilGradient-${size}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0a0a12" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
          <clipPath id={`eyeClip-${size}`}>
            <ellipse
              cx={cx}
              cy={cy}
              rx={eyeRadiusX}
              ry={eyeRadiusY}
            />
          </clipPath>
        </defs>

        <ellipse
          cx={cx}
          cy={cy}
          rx={eyeRadiusX}
          ry={eyeRadiusY}
          fill="#0a0a12"
          stroke="#06b6d4"
          strokeWidth="2"
          strokeOpacity="0.7"
        />

        <g clipPath={`url(#eyeClip-${size})`}>
          <ellipse
            cx={cx}
            cy={cy}
            rx={eyeRadiusX - 2}
            ry={eyeRadiusY - 2}
            fill="#ffffff"
            fillOpacity="0.05"
          />

          <g
            style={{
              transform: `translate(${pupilPos.x}px, ${pupilPos.y}px)`,
              transition: 'transform 0.12s ease-out',
            }}
          >
            <circle
              cx={cx}
              cy={cy}
              r={irisRadius + 2}
              fill={`url(#irisGradient-${size})`}
              fillOpacity="0.25"
            />

            <circle
              cx={cx}
              cy={cy}
              r={irisRadius}
              fill={`url(#irisGradient-${size})`}
            />

            <circle
              cx={cx}
              cy={cy}
              r={irisRadius * 0.6}
              fill="none"
              stroke="#0e7490"
              strokeWidth="0.5"
              strokeOpacity="0.6"
            />

            <circle
              cx={cx}
              cy={cy}
              r={pupilRadius}
              fill={`url(#pupilGradient-${size})`}
            />

            <circle
              cx={cx - irisRadius * 0.35}
              cy={cy - irisRadius * 0.35}
              r={highlightRadius}
              fill="#ffffff"
              fillOpacity="0.95"
            />

            <circle
              cx={cx + irisRadius * 0.4}
              cy={cy + irisRadius * 0.4}
              r={highlightRadius * 0.5}
              fill="#ffffff"
              fillOpacity="0.6"
            />
          </g>

          <ellipse
            cx={cx}
            cy={cy}
            rx={eyeRadiusX - 1}
            ry={eyeRadiusY - 1}
            fill={`url(#eyelidGlow-${size})`}
          />
        </g>

        <ellipse
          cx={cx}
          cy={cy}
          rx={eyeRadiusX}
          ry={eyeRadiusY}
          fill="none"
          stroke="#06b6d4"
          strokeWidth="1"
          strokeOpacity="0.3"
        />
      </svg>
    </div>
  )
}