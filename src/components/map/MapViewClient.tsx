'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [watermarkEnabled, setWatermarkEnabled] = useState(false)
  const [watermarkText, setWatermarkText] = useState('')
  const supabase = createClient()
  const dataLoadedRef = useRef(false)
  const touchStartY = useRef(0)
  const [drawerTranslateY, setDrawerTranslateY] = useState(0)
  const drawerMaxHeight = typeof window !== 'undefined' ? window.innerHeight * 0.7 : 0

  useEffect(() => {
    if (mobileDrawerOpen) {
      setDrawerTranslateY(0)
    }
  }, [mobileDrawerOpen])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
    if (dataLoadedRef.current) return
    dataLoadedRef.current = true

    async function fetchData() {
      try {
        const [
          logoUrlData,
          mapTypesResult,
          markerTypesResult,
          mapsResult,
          watermarkEnabledData,
          watermarkTextData,
        ] = await Promise.all([
          fetchSetting(supabase, 'logo_url'),
          supabase.from('map_types').select('*').eq('is_active', true).order('sort_order'),
          supabase.from('marker_types').select('*').eq('is_active', true).order('sort_order'),
          supabase.from('maps').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
          fetchSetting(supabase, 'watermark_enabled'),
          fetchSetting(supabase, 'watermark_text'),
        ])

        if (logoUrlData) setLogoUrl(logoUrlData)
        if (watermarkEnabledData) setWatermarkEnabled(watermarkEnabledData === 'true')
        if (watermarkTextData) setWatermarkText(watermarkTextData)

        const mapTypesData = mapTypesResult.data
        if (mapTypesData && mapTypesData.length > 0) {
          setMapTypes(mapTypesData)
          setSelectedMapType(mapTypesData[0])
        }

        const markerTypesData = markerTypesResult.data
        if (markerTypesData && markerTypesData.length > 0) {
          setAllMarkerTypes(markerTypesData)
          setSelectedMarkerTypeIds([markerTypesData[0].id])
        }

        const mapsData = mapsResult.data
        if (mapsData && mapsData.length > 0) {
          setMaps(mapsData)
          setSelectedMap(mapsData[0])
        }

        const firstMapTypeId = mapTypesData?.[0]?.id
        if (firstMapTypeId) {
          const markerTypeIds = await fetchMarkerTypeIdsByMapType(supabase, firstMapTypeId)
          setAssociatedMarkerTypeIds(markerTypeIds)
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
      <div className="flex h-[100dvh] w-full items-center justify-center bg-[#151922]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500"></div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        ${scrollbarStyles}
        .no-overscroll { overscroll-behavior-y: contain; }
      `}</style>
      <div className="flex h-[100dvh] w-full overflow-hidden no-overscroll">
        <aside 
          className={`hidden md:flex flex-col overflow-hidden border-r border-slate-800 bg-[#0d1b2a] transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? 'w-0' : 'w-[220px]'
          }`}
        >
          <div className={`flex flex-col overflow-y-auto p-4 custom-scrollbar ${sidebarCollapsed ? 'hidden' : ''}`}>
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
          <label className="mb-2 block text-sm font-medium text-slate-400">地图选择</label>
          <div className="flex flex-wrap gap-1">
            {mapTypes.map((mapType) => {
              const isSelected = selectedMapType?.id === mapType.id
              return (
                <button
                  key={mapType.id}
                  onClick={async () => {
                    const [markerTypeIds, { data: newMarkersData }] = await Promise.all([
                      fetchMarkerTypeIdsByMapType(supabase, mapType.id),
                      supabase.from('markers').select('*, marker_type:marker_types(*)').eq('map_id', mapType.id)
                    ])
                    
                    setSelectedMapType(mapType)
                    setAssociatedMarkerTypeIds(markerTypeIds)
                    
                    const firstAssociated = allMarkerTypes.find(mt => markerTypeIds.includes(mt.id))
                    setSelectedMarkerTypeIds(firstAssociated ? [firstAssociated.id] : [])
                    setMarkers(newMarkersData || [])
                  }}
                  className={`rounded px-2 py-1 text-xs font-medium transition-all duration-200 ${
                    isSelected
                      ? 'bg-yellow-500/30 text-yellow-400'
                      : 'bg-slate-800/30 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {mapType.name}
                </button>
              )
            })}
          </div>
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
        </div>
        </aside>

        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`hidden md:flex absolute top-1/2 z-[1000] h-8 w-4 -translate-y-1/2 items-center justify-center rounded-r-full bg-slate-700 text-white transition-all duration-300 hover:bg-slate-600 ${
            sidebarCollapsed 
              ? 'left-0' 
              : 'left-[220px]'
          }`}
        >
          <svg 
            className={`h-4 w-4 translate-x-1.25 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <main className="relative flex-1">
        <div className="hidden md:flex absolute left-1/2 top-4 z-[500] -translate-x-1/2 gap-1">
          {maps.map((map) => {
            const isSelected = selectedMap?.id === map.id
            return (
              <button
                key={map.id}
                onClick={() => setSelectedMap(map)}
                className={`rounded px-2 py-1 text-xs font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-yellow-500/30 text-yellow-400'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {map.name}
              </button>
            )
          })}
        </div>

        {/* Mobile Map Tabs - Top */}
        <div className="md:hidden absolute left-1/2 top-4 z-[500] flex -translate-x-1/2 gap-1 whitespace-nowrap">
          {maps.map((map) => {
            const isSelected = selectedMap?.id === map.id
            return (
              <button
                key={map.id}
                onClick={() => setSelectedMap(map)}
                className={`rounded px-2 py-1 text-[10px] font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-yellow-500/30 text-yellow-400'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {map.name}
              </button>
            )
          })}
        </div>

        {/* Mobile Drawer Toggle Button */}
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="md:hidden fixed bottom-6 right-4 z-[500] flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500 text-white shadow-lg active:scale-95 transition-transform"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {currentTileUrl ? (
          <div className="relative h-full w-full">
            <LeafletMap
              center={[-60, -90]}
              zoom={3}
              markers={filteredMarkers}
              map={{ tile_url: currentTileUrl }}
            />
            {watermarkEnabled && watermarkText && (
              <div className="pointer-events-none absolute inset-0 z-[400] overflow-hidden opacity-20">
                <div 
                  className="flex h-full w-full flex-wrap content-center justify-around gap-y-64 whitespace-nowrap"
                  style={{
                    transform: 'rotate(-30deg)',
                    fontSize: '40px',
                    color: 'white',
                  }}
                >
                  {Array(50).fill(watermarkText).map((text, i) => (
                    <span key={i} className="mx-24">{text}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#151922]">
            <p className="text-gray-400">暂无地图数据</p>
          </div>
        )}
      </main>

      {/* Mobile Bottom Drawer */}
      <div className={`md:hidden fixed inset-0 z-[1000] transition-all duration-300 ${mobileDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileDrawerOpen(false)}
        />
        <div 
          className={`absolute bottom-0 left-0 right-0 h-[65vh] flex flex-col rounded-t-3xl bg-[#0d1b2a] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-all duration-75 ${mobileDrawerOpen ? 'translate-y-0' : 'translate-y-full opacity-80 scale-95'}`}
          style={{ 
            transform: mobileDrawerOpen && drawerTranslateY > 0 ? `translateY(${drawerTranslateY}px)` : undefined,
            transition: drawerTranslateY > 0 ? 'none' : undefined
          }}
          onTouchStart={(e) => {
            const touch = e.touches[0]
            touchStartY.current = touch.clientY
          }}
          onTouchMoveCapture={(e) => {
            e.preventDefault()
          }}
          onTouchMove={(e) => {
            const touch = e.touches[0]
            const diff = touch.clientY - touchStartY.current
            if (diff > 0) {
              setDrawerTranslateY(diff)
            }
          }}
          onTouchEnd={(e) => {
            const threshold = drawerMaxHeight * 0.3
            if (drawerTranslateY > threshold) {
              setMobileDrawerOpen(false)
            }
            setDrawerTranslateY(0)
          }}
        >
            <div 
              className="flex h-8 cursor-grab active:cursor-grabbing items-center justify-center"
            >
              <div className="w-16 h-1.5 rounded-full bg-slate-600" />
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto p-4" style={{ paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}>
              <div className="mb-4 flex flex-col items-center">
                <div className="mb-2 h-16 w-16 overflow-hidden rounded-full shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                  <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
                </div>
              </div>

              <div className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent"></div>

              {associatedMarkerTypes.length > 0 && (
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-slate-400">标记类型</label>
                  <div className="flex flex-wrap gap-2">
                    {associatedMarkerTypes.map((markerType) => {
                      const isSelected = selectedMarkerTypeIds.includes(markerType.id)
                      return (
                        <button
                          key={markerType.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedMarkerTypeIds(selectedMarkerTypeIds.filter(id => id !== markerType.id))
                            } else {
                              setSelectedMarkerTypeIds([...selectedMarkerTypeIds, markerType.id])
                            }
                          }}
                          className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                            isSelected
                              ? 'bg-yellow-500/30 text-yellow-400 border border-yellow-500/50'
                              : 'bg-slate-800/50 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {markerType.icon_url ? (
                            <img src={markerType.icon_url} alt={markerType.name} className="h-4 w-4 object-contain" />
                          ) : (
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: markerType.color || '#f59e0b' }} />
                          )}
                          <span>{markerType.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent"></div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-slate-400">地图选择</label>
                <div className="flex flex-wrap gap-2">
                  {mapTypes.map((mapType) => {
                    const isSelected = selectedMapType?.id === mapType.id
                    return (
                      <button
                        key={mapType.id}
                        onClick={async () => {
                          const [markerTypeIds, { data: newMarkersData }] = await Promise.all([
                            fetchMarkerTypeIdsByMapType(supabase, mapType.id),
                            supabase.from('markers').select('*, marker_type:marker_types(*)').eq('map_id', mapType.id)
                          ])
                          
                          setSelectedMapType(mapType)
                          setAssociatedMarkerTypeIds(markerTypeIds)
                          
                          const firstAssociated = allMarkerTypes.find(mt => markerTypeIds.includes(mt.id))
                          setSelectedMarkerTypeIds(firstAssociated ? [firstAssociated.id] : [])
                          setMarkers(newMarkersData || [])
                        }}
                        className={`rounded px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                          isSelected
                            ? 'bg-yellow-500/30 text-yellow-400'
                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {mapType.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-auto h-px w-full bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent"></div>

              {recommendations.length > 0 && (
                <div className="mt-4">
                  <div className="grid grid-cols-2 gap-2">
                    {recommendations.map((rec) => (
                      <a
                        key={rec.id}
                        href={rec.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block overflow-hidden rounded-lg border border-slate-700/50 transition-all hover:border-orange-500/50"
                      >
                        {rec.image_url && (
                          <img
                            src={rec.image_url}
                            alt={rec.title}
                            className="h-[100px] w-full object-cover"
                          />
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
    </>
  )
}