'use client'

import { useTranslation } from '@/i18n'

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation()

  const toggleLocale = () => {
    setLocale(locale === 'zh-CN' ? 'en' : 'zh-CN')
  }

  return (
    <button
      onClick={toggleLocale}
      className="px-2 py-1 rounded border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors cursor-pointer"
    >
      <span className="text-xs font-mono text-cyan-400">
        {locale === 'zh-CN' ? 'EN' : '中文'}
      </span>
    </button>
  )
}
