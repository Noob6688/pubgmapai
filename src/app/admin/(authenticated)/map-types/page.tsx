'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MapType } from '@/types/database'
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

async function getMapTypes() {
  const supabase = createClient()
  const { data } = await supabase
    .from('map_types')
    .select('*')
    .order('sort_order')
  return data || []
}

export default function MapTypesPage() {
  const supabase = createClient()
  const [mapTypes, setMapTypes] = useState<MapType[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingType, setEditingType] = useState<MapType | null>(null)
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
      const data = await getMapTypes()
      setMapTypes(data)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingType) {
        const { error } = await supabase
          .from('map_types')
          .update({
            name: formData.name,
            slug: formData.slug,
            description: formData.description || null,
            sort_order: formData.sort_order,
            is_active: formData.is_active,
          })
          .eq('id', editingType.id)

        if (error) throw error
        toast.success('类型更新成功')
      } else {
        const { error } = await supabase.from('map_types').insert([
          {
            name: formData.name,
            slug: formData.slug,
            description: formData.description || null,
            sort_order: formData.sort_order,
            is_active: formData.is_active,
          },
        ])

        if (error) throw error
        toast.success('类型创建成功')
      }

      setDialogOpen(false)
      setEditingType(null)
      setFormData({ name: '', slug: '', description: '', sort_order: 0, is_active: true })
      loadData()
    } catch (error: any) {
      toast.error(error.message || '操作失败')
    }
  }

  const handleEdit = (type: MapType) => {
    setEditingType(type)
    setFormData({
      name: type.name,
      slug: type.slug,
      description: type.description || '',
      sort_order: type.sort_order,
      is_active: type.is_active,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个地图类型吗？')) return

    try {
      const { error } = await supabase.from('map_types').delete().eq('id', id)
      if (error) throw error

      toast.success('类型已删除')
      loadData()
    } catch (error: any) {
      toast.error(error.message || '删除失败')
    }
  }

  const openNewDialog = () => {
    setEditingType(null)
    setFormData({ name: '', slug: '', description: '', sort_order: mapTypes.length, is_active: true })
    setDialogOpen(true)
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">地图类型</h1>
          <p className="text-muted-foreground">管理游戏地图名称</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={loadData} title="刷新">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={openNewDialog}>
            <Plus className="mr-2 h-4 w-4" />
            新增类型
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>排序</TableHead>
              <TableHead>名称</TableHead>
              <TableHead>标识符</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeleton rows={5} columns={6} />
            ) : mapTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              mapTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell>{type.sort_order}</TableCell>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell className="font-mono text-sm">{type.slug}</TableCell>
                  <TableCell className="text-muted-foreground">{type.description || '-'}</TableCell>
                  <TableCell>
                    {type.is_active ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        启用
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                        禁用
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(type)}>
                          <Edit className="mr-2 h-4 w-4" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(type.id)}
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
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingType ? '编辑类型' : '新增类型'}</DialogTitle>
            <DialogDescription>
              {editingType ? '修改地图类型信息' : '添加新的地图类型'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">名称</Label>
              <Input
                id="name"
                placeholder="例如：艾伦格"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">标识符</Label>
              <Input
                id="slug"
                placeholder="例如：erangel"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Input
                id="description"
                placeholder="地图描述（可选）"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
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
            <DialogFooter>
              <Button type="submit">{editingType ? '保存' : '创建'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
