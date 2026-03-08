'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MapType, Map, Recommendation, Marker, MarkerType } from '@/types/database'
import LeafletMap from '@/components/map/LeafletMap'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(30, 41, 59, 0.5);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%);
  }
  .custom-scrollbar-x::-webkit-scrollbar {
    height: 6px;
  }
  .custom-scrollbar-x::-webkit-scrollbar-track {
    background: rgba(30, 41, 59, 0.5);
    border-radius: 3px;
  }
  .custom-scrollbar-x::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
    border-radius: 3px;
  }
  .custom-scrollbar-x::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%);
  }
  .leaflet-control-zoom a:focus-visible {
    outline: none !important;
    box-shadow: none !important;
  }
  .leaflet-control-attribution {
    display: none !important;
  }
`

function buildTileUrl(tileUrl: string, slug: string): string {
  const base = tileUrl.replace(/\/$/, '')
  return `${base}/${slug}/{z}/{x}/{y}.webp`
}

async function fetchMarkerTypeIdsByMapType(supabase: any, mapTypeId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('map_type_marker_types')
    .select('marker_type_id')
    .eq('map_type_id', mapTypeId)
  
  if (error) {
    return []
  }
  
  return (data || []).map((d: { marker_type_id: string }) => d.marker_type_id)
}

async function fetchSetting(supabase: any, key: string): Promise<string | null> {
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single()
  return data?.value || null
}

interface MapViewClientProps {
  routeSlug?: string | null
}

export default function MapViewClient({ routeSlug }: MapViewClientProps) {
  const [mapTypes, setMapTypes] = useState<MapType[]>([])
  const [maps, setMaps] = useState<Map[]>([])
  const [allMarkerTypes, setAllMarkerTypes] = useState<MarkerType[]>([])
  const [associatedMarkerTypeIds, setAssociatedMarkerTypeIds] = useState<string[]>([])
  const [selectedMarkerTypeIds, setSelectedMarkerTypeIds] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [markers, setMarkers] = useState<Marker[]>([])
  const [selectedMapType, setSelectedMapType] = useState<MapType | null>(null)
  const [selectedMap, setSelectedMap] = useState<Map | null>(null)
  const [logoUrl, setLogoUrl] = useState<string>('https://r2.pubgmaptile.top/public/logo.png')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const associatedMarkerTypes = useMemo(() => {
    return allMarkerTypes.filter(mt => associatedMarkerTypeIds.includes(mt.id))
  }, [allMarkerTypes, associatedMarkerTypeIds])

  const filteredMarkers = useMemo(() => {
    if (selectedMarkerTypeIds.length === 0) return []
    return markers.filter(m => 
      m.marker_type && selectedMarkerTypeIds.includes(m.marker_type.id)
    )
  }, [markers, selectedMarkerTypeIds])

  const currentTileUrl = useMemo(() => {
    if (!selectedMap || !selectedMapType) return null
    return buildTileUrl(selectedMap.tile_url, selectedMapType.slug)
  }, [selectedMap, selectedMapType])

  useEffect(() => {
    async function fetchData() {
      try {
        const [logoUrlData] = await Promise.all([
          fetchSetting(supabase, 'logo_url'),
        ])
        if (logoUrlData) setLogoUrl(logoUrlData)

        const { data: mapTypesData, error: mapTypesError } = await supabase
          .from('map_types')
          .select('*')
          .eq('is_active', true)
          .order('sort_order')

        if (!mapTypesError && mapTypesData) {
          setMapTypes(mapTypesData)
          if (mapTypesData.length > 0) {
            setSelectedMapType(mapTypesData[0])
            const markerTypeIds = await fetchMarkerTypeIdsByMapType(supabase, mapTypesData[0].id)
            setAssociatedMarkerTypeIds(markerTypeIds)
          }
        }

        const { data: markerTypesData, error: markerTypesError } = await supabase
          .from('marker_types')
          .select('*')
          .eq('is_active', true)
          .order('sort_order')

        if (!markerTypesError && markerTypesData) {
          setAllMarkerTypes(markerTypesData)
          const firstMarkerType = markerTypesData[0]
          if (firstMarkerType) {
            setSelectedMarkerTypeIds([firstMarkerType.id])
          }
        }

        const { data: mapsData, error: mapsError } = await supabase
          .from('maps')
          .select('*')
          .eq('is_active', true)
          .order('name')

        if (!mapsError && mapsData) {
          setMaps(mapsData)
          if (mapsData.length > 0) {
            setSelectedMap(mapsData[0])
          }
        }

        let recommendationsData: Recommendation[] = []
        
        if (routeSlug) {
          const { data: routeData } = await supabase
            .from('routes')
            .select('id')
            .eq('slug', routeSlug)
            .eq('is_active', true)
            .single()
          
          if (routeData) {
            const { data: routeRecsData } = await supabase
              .from('route_recommendations')
              .select('*, recommendation:recommendations(*)')
              .eq('route_id', routeData.id)
              .order('sort_order')
            
            if (routeRecsData) {
              recommendationsData = routeRecsData
                .filter((rr: any) => rr.recommendation?.is_active)
                .map((rr: any) => rr.recommendation)
            }
          }
        } else {
          const { data: allRecsData } = await supabase
            .from('recommendations')
            .select('*')
            .eq('is_active', true)
            .order('sort_order')
          
          if (allRecsData) {
            recommendationsData = allRecsData
          }
        }
        
        setRecommendations(recommendationsData)

        if (mapTypesData && mapTypesData.length > 0) {
          const firstMapTypeId = mapTypesData[0].id
          const { data: markersData, error: markersError } = await supabase
            .from('markers')
            .select('*, marker_type:marker_types(*)')
            .eq('map_id', firstMapTypeId)

          if (!markersError && markersData) {
            setMarkers(markersData)
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, routeSlug])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#151922]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500"></div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="flex h-screen w-full overflow-hidden">
      <aside className="flex w-[220px] flex-col overflow-y-auto border-r border-slate-800 bg-[#0d1b2a] p-4 custom-scrollbar">
        <div className="mb-4 flex flex-col items-center">
          <div className="mb-2 h-16 w-16 overflow-hidden rounded-full shadow-[0_0_20px_rgba(245,158,11,0.5)]">
            <img
              src={logoUrl}
              alt="Logo"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent"></div>

        {associatedMarkerTypes.length > 0 && (
          <div className="mb-4">
            <label className="mb-3 block text-sm font-medium text-slate-400">标记类型</label>
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar-x">
              {associatedMarkerTypes.map((markerType) => {
                const isSelected = selectedMarkerTypeIds.includes(markerType.id)
                return (
                  <label
                    key={markerType.id}
                    className={`group relative flex flex-shrink-0 cursor-pointer flex-col items-center gap-2 rounded-lg p-3 transition-all duration-300 ${
                      isSelected
                        ? 'scale-105 bg-slate-800 ring-1 ring-orange-500/30'
                        : 'bg-slate-800/30 hover:bg-slate-800'
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                      isSelected
                        ? 'scale-110 bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30'
                        : 'bg-slate-800 group-hover:bg-slate-700'
                    }`}>
                      {markerType.icon_url ? (
                        <img
                          src={markerType.icon_url}
                          alt={markerType.name}
                          className="h-6 w-6 object-contain"
                        />
                      ) : (
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: isSelected ? '#fff' : markerType.color || '#f59e0b' }}
                        />
                      )}
                    </div>
                    <span className={`text-xs font-medium transition-colors ${
                      isSelected ? 'text-orange-400' : 'text-slate-400 group-hover:text-slate-300'
                    }`}>
                      {markerType.name}
                    </span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMarkerTypeIds([...selectedMarkerTypeIds, markerType.id])
                        } else {
                          setSelectedMarkerTypeIds(selectedMarkerTypeIds.filter(id => id !== markerType.id))
                        }
                      }}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </label>
                )
              })}
            </div>
          </div>
        )}

        <div className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent"></div>

        <div className="mb-4">
          <label className="mb-3 block text-sm font-medium text-slate-400">地图选择</label>
          <Select
            value={selectedMapType?.id || ''}
            onValueChange={async (value) => {
              const selected = mapTypes.find(m => m.id === value)
              if (selected) {
                const [markerTypeIds, { data: newMarkersData }] = await Promise.all([
                  fetchMarkerTypeIdsByMapType(supabase, selected.id),
                  supabase.from('markers').select('*, marker_type:marker_types(*)').eq('map_id', selected.id)
                ])
                
                setSelectedMapType(selected)
                setAssociatedMarkerTypeIds(markerTypeIds)
                
                const firstAssociated = allMarkerTypes.find(mt => markerTypeIds.includes(mt.id))
                setSelectedMarkerTypeIds(firstAssociated ? [firstAssociated.id] : [])
                setMarkers(newMarkersData || [])
              }
            }}
          >
            <SelectTrigger className="w-full border-2 border-[#f59e0b] bg-slate-800/80 text-white transition-colors hover:bg-slate-800 focus-visible:ring-0 focus-visible:outline-none focus-visible:border-orange-400 shadow-none">
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

        <div className="mt-auto h-px w-full bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent"></div>

        {recommendations.length > 0 && (
          <div className="mt-4">
            <label className="mb-3 block text-sm font-medium text-slate-400">
              推荐站点
            </label>
            <div className="space-y-2">
              {recommendations.map((rec) => (
                <a
                  key={rec.id}
                  href={rec.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block overflow-hidden rounded-lg border border-slate-700/50 transition-all hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10"
                >
                  {rec.image_url && (
                    <img
                      src={rec.image_url}
                      alt={rec.title}
                      className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </a>
              ))}
            </div>
          </div>
        )}
      </aside>

      <main className="relative flex-1">
        <div className="absolute right-4 top-4 z-[1000]">
          <Select
            value={selectedMap?.id || ''}
            onValueChange={(value) => {
              const selected = maps.find(m => m.id === value)
              setSelectedMap(selected || null)
            }}
          >
            <SelectTrigger className="w-[180px] bg-slate-800 border-slate-600 text-white shadow-lg text-sm focus:ring-0 focus:outline-none">
              <SelectValue placeholder="选择切片" />
            </SelectTrigger>
            <SelectContent>
              {maps.map((map) => (
                <SelectItem key={map.id} value={map.id}>
                  {map.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentTileUrl ? (
          <div className="h-full w-full">
            <LeafletMap
              center={[-60, -90]}
              zoom={3}
              markers={filteredMarkers}
              map={{ tile_url: currentTileUrl }}
            />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#151922]">
            <p className="text-gray-400">暂无地图数据</p>
          </div>
        )}
      </main>
    </div>
    </>
  )
}