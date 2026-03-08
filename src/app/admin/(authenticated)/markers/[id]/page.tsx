'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MapType, MarkerType, getMarkerCoords } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

async function getMarker(id: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('markers')
    .select('*, marker_types(*)')
    .eq('id', id)
    .single()
  return data
}

async function getMapTypes() {
  const supabase = createClient()
  const { data } = await supabase
    .from('map_types')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  return data || []
}

async function getMarkerTypes() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('marker_types')
    .select('id, name, icon_url, sort_order, is_active, created_at')
    .eq('is_active', true)
    .order('sort_order')
  
  if (error) {
    console.error('Error fetching marker types:', error)
    throw error
  }
  
  return data || []
}

export default function EditMarkerPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [mapTypes, setMapTypes] = useState<MapType[]>([])
  const [markerTypes, setMarkerTypes] = useState<MarkerType[]>([])
  const [formData, setFormData] = useState({
    map_id: '',
    type_id: '',
    title: '',
    description: '',
    lat: '',
    lng: '',
  })
  const dataLoadedRef = useRef(false)

  useEffect(() => {
    if (dataLoadedRef.current) return
    dataLoadedRef.current = true
    loadData()
  }, [params.id])

  async function loadData() {
    try {
      const [marker, mapTypesData, typesData] = await Promise.all([
        getMarker(params.id as string),
        getMapTypes(),
        getMarkerTypes(),
      ])

      setMapTypes(mapTypesData)
      setMarkerTypes(typesData)

      if (marker) {
        const coords = getMarkerCoords(marker)
        setFormData({
          map_id: marker.map_id,
          type_id: marker.type_id,
          title: marker.title || '',
          description: marker.description || '',
          lat: coords.lat.toString(),
          lng: coords.lng.toString(),
        })
      }
    } catch (error) {
      console.error('Failed to load marker:', error)
      toast.error('加载失败')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const lat = parseFloat(formData.lat)
      const lng = parseFloat(formData.lng)

      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('请输入有效的坐标')
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new Error('坐标范围无效')
      }

      const { error } = await supabase
        .from('markers')
        .update({
          map_id: formData.map_id,
          type_id: formData.type_id,
          title: formData.title || null,
          description: formData.description || null,
          latlng: `SRID=4326;POINT(${lng} ${lat})`,
        })
        .eq('id', params.id as string)

      if (error) throw error

      toast.success('标记更新成功')
      router.push('/admin/markers')
    } catch (error: any) {
      toast.error(error.message || '更新失败')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>编辑标记</CardTitle>
          <CardDescription>修改地图上的标记点</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="map_id">选择地图</Label>
              <Select
                value={formData.map_id}
                onValueChange={(value) => setFormData({ ...formData, map_id: value })}
                required
              >
                <SelectTrigger id="map_id">
                  <SelectValue placeholder="选择地图" />
                </SelectTrigger>
                <SelectContent>
                  {mapTypes.map((mapType) => (
                    <SelectItem key={mapType.id} value={mapType.id}>
                      {mapType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type_id">标记类型</Label>
              <Select
                key={`type-select-${markerTypes.length}`}
                value={formData.type_id}
                onValueChange={(value) => setFormData({ ...formData, type_id: value })}
                required
              >
                <SelectTrigger id="type_id">
                  <SelectValue placeholder={markerTypes.length === 0 ? "暂无可用类型" : "选择类型"} />
                </SelectTrigger>
                <SelectContent>
                  {markerTypes.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      请先添加标记类型
                    </div>
                  ) : (
                    markerTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          {type.icon_url ? (
                            <img
                              src={type.icon_url}
                              alt={type.name}
                              className="h-4 w-4 object-contain"
                            />
                          ) : (
                            <div className="h-4 w-4 rounded-full bg-slate-200" />
                          )}
                          {type.name}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                placeholder="例如：P城"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Input
                id="description"
                placeholder="标记点的描述信息"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lat">纬度 (Latitude)</Label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  placeholder="例如：45.5"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng">经度 (Longitude)</Label>
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  placeholder="例如：126.5"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                  required
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              注意：坐标使用 WGS84 坐标系 (EPSG:3857)
            </p>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? '保存中...' : '保存'}
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
