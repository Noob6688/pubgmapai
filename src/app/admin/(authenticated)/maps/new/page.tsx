'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function NewMapPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    tile_url: '',
    sort_order: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('maps')
        .insert([{
          name: formData.name,
          slug: formData.slug,
          tile_url: formData.tile_url,
          sort_order: formData.sort_order,
        }])

      if (error) throw error

      toast.success('地图创建成功')
      router.push('/admin/maps')
    } catch (error: any) {
      toast.error(error.message || '创建失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>新增地图</CardTitle>
          <CardDescription>添加新的游戏地图</CardDescription>
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
              <p className="text-xs text-muted-foreground">
                支持占位符：{'{z}'}、{'{x}'}、{'{y}'}
              </p>
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
            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? '创建中...' : '创建'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                取消
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
