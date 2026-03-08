import dynamic from 'next/dynamic'

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
  params: Promise<{ route?: string }>
}

export default async function PublicMapPage({ params }: PageProps) {
  const { route } = await params
  return <MapViewClient routeSlug={route || null} />
}
