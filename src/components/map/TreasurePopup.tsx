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
  const [hintText, setHintText] = useState('寻找宝箱')
  const [popupUrl, setPopupUrl] = useState('')

  useEffect(() => {
    const lang = localStorage.getItem('locale')
    setHintText(lang === 'en' ? 'Find Treasure' : '寻找宝箱')
    
    const handleStorageChange = () => {
      const newLang = localStorage.getItem('locale')
      setHintText(newLang === 'en' ? 'Find Treasure' : '寻找宝箱')
    }
    
    window.addEventListener('storage', handleStorageChange)
    const interval = setInterval(() => {
      const newLang = localStorage.getItem('locale')
      setHintText(newLang === 'en' ? 'Find Treasure' : '寻找宝箱')
    }, 500)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    async function checkPopup() {
      const delayData = await fetchSetting('treasure_popup_delay')
      const enabledData = await fetchSetting('treasure_popup_enabled')
      const urlData = await fetchSetting('treasure_popup_url')
      
      const enabled = enabledData !== 'false'
      const delay = parseInt(delayData || '0') || 3000
      
      if (urlData) {
        setPopupUrl(urlData)
      }
      
      if (enabled) {
        setTimeout(() => {
          setShow(true)
        }, delay)
      }
    }

    checkPopup()
  }, [])

  if (!show) return null

  return (
    <div 
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[500] px-6 py-4 rounded-xl bg-gradient-to-r from-amber-900/90 to-orange-900/90 border border-amber-500/50 backdrop-blur-sm"
      style={{
        animation: 'pulse-glow 2s ease-in-out infinite',
      }}
    >
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.5); }
          50% { box-shadow: 0 0 40px rgba(245, 158, 11, 0.8); }
        }
      `}</style>
      <button 
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-600 border border-amber-400 flex items-center justify-center hover:bg-amber-700 transition-colors"
        onClick={() => setShow(false)}
      >
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
        if (popupUrl) {
          window.open(popupUrl, '_blank')
        }
        setShow(false)
      }}>
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
          <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <div>
          <p className="text-white font-medium">{hintText}</p>
        </div>
      </div>
    </div>
  )
}