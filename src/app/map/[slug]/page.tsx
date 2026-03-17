import dynamic from 'next/dynamic'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

const MapViewClient = dynamic(
  () => import('@/components/map/MapViewClient'),
  { 
    ssr: false,
  }
)

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function DynamicMapPage({ params }: PageProps) {
  const { slug } = await params
  
  const supabase = await createServerClient()
  
  const { data: routeData } = await supabase
    .from('routes')
    .select('id')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  
  if (!routeData) {
    redirect('/map')
  }
  
  return <MapViewClient routeSlug={slug} />
}
