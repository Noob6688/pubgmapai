'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MapType, MarkerType } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { PageLoader } from '@/components/ui/loading'
import { Save, RefreshCw } from 'lucide-react'

interface MapTypeMarkerType {
  id: string
  map_type_id: string
  marker_type_id: string
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
  const { data } = await supabase
    .from('marker_types')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  return data || []
}

async function getAssociations(mapTypeId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('map_type_marker_types')
    .select('marker_type_id')
    .eq('map_type_id', mapTypeId)
  return data?.map(d => d.marker_type_id) || []
}

async function saveAssociations(mapTypeId: string, markerTypeIds: string[]) {
  const supabase = createClient()
  
  await supabase.from('map_type_marker_types').delete().eq('map_type_id', mapTypeId)
  
  if (markerTypeIds.length > 0) {
    const insertData = markerTypeIds.map(markerTypeId => ({
      map_type_id: mapTypeId,
      marker_type_id: markerTypeId,
    }))
    
    const { error } = await supabase.from('map_type_marker_types').insert(insertData)
    if (error) throw error
  }
  
  return true
}

export default function MapTypeMarkerTypesPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mapTypes, setMapTypes] = useState<MapType[]>([])
  const [markerTypes, setMarkerTypes] = useState<MarkerType[]>([])
  const [selectedMapTypeId, setSelectedMapTypeId] = useState<string>('')
  const [selectedMarkerIds, setSelectedMarkerIds] = useState<string[]>([])
  const dataLoadedRef = useRef(false)

  useEffect(() => {
    if (dataLoadedRef.current) return
    dataLoadedRef.current = true
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [mapTypesData, markerTypesData] = await Promise.all([
        getMapTypes(),
        getMarkerTypes(),
      ])
      setMapTypes(mapTypesData)
      setMarkerTypes(markerTypesData)
      
      if (mapTypesData.length > 0) {
        setSelectedMapTypeId(mapTypesData[0].id)
        const associations = await getAssociations(mapTypesData[0].id)
        setSelectedMarkerIds(associations)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('数据加载失败')
    } finally {
      setLoading(false)
    }
  }

  async function handleMapTypeChange(mapTypeId: string) {
    setSelectedMapTypeId(mapTypeId)
    const associations = await getAssociations(mapTypeId)
    setSelectedMarkerIds(associations)
  }

  async function handleSave() {
    if (!selectedMapTypeId) {
      toast.error('请选择地图类型')
      return
    }

    setSaving(true)
    try {
      await saveAssociations(selectedMapTypeId, selectedMarkerIds)
      toast.success('保存成功')
    } catch (error: any) {
      console.error('Save error:', error)
      toast.error(error.message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleMarkerTypeToggle = (markerTypeId: string, checked: boolean) => {
    if (checked) {
      setSelectedMarkerIds([...selectedMarkerIds, markerTypeId])
    } else {
      setSelectedMarkerIds(selectedMarkerIds.filter(id => id !== markerTypeId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMarkerIds(markerTypes.map(m => m.id))
    } else {
      setSelectedMarkerIds([])
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">地图类型关联管理</h1>
          <p className="text-muted-foreground">管理每个地图类型关联的标记类型</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={loadData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">选择地图类型</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mapTypes.map((mapType) => (
                <div
                  key={mapType.id}
                  className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                    selectedMapTypeId === mapType.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-slate-50'
                  }`}
                  onClick={() => handleMapTypeChange(mapType.id)}
                >
                  <div className="font-medium">{mapType.name}</div>
                  <div className="text-sm text-muted-foreground">{mapType.slug}</div>
                </div>
              ))}
              {mapTypes.length === 0 && (
                <p className="text-center text-muted-foreground py-4">暂无地图类型</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">关联的标记类型</CardTitle>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMarkerIds.length === markerTypes.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span>全选</span>
              </label>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {markerTypes.map((markerType) => (
                <label
                  key={markerType.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedMarkerIds.includes(markerType.id)}
                    onChange={(e) => handleMarkerTypeToggle(markerType.id, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: markerType.color || '#f59e0b' }}
                  />
                  <span className="font-medium">{markerType.name}</span>
                </label>
              ))}
              {markerTypes.length === 0 && (
                <p className="text-center text-muted-foreground py-4">暂无标记类型</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">当前关联预览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {selectedMapTypeId && selectedMarkerIds.length > 0 ? (
              <p>
                <span className="font-medium text-foreground">
                  {mapTypes.find(m => m.id === selectedMapTypeId)?.name}
                </span>
                {' '}关联了{' '}
                <span className="font-medium text-foreground">{selectedMarkerIds.length}</span> 个标记类型
              </p>
            ) : (
              <p>请选择地图类型并勾选关联的标记类型</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}