'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Map } from '@/types/database'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Plus, RefreshCw, Trash2, Edit, ArrowUp, ArrowDown } from 'lucide-react'
import { toast } from 'sonner'
import { TableSkeleton } from '@/components/ui/loading'

type SortField = 'name' | 'slug' | 'created_at' | 'sort_order'
type SortDirection = 'asc' | 'desc'

async function getMaps() {
  const supabase = createClient()
  const { data } = await supabase
    .from('maps')
    .select('*')
    .order('sort_order', { ascending: true })
  return data || []
}

export default function MapsPage() {
  const supabase = createClient()
  const [maps, setMaps] = useState<Map[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>('sort_order')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const dataLoadedRef = useRef(false)

  useEffect(() => {
    if (dataLoadedRef.current) return
    dataLoadedRef.current = true
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const data = await getMaps()
      setMaps(data)
    } catch (error) {
      console.error('Failed to load maps:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedMaps = [...maps].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1
    
    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    return sortDirection === 'asc' ? comparison : -comparison
  })

  const handleMoveUp = async (index: number) => {
    if (index === 0) return
    
    const newMaps = [...sortedMaps]
    const currentMap = newMaps[index]
    const prevMap = newMaps[index - 1]
    
    const tempSortOrder = currentMap.sort_order
    currentMap.sort_order = prevMap.sort_order
    prevMap.sort_order = tempSortOrder
    
    try {
      await supabase.from('maps').update({ sort_order: currentMap.sort_order }).eq('id', currentMap.id)
      await supabase.from('maps').update({ sort_order: prevMap.sort_order }).eq('id', prevMap.id)
      
      newMaps[index] = prevMap
      newMaps[index - 1] = currentMap
      setMaps(newMaps)
      toast.success('排序已更新')
    } catch (error: any) {
      toast.error(error.message || '排序失败')
    }
  }

  const handleMoveDown = async (index: number) => {
    if (index === sortedMaps.length - 1) return
    
    const newMaps = [...sortedMaps]
    const currentMap = newMaps[index]
    const nextMap = newMaps[index + 1]
    
    const tempSortOrder = currentMap.sort_order
    currentMap.sort_order = nextMap.sort_order
    nextMap.sort_order = tempSortOrder
    
    try {
      await supabase.from('maps').update({ sort_order: currentMap.sort_order }).eq('id', currentMap.id)
      await supabase.from('maps').update({ sort_order: nextMap.sort_order }).eq('id', nextMap.id)
      
      newMaps[index] = nextMap
      newMaps[index + 1] = currentMap
      setMaps(newMaps)
      toast.success('排序已更新')
    } catch (error: any) {
      toast.error(error.message || '排序失败')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个地图吗？')) return

    try {
      const { error } = await supabase.from('maps').delete().eq('id', id)
      if (error) throw error

      toast.success('地图已删除')
      await loadData()
    } catch (error: any) {
      toast.error(error.message || '删除失败')
    }
  }

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-4 h-8 font-semibold"
        onClick={() => handleSort(field)}
      >
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
        )}
      </Button>
    </TableHead>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">地图管理</h1>
          <p className="text-muted-foreground">管理游戏地图</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={loadData} title="刷新">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button asChild>
            <Link href="/admin/maps/new">
              <Plus className="mr-2 h-4 w-4" />
              新增地图
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">排序</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-4 h-8 font-semibold"
                  onClick={() => handleSort('name')}
                >
                  名称
                  {sortField === 'name' && (
                    sortDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-4 h-8 font-semibold"
                  onClick={() => handleSort('slug')}
                >
                  标识符
                  {sortField === 'slug' && (
                    sortDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-4 h-8 font-semibold"
                  onClick={() => handleSort('created_at')}
                >
                  创建时间
                  {sortField === 'created_at' && (
                    sortDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                  )}
                </Button>
              </TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeleton rows={5} columns={6} />
            ) : sortedMaps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  暂无地图数据
                </TableCell>
              </TableRow>
            ) : (
              sortedMaps.map((map, index) => (
                <TableRow key={map.id}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === sortedMaps.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{map.name}</TableCell>
                  <TableCell>{map.slug}</TableCell>
                  <TableCell>{map.created_at ? new Date(map.created_at).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    {map.is_active ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        启用
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                        禁用
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/maps/${map.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            编辑
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(map.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
