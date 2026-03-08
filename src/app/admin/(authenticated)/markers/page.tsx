'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import { MapType } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Trash2, Save, MapPin, Edit } from 'lucide-react'
import { toast } from 'sonner'
import { PageLoader } from '@/components/ui/loading'

const LeafletMap = dynamic(
  () => import('@/components/map/LeafletMap'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-slate-100">
        <PageLoader text="加载地图中..." />
      </div>
    )
  }
)

interface TempMarker {
  id: string
  lat: number
  lng: number
  type_id: string
  type_name: string
  title: string
  description: string
}

interface MarkerWithTypeName {
  id: string
  map_id: string
  type_id: string // 遵守LeafletMap组件的接口要求
  latlng: {
    coordinates: [number, number]
  }
  title?: string | null
  description?: string | null
  marker_type?: {
    id: string
    name: string
    icon_url?: string | null
  }
  type_name?: string
  lat?: number
  lng?: number
}

interface MapData {
  id: string
  name: string
  slug: string
  tile_url: string
  bounds?: { sw: [number, number]; ne: [number, number] }
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

async function getMaps() {
  const supabase = createClient()
  const { data } = await supabase
    .from('maps')
    .select('*')
    .eq('is_active', true)
    .order('name')
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
    console.error('Error loading marker types:', error)
    throw error
  }
  
  console.log('Fetched marker types:', data)
  return data || []
}

async function getMarkers(mapTypeId: string) {
  const supabase = createClient()
  
  const { data: markersData, error: markersError } = await supabase
    .from('markers')
    .select('*')
    .eq('map_id', mapTypeId)
  
  if (markersError) {
    console.error('Error fetching markers:', markersError)
    throw markersError
  }
  
  if (!markersData || markersData.length === 0) {
    return []
  }
  
  const typeIds = Array.from(new Set(markersData.map((m: any) => m.type_id).filter(Boolean)))
  
  console.log('typeIds:', typeIds)
  
  let markerTypesMap: Record<string, any> = {}
  if (typeIds.length > 0) {
    try {
      const { data: typesData, error: typesError } = await supabase
        .from('marker_types')
        .select('id, name, icon_url')
        .in('id', typeIds)
      
      console.log('typesError:', typesError)
      console.log('typesData:', typesData)
      
      if (typesData) {
        typesData.forEach((t: any) => {
          markerTypesMap[t.id] = t
        })
      }
    } catch (e) {
      console.error('Error fetching marker types:', e)
    }
  }
  
  const data = markersData.map((m: any) => ({
    ...m,
    marker_type: markerTypesMap[m.type_id] || null
  }))
  
  console.log('=====================================')
  console.log('Fetched markers for map', mapTypeId, ':', data)
  
  // 将标记数据结构转换为LeafletMap组件所需要的格式
  return (data || []).map((m: any) => ({
    id: m.id,
    map_id: m.map_id,
    type_id: m.marker_type?.id || m.type_id || '', // 确保 type_id 被正确赋值
    latlng: m.latlng,
    title: m.title,
    description: m.description,
    marker_type: m.marker_type,
    lat: m.latlng.coordinates[1], // 添加lat/lng作为别名，以防组件需要
    lng: m.latlng.coordinates[0],
  }))
}

export default function MarkersPage() {
  const supabase = createClient()
  const [mapTypes, setMapTypes] = useState<MapType[]>([])
  const [maps, setMaps] = useState<MapData[]>([])
  const [markerTypes, setMarkerTypes] = useState<any[]>([])
  const [savedMarkers, setSavedMarkers] = useState<MarkerWithTypeName[]>([])
  const [tempMarkers, setTempMarkers] = useState<TempMarker[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedMapTypeId, setSelectedMapTypeId] = useState<string>('')
  const [selectedMap, setSelectedMap] = useState<MapData | null>(null)
  const [selectedTileUrl, setSelectedTileUrl] = useState<string>('')
  const [mapBounds, setMapBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null)
  const [typeDialogOpen, setTypeDialogOpen] = useState(false)
  const [selectedTempMarker, setSelectedTempMarker] = useState<TempMarker | null>(null)
  const [tempMarkerForm, setTempMarkerForm] = useState({
    type_id: '',
    title: '',
    description: '',
  })

  const selectedMapType = mapTypes.find(m => m.id === selectedMapTypeId)

  const currentTileUrl = useMemo(() => {
    if (!selectedTileUrl || !selectedMapType?.slug) return ''
    return `${selectedTileUrl}${selectedMapType.slug}/{z}/{x}/{y}.webp`
  }, [selectedTileUrl, selectedMapType])

  const mapConfig = useMemo(() => {
    if (!selectedMap || !currentTileUrl) return null
    return { ...selectedMap, tile_url: currentTileUrl }
  }, [selectedMap, currentTileUrl])

  const dataLoadedRef = useRef(false)

  useEffect(() => {
    if (dataLoadedRef.current) return
    dataLoadedRef.current = true
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [mapTypesData, mapsData, markerTypesData] = await Promise.all([
        getMapTypes(),
        getMaps(),
        getMarkerTypes(),
      ])
      console.log('Loaded marker types:', markerTypesData)
      console.log('Map types:', mapTypesData)
      console.log('Maps:', mapsData)
      setMapTypes(mapTypesData)
      setMaps(mapsData)
      setMarkerTypes(markerTypesData || [])
      
      if (mapTypesData.length > 0 && mapsData.length > 0) {
        setSelectedMapTypeId(mapTypesData[0].id)
        setSelectedTileUrl(mapsData[0].tile_url)
        const mapWithBounds = {
          ...mapsData[0],
          bounds: { sw: [-200, -200] as [number, number], ne: [200, 200] as [number, number] }
        }
        setSelectedMap(mapWithBounds)
        const markersData = await getMarkers(mapTypesData[0].id)
        setSavedMarkers(markersData)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('数据加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleMapTypeChange = async (mapTypeId: string) => {
    setSelectedMapTypeId(mapTypeId)
    setTempMarkers([])
    
    const mapType = mapTypes.find(m => m.id === mapTypeId)
    const mapData = maps.find(m => m.name === mapType?.name) || maps[0]
    
    if (mapData) {
      const mapWithBounds = {
        ...mapData,
        bounds: { sw: [-200, -200] as [number, number], ne: [200, 200] as [number, number] }
      }
      setSelectedMap(mapWithBounds)
      setSelectedTileUrl(mapData.tile_url)
      const markersData = await getMarkers(mapTypeId)
      setSavedMarkers(markersData)
    } else {
      setSelectedMap(null)
      setSavedMarkers([])
    }
  }

  const handleTileUrlChange = (tileUrl: string) => {
    setSelectedTileUrl(tileUrl)
  }

  const handleBoundsChange = (bounds: { north: number; south: number; east: number; west: number }) => {
    setMapBounds(bounds)
  }

  const handleMapClick = (lat: number, lng: number) => {
    console.log('Map clicked, markerTypes:', markerTypes)
    const newMarker: TempMarker = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      lat,
      lng,
      type_id: '',
      type_name: '',
      title: '',
      description: '',
    }
    setTempMarkers(prev => [...prev, newMarker])
    setSelectedTempMarker(newMarker)
    setTempMarkerForm({
      type_id: '',
      title: '',
      description: '',
    })
    setTypeDialogOpen(true)
  }

  const handleTempMarkerDrag = (markerId: string, lat: number, lng: number) => {
    setTempMarkers(tempMarkers.map(m => 
      m.id === markerId ? { ...m, lat, lng } : m
    ))
    const draggedMarker = tempMarkers.find(m => m.id === markerId)
    if (draggedMarker) {
      setSelectedTempMarker({ ...draggedMarker, lat, lng })
    }
  }

  const handleDeleteSavedMarker = async (markerId: string) => {
    try {
      const { error } = await supabase
        .from('markers')
        .delete()
        .eq('id', markerId)
      
      if (error) throw error
      
      toast.success('标记已删除')
      
      const updatedMarkers = savedMarkers.filter(m => m.id !== markerId)
      setSavedMarkers(updatedMarkers)
    } catch (error: any) {
      toast.error(error.message || '删除失败')
    }
  }

  const handleTypeDialogConfirm = () => {
    if (!selectedTempMarker || !tempMarkerForm.type_id) {
      toast.error('请选择标记类型')
      return
    }

    const type = markerTypes.find(t => t.id === tempMarkerForm.type_id)
    
    const updatedMarker: TempMarker = {
      ...selectedTempMarker,
      type_id: tempMarkerForm.type_id,
      type_name: type?.name || '',
      title: tempMarkerForm.title,
      description: tempMarkerForm.description,
    }

    setTempMarkers(tempMarkers.map(m => 
      m.id === selectedTempMarker.id ? updatedMarker : m
    ))

    setTypeDialogOpen(false)
    toast.success('标记已添加')
  }

  const handleRemoveTempMarker = (id: string) => {
    setTempMarkers(tempMarkers.filter(m => m.id !== id))
  }

  const handleEditTempMarker = (marker: TempMarker) => {
    setSelectedTempMarker(marker)
    setTempMarkerForm({
      type_id: marker.type_id,
      title: marker.title,
      description: marker.description,
    })
    setTypeDialogOpen(true)
  }

  const handleSaveAll = async () => {
    if (!selectedMapTypeId) {
      toast.error('请选择地图')
      return
    }

    const markersWithoutType = tempMarkers.filter(m => !m.type_id)
    if (markersWithoutType.length > 0) {
      toast.error('请为所有标记选择类型')
      return
    }

    setSaving(true)
    try {
      const insertData = tempMarkers.map(m => ({
        map_id: selectedMapTypeId,
        type_id: m.type_id,
        title: m.title || null,
        description: m.description || null,
        latlng: `SRID=4326;POINT(${m.lng} ${m.lat})`,
      }))

      const { error } = await supabase.from('markers').insert(insertData)

      if (error) throw error

      toast.success(`成功保存 ${tempMarkers.length} 个标记`)
      setTempMarkers([])
      
      const markersData = await getMarkers(selectedMapTypeId)
      setSavedMarkers(markersData)
    } catch (error: any) {
      toast.error(error.message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <PageLoader text="加载数据中..." />
      </div>
    )
  }

  return (
    <div className="flex h-full gap-4">
      <div className="flex-1 min-h-0 rounded-lg overflow-hidden border flex flex-col">
        <div className="flex items-center gap-2 p-2 bg-white border-b">
          <div className="flex items-center gap-2">
            <Label className="text-sm whitespace-nowrap">切片地址：</Label>
            <Select value={selectedTileUrl} onValueChange={handleTileUrlChange}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="选择切片地址" />
              </SelectTrigger>
              <SelectContent>
                {maps.map((map) => (
                  <SelectItem key={map.id} value={map.tile_url}>
                    {map.name} - {map.tile_url}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {mapBounds && (
            <span className="text-xs text-blue-600 font-mono">
              边界: N:{mapBounds.north.toFixed(2)} S:{mapBounds.south.toFixed(2)} E:{mapBounds.east.toFixed(2)} W:{mapBounds.west.toFixed(2)}
            </span>
          )}
        </div>
        <div className="flex-1 min-h-0 relative">
          {mapConfig && selectedMap ? (
            <div key={`map-container-${selectedMap.id}`} className="h-full w-full">
              <LeafletMap
                map={mapConfig}
                center={[-60, -90]}
                zoom={3}
                markerTypes={markerTypes}
                selectedTypeIds={markerTypes.map(t => t.id)}
                markers={savedMarkers}
                tempMarkers={tempMarkers}
                onMapClick={handleMapClick}
                onTempMarkerDrag={handleTempMarkerDrag}
                onMarkerDelete={handleDeleteSavedMarker}
                onBoundsChange={handleBoundsChange}
                selectable={true}
              />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100">
              <p className="text-muted-foreground">请选择切片地址</p>
            </div>
          )}
        </div>
      </div>

      <div className="w-[360px] flex flex-col gap-3 overflow-hidden">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">选择地图</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Select value={selectedMapTypeId} onValueChange={handleMapTypeChange}>
              <SelectTrigger>
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
          </CardContent>
        </Card>

        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                标记列表 ({tempMarkers.length})
              </CardTitle>
              {tempMarkers.length > 0 && (
                <Button 
                  size="sm" 
                  onClick={handleSaveAll}
                  disabled={saving}
                >
                  <Save className="mr-1 h-3 w-3" />
                  {saving ? '保存中...' : '保存全部'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0 pt-0">
            {tempMarkers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                <MapPin className="h-10 w-10 mb-2 opacity-30" />
                <p className="text-sm text-center">点击地图添加标记</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>状态</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>标题</TableHead>
                    <TableHead>坐标</TableHead>
                    <TableHead className="w-[40px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tempMarkers.map((marker) => (
                    <TableRow 
                      key={marker.id}
                      className={selectedTempMarker?.id === marker.id ? 'bg-orange-50' : ''}
                    >
                      <TableCell className="text-sm">
                        {selectedTempMarker?.id === marker.id && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            活动中
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{marker.type_name || '-'}</TableCell>
                      <TableCell className="text-sm font-medium">{marker.title || '-'}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleEditTempMarker(marker)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-500 hover:text-red-600"
                            onClick={() => handleRemoveTempMarker(marker.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={typeDialogOpen} onOpenChange={setTypeDialogOpen}>
        <DialogContent className="z-[10000]">
          <DialogHeader>
            <DialogTitle>选择标记类型</DialogTitle>
          </DialogHeader>
          <div className="text-xs text-gray-500 mb-2">
            可用类型: {markerTypes.length} 个
          </div>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>标记类型 *</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={tempMarkerForm.type_id}
                onChange={(e) => setTempMarkerForm({ ...tempMarkerForm, type_id: e.target.value })}
              >
                <option value="">选择类型</option>
                {markerTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>标题（可选）</Label>
              <Input
                placeholder="例如：P城"
                value={tempMarkerForm.title}
                onChange={(e) => setTempMarkerForm({ ...tempMarkerForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>描述（可选）</Label>
              <Input
                placeholder="标记描述"
                value={tempMarkerForm.description}
                onChange={(e) => setTempMarkerForm({ ...tempMarkerForm, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              if (selectedTempMarker) {
                handleRemoveTempMarker(selectedTempMarker.id)
              }
              setTypeDialogOpen(false)
            }}>
              取消
            </Button>
            <Button onClick={handleTypeDialogConfirm}>
              确认添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
