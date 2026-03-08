import { createServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Map, MapPin, Tags, Megaphone } from 'lucide-react'

async function getStats() {
  const supabase = await createServerClient()

  const [mapsResult, markersResult, typesResult, recommendationsResult] = await Promise.all([
    supabase.from('maps').select('id', { count: 'exact', head: true }),
    supabase.from('markers').select('id', { count: 'exact', head: true }),
    supabase.from('marker_types').select('id', { count: 'exact', head: true }),
    supabase.from('recommendations').select('id', { count: 'exact', head: true }),
  ])

  return {
    mapsCount: mapsResult.count || 0,
    markersCount: markersResult.count || 0,
    typesCount: typesResult.count || 0,
    recommendationsCount: recommendationsResult.count || 0,
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const statCards = [
    {
      title: '地图总数',
      value: stats.mapsCount,
      icon: Map,
      description: '已添加的游戏地图',
    },
    {
      title: '标记总数',
      value: stats.markersCount,
      icon: MapPin,
      description: '所有地图上的标记点',
    },
    {
      title: '标记类型',
      value: stats.typesCount,
      icon: Tags,
      description: '标记类型数量',
    },
    {
      title: '推荐内容',
      value: stats.recommendationsCount,
      icon: Megaphone,
      description: '显示的推荐内容',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">仪表盘</h1>
        <p className="text-muted-foreground">系统概览与统计</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <a
            href="/admin/maps"
            className="flex h-20 items-center justify-center rounded-lg border-2 border-dashed hover:border-primary hover:bg-slate-50 transition-colors"
          >
            <span className="text-sm font-medium">管理地图</span>
          </a>
          <a
            href="/admin/markers"
            className="flex h-20 items-center justify-center rounded-lg border-2 border-dashed hover:border-primary hover:bg-slate-50 transition-colors"
          >
            <span className="text-sm font-medium">管理标记</span>
          </a>
          <a
            href="/admin/marker-types"
            className="flex h-20 items-center justify-center rounded-lg border-2 border-dashed hover:border-primary hover:bg-slate-50 transition-colors"
          >
            <span className="text-sm font-medium">管理类型</span>
          </a>
          <a
            href="/admin/recommendations"
            className="flex h-20 items-center justify-center rounded-lg border-2 border-dashed hover:border-primary hover:bg-slate-50 transition-colors"
          >
            <span className="text-sm font-medium">管理推荐</span>
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
