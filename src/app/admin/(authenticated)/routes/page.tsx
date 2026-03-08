'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Route } from '@/types/database'
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
import { MoreHorizontal, Plus, Edit, Trash2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { TableSkeleton } from '@/components/ui/loading'

async function getRoutes() {
  const supabase = createClient()
  const { data } = await supabase
    .from('routes')
    .select('*')
    .order('sort_order')
  return data || []
}

export default function RoutesPage() {
  const supabase = createClient()
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    sort_order: 0,
    is_active: true,
  })
  const dataLoadedRef = useRef(false)

  useEffect(() => {
    if (dataLoadedRef.current) return
    dataLoadedRef.current = true
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const data = await getRoutes()
      setRoutes(data)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingRoute) {
        const { error } = await supabase
          .from('routes')
          .update({
            name: formData.name,
            slug: formData.slug,
            description: formData.description || null,
            sort_order: formData.sort_order,
            is_active: formData.is_active,
          })
          .eq('id', editingRoute.id)

        if (error) throw error
        toast.success('路由更新成功')
      } else {
        const { error } = await supabase
          .from('routes')
          .insert({
            name: formData.name,
            slug: formData.slug,
            description: formData.description || null,
            sort_order: formData.sort_order,
            is_active: formData.is_active,
          })

        if (error) throw error
        toast.success('路由创建成功')
      }

      setDialogOpen(false)
      resetForm()
      loadData()
    } catch (error: any) {
      toast.error(error.message || '操作失败')
    }
  }

  const handleEdit = (route: Route) => {
    setEditingRoute(route)
    setFormData({
      name: route.name,
      slug: route.slug,
      description: route.description || '',
      sort_order: route.sort_order,
      is_active: route.is_active,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (route: Route) => {
    if (!confirm(`确定要删除路由 "${route.name}" 吗？`)) return

    try {
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', route.id)

      if (error) throw error
      toast.success('路由删除成功')
      loadData()
    } catch (error: any) {
      toast.error(error.message || '删除失败')
    }
  }

  const resetForm = () => {
    setEditingRoute(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      sort_order: 0,
      is_active: true,
    })
  }

  const openNewDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">路由管理</h2>
        </div>
        <TableSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">路由管理</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={loadData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={openNewDialog}>
            <Plus className="mr-2 h-4 w-4" />
            新增路由
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>排序</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                routes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell className="font-medium">{route.name}</TableCell>
                    <TableCell>
                      <code className="rounded bg-slate-100 px-2 py-1 text-sm dark:bg-slate-800">
                        /map/{route.slug}
                      </code>
                    </TableCell>
                    <TableCell>{route.description || '-'}</TableCell>
                    <TableCell>{route.sort_order}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          route.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {route.is_active ? '启用' : '禁用'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(route)}>
                            <Edit className="mr-2 h-4 w-4" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(route)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRoute ? '编辑路由' : '新增路由'}</DialogTitle>
            <DialogDescription>
              {editingRoute ? '修改路由信息' : '创建新的路由'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">名称</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如: UU地图"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="例如: uu"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">描述</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="可选描述"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sort_order">排序</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="is_active">启用</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false)
                  resetForm()
                }}
              >
                取消
              </Button>
              <Button type="submit">{editingRoute ? '保存' : '创建'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
