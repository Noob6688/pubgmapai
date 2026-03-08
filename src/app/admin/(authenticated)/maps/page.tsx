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
import { MoreHorizontal, Plus, RefreshCw, Trash2, Edit } from 'lucide-react'
import { toast } from 'sonner'
import { TableSkeleton } from '@/components/ui/loading'

async function getMaps() {
  const supabase = createClient()
  const { data } = await supabase
    .from('maps')
    .select('*')
    .order('created_at', { ascending: false })
  return data || []
}

export default function MapsPage() {
  const supabase = createClient()
  const [maps, setMaps] = useState<Map[]>([])
  const [loading, setLoading] = useState(true)

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
              <TableHead>名称</TableHead>
              <TableHead>标识符</TableHead>
              <TableHead>切片地址</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeleton rows={5} columns={5} />
            ) : maps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  暂无地图数据
                </TableCell>
              </TableRow>
            ) : (
              maps.map((map) => (
                <TableRow key={map.id}>
                  <TableCell className="font-medium">{map.name}</TableCell>
                  <TableCell>{map.slug}</TableCell>
                  <TableCell className="max-w-xs truncate">{map.tile_url}</TableCell>
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
