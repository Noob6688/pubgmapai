'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Route, Recommendation, RouteRecommendation } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { MoreHorizontal, Plus, Edit, Trash2, RefreshCw, Link2 } from 'lucide-react'
import { toast } from 'sonner'
import { TableSkeleton } from '@/components/ui/loading'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

async function getRoutes() {
  const supabase = createClient()
  const { data } = await supabase
    .from('routes')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  return data || []
}

async function getRecommendations() {
  const supabase = createClient()
  const { data } = await supabase
    .from('recommendations')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  return data || []
}

async function getRouteRecommendations(routeId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('route_recommendations')
    .select('*, recommendation:recommendations(*)')
    .eq('route_id', routeId)
    .order('sort_order')
  return data || []
}

export default function RouteRecommendationsPage() {
  const supabase = createClient()
  const [routes, setRoutes] = useState<Route[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [routeRecommendations, setRouteRecommendations] = useState<RouteRecommendation[]>([])
  const [selectedRouteId, setSelectedRouteId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedRecIds, setSelectedRecIds] = useState<string[]>([])
  const dataLoadedRef = useRef(false)

  useEffect(() => {
    if (dataLoadedRef.current) return
    dataLoadedRef.current = true
    loadInitialData()
  }, [])

  async function loadInitialData() {
    setLoading(true)
    try {
      const [routesData, recsData] = await Promise.all([
        getRoutes(),
        getRecommendations(),
      ])
      setRoutes(routesData)
      setRecommendations(recsData)
      if (routesData.length > 0) {
        setSelectedRouteId(routesData[0].id)
        const routeRecs = await getRouteRecommendations(routesData[0].id)
        setRouteRecommendations(routeRecs)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleRouteChange(routeId: string) {
    setSelectedRouteId(routeId)
    setLoading(true)
    try {
      const routeRecs = await getRouteRecommendations(routeId)
      setRouteRecommendations(routeRecs)
    } catch (error) {
      console.error('Failed to load route recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddRecommendations = () => {
    const currentRecIds = routeRecommendations
      .map((rr) => rr.recommendation_id)
      .filter(Boolean)
    setSelectedRecIds(currentRecIds)
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const currentRecIds = routeRecommendations.map((rr) => rr.recommendation_id)
      const toAdd = selectedRecIds.filter((id) => !currentRecIds.includes(id))
      const toRemove = currentRecIds.filter((id) => !selectedRecIds.includes(id))

      if (toRemove.length > 0) {
        await supabase
          .from('route_recommendations')
          .delete()
          .eq('route_id', selectedRouteId)
          .in('recommendation_id', toRemove)
      }

      for (const recId of toAdd) {
        const maxSortOrder = routeRecommendations
          .filter((rr) => rr.recommendation_id === recId)
          .reduce((max, rr) => Math.max(max, rr.sort_order), 0)

        await supabase.from('route_recommendations').insert({
          route_id: selectedRouteId,
          recommendation_id: recId,
          sort_order: maxSortOrder + 1,
        })
      }

      toast.success('推荐关联更新成功')
      setDialogOpen(false)
      const routeRecs = await getRouteRecommendations(selectedRouteId)
      setRouteRecommendations(routeRecs)
    } catch (error: any) {
      toast.error(error.message || '操作失败')
    }
  }

  const handleDelete = async (routeRec: RouteRecommendation) => {
    if (!confirm('确定要解除此推荐关联吗？')) return

    try {
      const { error } = await supabase
        .from('route_recommendations')
        .delete()
        .eq('id', routeRec.id)

      if (error) throw error
      toast.success('解除关联成功')
      const routeRecs = await getRouteRecommendations(selectedRouteId)
      setRouteRecommendations(routeRecs)
    } catch (error: any) {
      toast.error(error.message || '操作失败')
    }
  }

  const handleSort = async (routeRec: RouteRecommendation, direction: 'up' | 'down') => {
    const currentIndex = routeRecommendations.findIndex((rr) => rr.id === routeRec.id)
    if (direction === 'up' && currentIndex === 0) return
    if (direction === 'down' && currentIndex === routeRecommendations.length - 1) return

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const swapRec = routeRecommendations[swapIndex]

    try {
      await supabase
        .from('route_recommendations')
        .update({ sort_order: swapRec.sort_order })
        .eq('id', routeRec.id)

      await supabase
        .from('route_recommendations')
        .update({ sort_order: routeRec.sort_order })
        .eq('id', swapRec.id)

      const newList = [...routeRecommendations]
      ;[newList[currentIndex], newList[swapIndex]] = [swapRec, routeRec]
      setRouteRecommendations(newList)
    } catch (error: any) {
      toast.error(error.message || '排序失败')
    }
  }

  const selectedRoute = routes.find((r) => r.id === selectedRouteId)

  if (loading && routes.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">路由推荐关联</h2>
        </div>
        <TableSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">路由推荐关联</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={loadInitialData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>选择路由</CardTitle>
          <CardDescription>选择要管理推荐的路由</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedRouteId} onValueChange={handleRouteChange}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="选择路由" />
            </SelectTrigger>
            <SelectContent>
              {routes.map((route) => (
                <SelectItem key={route.id} value={route.id}>
                  {route.name} (/map/{route.slug})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>推荐列表</CardTitle>
            <CardDescription>
              {selectedRoute ? `为 "${selectedRoute.name}" 关联的推荐` : '请先选择路由'}
            </CardDescription>
          </div>
          <Button onClick={handleAddRecommendations} disabled={!selectedRouteId}>
            <Plus className="mr-2 h-4 w-4" />
            关联推荐
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>排序</TableHead>
                <TableHead>标题</TableHead>
                <TableHead>链接</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!selectedRouteId ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    请先选择路由
                  </TableCell>
                </TableRow>
              ) : routeRecommendations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    暂无关联的推荐
                  </TableCell>
                </TableRow>
              ) : (
                routeRecommendations.map((routeRec, index) => (
                  <TableRow key={routeRec.id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleSort(routeRec, 'up')}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleSort(routeRec, 'down')}
                          disabled={index === routeRecommendations.length - 1}
                        >
                          ↓
                        </Button>
                        <span className="ml-2">{index + 1}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {(routeRec as any).recommendation?.title || '-'}
                    </TableCell>
                    <TableCell>
                      {(routeRec as any).recommendation?.link_url ? (
                        <a
                          href={(routeRec as any).recommendation.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline truncate block max-w-[200px]"
                        >
                          {(routeRec as any).recommendation.link_url}
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          (routeRec as any).recommendation?.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {(routeRec as any).recommendation?.is_active ? '启用' : '禁用'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600"
                        onClick={() => handleDelete(routeRec)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>关联推荐</DialogTitle>
            <DialogDescription>选择要关联到该路由的推荐</DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto py-4">
            {recommendations.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">暂无可用推荐</p>
            ) : (
              <div className="space-y-2">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="flex items-center gap-2">
                    <Checkbox
                      id={rec.id}
                      checked={selectedRecIds.includes(rec.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedRecIds([...selectedRecIds, rec.id])
                        } else {
                          setSelectedRecIds(selectedRecIds.filter((id) => id !== rec.id))
                        }
                      }}
                    />
                    <Label htmlFor={rec.id} className="cursor-pointer">
                      {rec.title}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
