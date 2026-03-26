'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

async function fetchSetting(key: string): Promise<string | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single()
  return data?.value || null
}

export default function TreasurePopup() {
  const [show, setShow] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function checkPopup() {
      const delayData = await fetchSetting('treasure_popup_delay')
      const enabledData = await fetchSetting('treasure_popup_enabled')
      
      const enabled = enabledData !== 'false'
      const delay = parseInt(delayData || '0') || 3000
      
      if (enabled) {
        setLoaded(true)
        setTimeout(() => {
          setShow(true)
        }, delay)
      }
    }

    checkPopup()
  }, [])

  if (!show) return null

  return (
    <>
      <style jsx>{`
        @keyframes float-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.5); }
          50% { box-shadow: 0 0 40px rgba(245, 158, 11, 0.8); }
        }
        .treasure-popup {
          animation: float-up 0.5s ease-out, pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
      <div 
        className="treasure-popup fixed bottom-8 left-1/2 -translate-x-1/2 z-[500] px-6 py-4 rounded-xl bg-gradient-to-r from-amber-900/90 to-orange-900/90 border border-amber-500/50 backdrop-blur-sm cursor-pointer"
        onClick={() => setShow(false)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-medium">寻找宝藏</p>
            <p className="text-amber-300/70 text-sm">点击地图标记查看位置</p>
          </div>
        </div>
      </div>
    </>
  )
}