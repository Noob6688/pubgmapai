'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { PageLoader } from '@/components/ui/loading'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const [showLoader, setShowLoader] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/admin/login')
        return
      }
      
      setUser(session.user)
      setLoading(false)
      
      setTimeout(() => {
        setShowLoader(false)
      }, 500)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.push('/admin/login')
        } else {
          setUser(session.user)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router, supabase])

  if (loading || showLoader) {
    return (
      <div className="flex h-screen items-center justify-center">
        <PageLoader text="页面加载中..." />
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader user={user} />
        <main className="flex-1 overflow-hidden bg-slate-50 p-4">
          {children}
        </main>
      </div>
    </div>
  )
}
