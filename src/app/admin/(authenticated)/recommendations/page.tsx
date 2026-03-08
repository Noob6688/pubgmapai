'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Recommendation } from '@/types/database'
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
import { MoreHorizontal, Plus, Edit, Trash2, ExternalLink, Image } from 'lucide-react'
import { toast } from 'sonner'

async function getRecommendations() {
  const supabase = createClient()
  const { data } = await supabase
    .from('recommendations')
    .select('*')
    .order('sort_order')
  return data || []
}

export default function RecommendationsPage() {
  const supabase = createClient()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Recommendation | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    link_url: '',
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
      const data = await getRecommendations()
      setRecommendations(data)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('recommendations')
          .update({
            title: formData.title,
            image_url: formData.image_url || null,
            link_url: formData.link_url,
            sort_order: formData.sort_order,
            is_active: formData.is_active,
          })
          .eq('id', editingItem.id)

        if (error) throw error
        toast.success('推荐更新成功')
      } else {
        const { error } = await supabase.from('recommendations').insert([
          {
            title: formData.title,
            image_url: formData.image_url || null,
            link_url: formData.link_url,
            sort_order: formData.sort_order,
            is_active: formData.is_active,
          },
        ])

        if (error) throw error
        toast.success('推荐创建成功')
      }

      setDialogOpen(false)
      setEditingItem(null)
      setFormData({ title: '', image_url: '', link_url: '', sort_order: 0, is_active: true })
      loadData()
    } catch (error: any) {
      toast.error(error.message || '操作失败')
    }
  }

  const handleEdit = (item: Recommendation) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      image_url: item.image_url || '',
      link_url: item.link_url,
      sort_order: item.sort_order,
      is_active: item.is_active,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个推荐吗？')) return

    try {
      const { error } = await supabase.from('recommendations').delete().eq('id', id)
      if (error) throw error

      toast.success('推荐已删除')
      loadData()
    } catch (error: any) {
      toast.error(error.message || '删除失败')
    }
  }

  const openNewDialog = () => {
    setEditingItem(null)
    setFormData({
      title: '',
      image_url: '',
      link_url: '',
      sort_order: recommendations.length,
      is_active: true,
    })
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">站长推荐</h1>
          <p className="text-muted-foreground">管理首页推荐的视频/内容</p>
        </div>
        <Button onClick={openNewDialog}>
          <Plus className="mr-2 h-4 w-4" />
          新增推荐
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>排序</TableHead>
              <TableHead>标题</TableHead>
              <TableHead>图片</TableHead>
              <TableHead>链接</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  加载中...
                </TableCell>
              </TableRow>
            ) : recommendations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  暂无推荐数据
                </TableCell>
              </TableRow>
            ) : (
              recommendations.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.sort_order}</TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>
                    {item.image_url ? (
                      <div className="h-10 w-10 overflow-hidden rounded border">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded border bg-slate-50">
                        <Image className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <a
                      href={item.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      链接
                    </a>
                  </TableCell>
                  <TableCell>
                    {item.is_active ? (
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
                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                          <Edit className="mr-2 h-4 w-4" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(item.id)}
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
            <DialogTitle>{editingItem ? '编辑推荐' : '新增推荐'}</DialogTitle>
            <DialogDescription>
              {editingItem ? '修改推荐信息' : '添加新的推荐内容'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                placeholder="例如：精彩操作集锦"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">图片链接</Label>
              <Input
                id="image_url"
                placeholder="https://example.com/image.jpg"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link_url">跳转链接</Label>
              <Input
                id="link_url"
                placeholder="https://example.com/video"
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                required
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
              <Button type="submit">{editingItem ? '保存' : '创建'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
