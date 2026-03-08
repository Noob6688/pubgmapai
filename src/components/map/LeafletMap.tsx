'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

export interface MarkerType {
  id: string
  name: string
  icon_url?: string | null
  color?: string
}

export interface SavedMarker {
  id: string
  type_id: string
  latlng: {
    coordinates: [number, number]
  }
  title?: string | null
  description?: string | null
  marker_type?: MarkerType
  marker_types?: MarkerType
}

export interface TempMarker {
  id: string
  lat: number
  lng: number
  type_id?: string
  type_name?: string
  title?: string
  description?: string
}

interface LeafletMapProps {
  map?: {
    tile_url: string
    bounds?: { sw: [number, number]; ne: [number, number] }
  }
  center?: [number, number]
  zoom?: number
  markerTypes?: Array<MarkerType>
  selectedTypeIds?: string[]
  markers?: SavedMarker[]
  tempMarkers?: TempMarker[]
  onMarkerClick?: (marker: SavedMarker) => void
  onMarkerDelete?: (markerId: string) => void
  onMapClick?: (lat: number, lng: number) => void
  onTempMarkerRightClick?: (marker: TempMarker, e: L.LeafletMouseEvent) => void
  onTempMarkerDrag?: (markerId: string, lat: number, lng: number) => void
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void
  selectable?: boolean
  interactive?: boolean
}

function MapClickHandler({ 
  onClick, 
  selectable 
}: { 
  onClick?: (lat: number, lng: number) => void
  selectable?: boolean
}) {
  const map = useMapEvents({
    contextmenu: (e) => {
      e.originalEvent.preventDefault()
      
      if (!selectable || !onClick) return
      
      const target = e.originalEvent.target as HTMLElement
      const isMarker = target?.closest('.leaflet-marker-icon')
      const isPopup = target?.closest('.leaflet-popup')
      
      if (!isMarker && !isPopup) {
        onClick(e.latlng.lat, e.latlng.lng)
      }
    },
    dblclick: (e) => {
      L.DomEvent.stopPropagation(e)
    },
  })
  return null
}

function MapEvents({ center }: { center?: [number, number] }) {
  const map = useMap()
  
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom())
    }
  }, [center, map])
  
  return null
}

function TileLayerUpdater({ url }: { url: string }) {
  const map = useMap()
  
  useEffect(() => {
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        layer.setUrl(url)
      }
    })
  }, [url, map])
  
  return null
}

function MapBoundsHandler({ 
  onBoundsChange 
}: { 
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void
}) {
  const map = useMap()
  const onBoundsChangeRef = useRef(onBoundsChange)
  onBoundsChangeRef.current = onBoundsChange
  
  useEffect(() => {
    const updateBounds = () => {
      const bounds = map.getBounds()
      if (onBoundsChangeRef.current) {
        onBoundsChangeRef.current({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        })
      }
    }
    
    updateBounds()
    
    map.on('moveend', updateBounds)
    map.on('zoomend', updateBounds)
    
    return () => {
      map.off('moveend', updateBounds)
      map.off('zoomend', updateBounds)
    }
  }, [map])
  
  return null
}

function createIcon(iconUrl?: string | null, isTemp = false, color?: string) {
  const hasValidIconUrl = iconUrl && iconUrl.trim().length > 0 && isValidUrl(iconUrl.trim())
  
  if (hasValidIconUrl) {
    return L.icon({
      iconUrl: iconUrl.trim(),
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -16],
      className: 'custom-marker-icon',
    })
  }
  
  const markerColor = color || '#f59e0b'
  
  if (isTemp) {
    return L.divIcon({
      className: 'custom-marker temp-marker',
      html: `<div style="
        background-color: #3b82f6;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        z-index: 9999;
      "></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })
  }
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${markerColor};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      z-index: 9999;
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

export default function LeafletMap({ 
  map: mapData, 
  center = [0, 0],
  zoom = 2,
  markerTypes = [], 
  selectedTypeIds = [],
  markers = [],
  tempMarkers = [],
  onMarkerClick,
  onMarkerDelete,
  onMapClick,
  onTempMarkerRightClick,
  onTempMarkerDrag,
  onBoundsChange,
  selectable = false,
  interactive = true,
}: LeafletMapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [tooltipData, setTooltipData] = useState<{ id: string; title: string; lat: number; lng: number; x: number; y: number } | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    
    if (!mapInstanceRef.current) {
      const crs = L.extend({}, L.CRS.EPSG4326, {
        transformation: new L.Transformation(1 / 360, 0.5, 1 / 180, 0.5),
      }) as any

      const map = L.map('leaflet-map', {
        crs,
        minZoom: 0,
        maxZoom: 5,
        center: [0, 0],
        zoom: 2,
        zoomControl: false,
        attributionControl: false,
      }) as any

      map.options.continuousWorld = true
      map.options.worldCopyJump = false
      map.options.noWrap = true
      map.options.maxBoundsViscosity = 0

      const worldBounds = L.latLngBounds([[-90, -180], [90, 180]])
      map.setMaxBounds(worldBounds)

      if (onMapClick) {
        map.on('contextmenu', function(e: any) {
          const target = e.originalEvent.target as HTMLElement
          const isMarker = target?.closest('.leaflet-marker-icon')
          const isPopup = target?.closest('.leaflet-popup')
          
          if (!isMarker && !isPopup) {
            e.originalEvent.preventDefault()
            onMapClick(e.latlng.lat, e.latlng.lng)
          }
        })
      }

      mapInstanceRef.current = map
      markersLayerRef.current = L.layerGroup().addTo(map)

      if (mapData) {
        const bounds = L.latLngBounds([[-90, -180], [90, 180]])
        tileLayerRef.current = L.tileLayer(mapData.tile_url, {
          minZoom: 0,
          maxZoom: 5,
          tms: true,
          noWrap: true,
          tileSize: 256,
          bounds: bounds,
        }).addTo(map)
      }
    } else if (mapData && mapInstanceRef.current && tileLayerRef.current) {
      const currentUrl = (tileLayerRef.current as any)._url
      if (currentUrl !== mapData.tile_url) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current)
        
        const worldBounds = L.latLngBounds([[-90, -180], [90, 180]])
        tileLayerRef.current = L.tileLayer(mapData.tile_url, {
          minZoom: 0,
          maxZoom: 5,
          tms: true,
          noWrap: true,
          tileSize: 256,
          bounds: worldBounds,
        }).addTo(mapInstanceRef.current)
      }
    }
  }, [isMounted, onMapClick, mapData])

  useEffect(() => {
    if (!isMounted || !markersLayerRef.current || !mapInstanceRef.current) return

    markersLayerRef.current.clearLayers()

    markers.forEach((marker) => {
      const position: [number, number] = [
        marker.latlng.coordinates[1],
        marker.latlng.coordinates[0]
      ]

      const iconUrl = marker.marker_type?.icon_url
      const color = marker.marker_type?.color || '#f59e0b'

      let markerIcon
      if (iconUrl && iconUrl.trim().length > 0) {
        markerIcon = L.icon({
          iconUrl: iconUrl.trim(),
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
          className: 'custom-marker-icon',
        })
      } else {
        markerIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: ${color};
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            "></div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })
      }

      const leafletMarker = L.marker(position, { icon: markerIcon }).addTo(markersLayerRef.current!)
       
      if (onMarkerDelete) {
        leafletMarker.on('click', (e) => {
          const markerPos = e.target.getLatLng()
          const map = mapInstanceRef.current
          if (map) {
            const containerPoint = map.latLngToContainerPoint(markerPos)
            setTooltipData({
              id: marker.id,
              title: marker.title || '未命名',
              lat: markerPos.lat,
              lng: markerPos.lng,
              x: containerPoint.x,
              y: containerPoint.y,
            })
          }
        })
      }
       
      if (marker.title) {
        const popupContent = `
          <div style="min-width: 100px;">
            <strong>${marker.title}</strong>
            ${marker.description ? `<p style="margin: 5px 0 0;font-size: 12px;">${marker.description}</p>` : ''}
            ${marker.marker_type ? `<p style="margin: 5px 0 0;font-size: 11px;color: #666;">类型: ${marker.marker_type.name}</p>` : ''}
          </div>
        `
        leafletMarker.bindPopup(popupContent)
      }
    })

    tempMarkers.forEach((marker) => {
      const position: [number, number] = [marker.lat, marker.lng]
      
      const markerIcon = L.divIcon({
        className: 'custom-marker temp-marker',
        html: `
          <div style="
            position: relative;
            width: 40px;
            height: 40px;
            cursor: move;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
              <!-- 水平线 -->
              <line x1="0" y1="20" x2="40" y2="20" stroke="#f97316" stroke-width="2" opacity="0.8"/>
              <!-- 垂直线 -->
              <line x1="20" y1="0" x2="20" y2="40" stroke="#f97316" stroke-width="2" opacity="0.8"/>
              <!-- 中心透明圆点 -->
              <circle cx="20" cy="20" r="4" fill="transparent" stroke="#f97316" stroke-width="2" opacity="0.6"/>
              <!-- 外圈 -->
              <circle cx="20" cy="20" r="16" fill="none" stroke="#f97316" stroke-width="1" stroke-dasharray="4,2" opacity="0.4"/>
            </svg>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      })

      const leafletMarker = L.marker(position, { 
        icon: markerIcon,
        draggable: true,
      }).addTo(markersLayerRef.current!)

      if (onTempMarkerDrag) {
        leafletMarker.on('dragend', (e) => {
          const newPos = e.target.getLatLng()
          onTempMarkerDrag(marker.id, newPos.lat, newPos.lng)
        })
      }

      if (marker.title) {
        const popupContent = `
          <div style="min-width: 100px;">
            <strong>${marker.title}</strong>
            ${marker.description ? `<p style="margin: 5px 0 0;font-size: 12px;">${marker.description}</p>` : ''}
            <p style="margin: 5px 0 0;font-size: 11px;color: #666;">拖动标记可调整位置</p>
          </div>
        `
        leafletMarker.bindPopup(popupContent)
      }
    })
  }, [isMounted, markers, tempMarkers, markerTypes, onTempMarkerDrag])

  const handleTooltipDelete = () => {
    if (tooltipData && onMarkerDelete) {
      onMarkerDelete(tooltipData.id)
      setTooltipData(null)
    }
  }

  const handleTooltipClose = () => {
    setTooltipData(null)
  }

  if (!mapData) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#151922]">
        <p className="text-gray-400">暂无地图数据</p>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      <div id="leaflet-map" className="h-full w-full bg-[#151922]" />
      
      {tooltipData && (
        <div 
          className="absolute z-[1000] bg-white rounded-lg shadow-lg p-3 min-w-[160px]"
          style={{
            top: tooltipData.y - 10,
            left: tooltipData.x + 20,
          }}
        >
          <div className="text-sm font-medium text-gray-900 mb-2">{tooltipData.title}</div>
          <div className="text-xs text-gray-500 mb-2">
            {tooltipData.lat.toFixed(4)}, {tooltipData.lng.toFixed(4)}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleTooltipDelete}
              className="flex-1 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            >
              删除
            </button>
            <button
              onClick={handleTooltipClose}
              className="flex-1 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
