'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Game } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
} from '@/components/ui/dialog'
import { MoreHorizontal, Plus, Edit, Trash2, RefreshCw, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { TableSkeleton } from '@/components/ui/loading'

async function getGames() {
  const supabase = createClient()
  const { data } = await supabase
    .from('games')
    .select('*')
    .order('created_at', { ascending: false })
  return data || []
}

export default function GamesPage() {
  const supabase = createClient()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    thumb: '',
    width: '100%',
    height: '480px',
    color: '#3f007e',
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
      const data = await getGames()
      setGames(data)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('请输入游戏标题')
      return
    }

    if (!formData.url.trim()) {
      toast.error('请输入游戏地址')
      return
    }

    try {
      const gameData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        url: formData.url.trim(),
        thumb: formData.thumb.trim() || null,
        width: formData.width || '100%',
        height: formData.height || '480px',
        color: formData.color || '#3f007e',
      }

      if (editingGame) {
        const { error } = await supabase
          .from('games')
          .update(gameData)
          .eq('id', editingGame.id)

        if (error) throw error
        toast.success('游戏更新成功')
      } else {
        const { error } = await supabase.from('games').insert([gameData])

        if (error) throw error
        toast.success('游戏创建成功')
      }

      setDialogOpen(false)
      setEditingGame(null)
      setFormData({
        title: '',
        description: '',
        url: '',
        thumb: '',
        width: '100%',
        height: '480px',
        color: '#3f007e',
      })
      loadData()
    } catch (error: any) {
      toast.error(error.message || '操作失败')
    }
  }

  const handleEdit = (game: Game) => {
    setEditingGame(game)
    setFormData({
      title: game.title,
      description: game.description || '',
      url: game.url,
      thumb: game.thumb || '',
      width: game.width,
      height: game.height,
      color: game.color,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个游戏吗？')) return

    try {
      const { error } = await supabase.from('games').delete().eq('id', id)
      if (error) throw error

      toast.success('游戏已删除')
      loadData()
    } catch (error: any) {
      toast.error(error.message || '删除失败')
    }
  }

  const openNewDialog = () => {
    setEditingGame(null)
    setFormData({
      title: '',
      description: '',
      url: '',
      thumb: '',
      width: '100%',
      height: '480px',
      color: '#3f007e',
    })
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">游戏管理</h1>
          <p className="text-muted-foreground">管理休闲小游戏</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={loadData} title="刷新">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={openNewDialog}>
            <Plus className="mr-2 h-4 w-4" />
            新增游戏
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>缩略图</TableHead>
              <TableHead>标题</TableHead>
              <TableHead>地址</TableHead>
              <TableHead>尺寸</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeleton rows={5} columns={6} />
            ) : games.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  暂无游戏数据
                </TableCell>
              </TableRow>
            ) : (
              games.map((game) => (
                <TableRow key={game.id}>
                  <TableCell>
                    {game.thumb ? (
                      <div className="h-10 w-16 overflow-hidden rounded border">
                        <img
                          src={game.thumb}
                          alt={game.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-16 items-center justify-center rounded border bg-slate-50">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{game.title}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                    {game.url}
                  </TableCell>
                  <TableCell className="text-sm">
                    {game.width} x {game.height}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(game.created_at).toLocaleDateString('zh-CN')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(game)}>
                          <Edit className="mr-2 h-4 w-4" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(game.id)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingGame ? '编辑游戏' : '新增游戏'}</DialogTitle>
            <DialogDescription>
              {editingGame ? '修改游戏信息' : '添加新的游戏'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">标题 *</Label>
                <Input
                  id="title"
                  placeholder="游戏标题"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">游戏地址 *</Label>
                <Input
                  id="url"
                  placeholder="https://..."
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Input
                id="description"
                placeholder="游戏描述（可选）"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumb">缩略图URL</Label>
              <Input
                id="thumb"
                placeholder="https://..."
                value={formData.thumb}
                onChange={(e) => setFormData({ ...formData, thumb: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">宽度</Label>
                <Input
                  id="width"
                  placeholder="100%"
                  value={formData.width}
                  onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">高度</Label>
                <Input
                  id="height"
                  placeholder="480px"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">主题色</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 p-1"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit">{editingGame ? '保存' : '创建'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
