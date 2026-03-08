import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Marker } from '@/types/database'

export function useMarkers(mapId?: string, typeIds?: string[]) {
  const [markers, setMarkers] = useState<Marker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMarkers() {
      try {
        const supabase = createClient()
        
        let query = supabase
          .from('markers')
          .select('*, marker_type(*)')

        if (mapId) {
          query = query.eq('map_id', mapId)
        }

        if (typeIds && typeIds.length > 0) {
          query = query.in('type_id', typeIds)
        }

        const { data, error } = await query

        if (error) throw error

        setMarkers(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch markers')
      } finally {
        setLoading(false)
      }
    }

    fetchMarkers()
  }, [mapId, typeIds?.join(',')])

  return { markers, loading, error }
}
