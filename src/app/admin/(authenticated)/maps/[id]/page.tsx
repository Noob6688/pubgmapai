'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function EditMapPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    tile_url: '',
    sort_order: 0,
    is_active: true,
  })

  const mapId = params.id as string

  useEffect(() => {
    async function fetchMap() {
      const { data, error } = await supabase
        .from('maps')
        .select('*')
        .eq('id', mapId)
        .single()

      if (error || !data) {
        toast.error('地图不存在')
        router.refresh()
        router.push('/admin/maps')
        return
      }

      setFormData({
        name: data.name,
        slug: data.slug,
        tile_url: data.tile_url,
        sort_order: data.sort_order || 0,
        is_active: data.is_active,
      })
      setLoading(false)
    }

    if (mapId) {
      fetchMap()
    }
  }, [mapId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from('maps')
        .update({
          name: formData.name,
          slug: formData.slug,
          tile_url: formData.tile_url,
          sort_order: formData.sort_order,
          is_active: formData.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', mapId)

      if (error) throw error

      toast.success('地图更新成功')
      router.refresh()
      router.push('/admin/maps')
    } catch (error: any) {
      toast.error(error.message || '更新失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这个地图吗？')) return

    try {
      const { error } = await supabase
        .from('maps')
        .delete()
        .eq('id', mapId)

      if (error) throw error

      toast.success('地图已删除')
      router.refresh()
      router.push('/admin/maps')
    } catch (error: any) {
      toast.error(error.message || '删除失败')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>编辑地图</CardTitle>
          <CardDescription>修改游戏地图信息</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">地图名称</Label>
              <Input
                id="name"
                placeholder="例如：艾伦格"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL 标识符</Label>
              <Input
                id="slug"
                placeholder="例如：erangel"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tile_url">切片服务地址</Label>
              <Input
                id="tile_url"
                placeholder="https://your-tile-server.com/{z}/{x}/{y}.png"
                value={formData.tile_url}
                onChange={(e) => setFormData({ ...formData, tile_url: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort_order">排序</Label>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">
                数字越小越靠前
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="is_active">启用此地图</Label>
            </div>
            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? '保存中...' : '保存'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                取消
              </Button>
              <Button type="button" variant="destructive" onClick={handleDelete}>
                删除
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
