'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MarkerType } from '@/types/database'
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
import { MoreHorizontal, Plus, Edit, Trash2, RefreshCw, Upload, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { TableSkeleton } from '@/components/ui/loading'

async function getMarkerTypes() {
  const supabase = createClient()
  const { data } = await supabase
    .from('marker_types')
    .select('*')
    .order('sort_order')
  return data || []
}

export default function MarkerTypesPage() {
  const supabase = createClient()
  const [markerTypes, setMarkerTypes] = useState<MarkerType[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingType, setEditingType] = useState<MarkerType | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    icon_url: '',
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
      const data = await getMarkerTypes()
      setMarkerTypes(data)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/png', 'image/svg+xml', 'image/jpeg', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('仅支持 PNG、SVG、JPEG、GIF、WebP 格式')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('文件大小不能超过 2MB')
      return
    }

    setUploading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.error('请先登录')
        return
      }

      const formDataObj = new FormData()
      formDataObj.append('file', file)
      formDataObj.append('type', 'marker-icon')

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formDataObj,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '上传失败')
      }

      setFormData({ ...formData, icon_url: result.url })
      toast.success('图标上传成功')
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || '上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingType) {
        const { error } = await supabase
          .from('marker_types')
          .update({
            name: formData.name,
            icon_url: formData.icon_url || null,
            sort_order: formData.sort_order,
            is_active: formData.is_active,
          })
          .eq('id', editingType.id)

        if (error) throw error
        toast.success('类型更新成功')
      } else {
        const { error } = await supabase.from('marker_types').insert([
          {
            name: formData.name,
            icon_url: formData.icon_url || null,
            sort_order: formData.sort_order,
            is_active: formData.is_active,
          },
        ])

        if (error) throw error
        toast.success('类型创建成功')
      }

      setDialogOpen(false)
      setEditingType(null)
      setFormData({ name: '', icon_url: '', sort_order: 0, is_active: true })
      loadData()
    } catch (error: any) {
      toast.error(error.message || '操作失败')
    }
  }

  const handleEdit = (type: MarkerType) => {
    setEditingType(type)
    setFormData({
      name: type.name,
      icon_url: type.icon_url || '',
      sort_order: type.sort_order,
      is_active: type.is_active,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个标记类型吗？')) return

    try {
      const { error } = await supabase.from('marker_types').delete().eq('id', id)
      if (error) throw error

      toast.success('类型已删除')
      loadData()
    } catch (error: any) {
      toast.error(error.message || '删除失败')
    }
  }

  const openNewDialog = () => {
    setEditingType(null)
    setFormData({ name: '', icon_url: '', sort_order: markerTypes.length, is_active: true })
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">标记类型</h1>
          <p className="text-muted-foreground">管理标记的类型和图标</p>
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
              <TableHead>图标</TableHead>
              <TableHead>名称</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeleton rows={5} columns={5} />
            ) : markerTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  暂无类型数据
                </TableCell>
              </TableRow>
            ) : (
              markerTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell>{type.sort_order}</TableCell>
                  <TableCell>
                    {type.icon_url ? (
                      <div className="h-8 w-8 overflow-hidden rounded border">
                        <img
                          src={type.icon_url}
                          alt={type.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded border bg-slate-50">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{type.name}</TableCell>
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
              {editingType ? '修改标记类型信息' : '添加新的标记类型'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">名称</Label>
              <Input
                id="name"
                placeholder="例如：物资点"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>图标</Label>
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-lg border-2 border-dashed border-slate-200 hover:border-slate-300 transition-colors">
                  {formData.icon_url ? (
                    <img
                      src={formData.icon_url}
                      alt="图标预览"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/svg+xml,image/jpeg,image/gif,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? '上传中...' : '上传图标'}
                  </Button>
                  <p className="text-xs text-muted-foreground">PNG/SVG，不超过 2MB</p>
                </div>
              </div>
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
