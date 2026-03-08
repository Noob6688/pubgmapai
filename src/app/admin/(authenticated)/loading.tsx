'use client'

import { useState, useEffect } from 'react'
import { PageLoader } from '@/components/ui/loading'

export default function Loading() {
  const [showLoading, setShowLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (!showLoading) {
    return <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center" />
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
      <PageLoader text="页面加载中..." />
    </div>
  )
}
