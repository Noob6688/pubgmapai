import dynamic from 'next/dynamic'

const MapViewClient = dynamic(
  () => import('@/components/map/MapViewClient'),
  { 
    ssr: false,
  }
)

interface PageProps {
  params: Promise<{ route?: string }>
}

export default async function PublicMapPage({ params }: PageProps) {
  const { route } = await params
  return <MapViewClient routeSlug={route || null} />
}
