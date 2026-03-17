'use client'

import { createContext, useContext, useState, useEffect, ReactNode, JSX } from 'react'
import zhCN from '@/i18n/zh-CN.json'
import en from '@/i18n/en.json'

type Translations = typeof zhCN

const translations: Record<string, Translations> = {
  'zh-CN': zhCN,
  'en': en,
}

interface I18nContextType {
  locale: string
  t: (key: string) => string
  setLocale: (locale: string) => void
  tMap: (name: string) => string
  tMarkerType: (name: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.')
  let current: unknown = obj
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return path
    }
  }
  
  return typeof current === 'string' ? current : path
}

export function I18nProvider({ children }: { children: ReactNode }): JSX.Element {
  const [locale, setLocaleState] = useState('zh-CN')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const saved = localStorage.getItem('locale')
    if (saved && (saved === 'en' || saved === 'zh-CN')) {
      setLocaleState(saved)
    } else {
      const browserLang = navigator.language
      if (browserLang.startsWith('en')) {
        setLocaleState('en')
      }
    }
  }, [])

  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
  }

  const t = (key: string): string => {
    const trans = translations[locale] || translations['zh-CN']
    return getNestedValue(trans as unknown as Record<string, unknown>, key)
  }

  const tMap = (name: string): string => {
    const key = `map.maps.${name}`
    const result = getNestedValue(translations[locale] || translations['zh-CN'] as unknown as Record<string, unknown>, key)
    return result === key ? name : result
  }

  const tMarkerType = (name: string): string => {
    const key = `map.markerTypes.${name}`
    const result = getNestedValue(translations[locale] || translations['zh-CN'] as unknown as Record<string, unknown>, key)
    return result === key ? name : result
  }

  const contextValue = { locale, t, setLocale, tMap, tMarkerType }

  if (!mounted) {
    return (
      <I18nContext.Provider value={contextValue}>
        {children}
      </I18nContext.Provider>
    )
  }

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider')
  }
  return context
}

export function getStaticTranslations(locale: string): Translations {
  return translations[locale] || translations['zh-CN']
}

export function translateMapName(locale: string, mapName: string): string {
  const trans = translations[locale] || translations['zh-CN']
  const key = `map.maps.${mapName}`
  const result = getNestedValue(trans as unknown as Record<string, unknown>, key)
  return result === key ? mapName : result
}

export function translateMarkerTypeName(locale: string, markerTypeName: string): string {
  const trans = translations[locale] || translations['zh-CN']
  const key = `map.markerTypes.${markerTypeName}`
  const result = getNestedValue(trans as unknown as Record<string, unknown>, key)
  return result === key ? markerTypeName : result
}

export const supportedLocales = ['zh-CN', 'en'] as const
export type SupportedLocale = typeof supportedLocales[number]
