'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Map,
  MapPin,
  Tags,
  Megaphone,
  Settings,
  LogOut,
  User as UserIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { User } from '@supabase/supabase-js'

const sidebarItems = [
  {
    title: '仪表盘',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: '地图管理',
    href: '/admin/maps',
    icon: Map,
  },
  {
    title: '标记管理',
    href: '/admin/markers',
    icon: MapPin,
  },
  {
    title: '标记类型',
    href: '/admin/marker-types',
    icon: Tags,
  },
  {
    title: '站长推荐',
    href: '/admin/recommendations',
    icon: Megaphone,
  },
  {
    title: '系统设置',
    href: '/admin/settings',
    icon: Settings,
  },
]

interface AdminHeaderProps {
  user: User | null
}

function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('已退出登录')
      router.push('/admin/login')
    } catch (error) {
      toast.error('退出登录失败')
    }
  }

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <div className="text-sm text-muted-foreground">
        当前位置：<span className="font-medium text-foreground">后台管理</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <UserIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{user?.email}</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          退出
        </Button>
      </div>
    </header>
  )
}

export { AdminHeader }

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen w-64 flex-col border-r bg-slate-50">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/admin" className="font-semibold">
            后台管理
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-slate-200 text-slate-900'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.title}</TooltipContent>
              </Tooltip>
            )
          })}
        </nav>
      </div>
    </TooltipProvider>
  )
}
