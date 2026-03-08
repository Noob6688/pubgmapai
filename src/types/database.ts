export interface MapType {
  id: string
  name: string
  slug: string
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Map {
  id: string
  name: string
  slug: string
  tile_url: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MarkerType {
  id: string
  name: string
  icon_url: string | null
  color?: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface Marker {
  id: string
  map_id: string
  type_id: string
  latlng: {
    type: string
    coordinates: [number, number] // [lng, lat]
  }
  title: string | null
  description: string | null
  created_at: string
  updated_at: string
  marker_type?: MarkerType
  marker_types?: MarkerType
}

export function getMarkerCoords(marker: Marker): { lat: number; lng: number } {
  return {
    lat: marker.latlng.coordinates[1],
    lng: marker.latlng.coordinates[0],
  }
}

export interface Recommendation {
  id: string
  title: string
  image_url: string | null
  link_url: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface Setting {
  id: string
  key: string
  value: string | null
  description: string | null
  updated_at: string
}

export interface MapTypeMarkerType {
  id: string
  map_type_id: string
  marker_type_id: string
  created_at: string
}

export interface Route {
  id: string
  slug: string
  name: string
  description: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface RouteRecommendation {
  id: string
  route_id: string
  recommendation_id: string
  sort_order: number
  created_at: string
  recommendation?: Recommendation
}
