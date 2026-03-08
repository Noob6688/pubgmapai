import dynamic from 'next/dynamic'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

const MapViewClient = dynamic(
  () => import('@/components/map/MapViewClient'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center bg-[#151922]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500"></div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    )
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
