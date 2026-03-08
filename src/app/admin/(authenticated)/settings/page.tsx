'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Setting } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'

async function getSettings() {
  const supabase = createClient()
  const { data } = await supabase.from('settings').select('*').order('key')
  return data || []
}

export default function SettingsPage() {
  const supabase = createClient()
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const dataLoadedRef = useRef(false)

  useEffect(() => {
    if (dataLoadedRef.current) return
    dataLoadedRef.current = true
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const data = await getSettings()
      setSettings(data)
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (setting: Setting) => {
    setEditingKey(setting.key)
    setEditValue(setting.value || '')
  }

  const handleSave = async () => {
    if (!editingKey) return

    setSaving(true)
    try {
      const existingSetting = settings.find(s => s.key === editingKey)
      
      if (existingSetting) {
        const { error } = await supabase
          .from('settings')
          .update({ value: editValue })
          .eq('key', editingKey)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('settings')
          .insert({ key: editingKey, value: editValue })

        if (error) throw error
      }

      toast.success('设置已保存')
      setEditingKey(null)
      loadData()
    } catch (error: any) {
      toast.error(error.message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditingKey(null)
    setEditValue('')
  }

  const handleCreateLogoSetting = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('settings')
        .insert({ 
          key: 'logo_url', 
          value: 'https://r2.pubgmaptile.top/public/logo.png',
          description: '网站 Logo 图片地址'
        })

      if (error && error.code !== '23505') throw error
      
      toast.success('Logo 设置已创建')
      loadData()
    } catch (error: any) {
      toast.error(error.message || '创建失败')
    } finally {
      setSaving(false)
    }
  }

  const logoSetting = settings.find(s => s.key === 'logo_url')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">系统设置</h1>
        <p className="text-muted-foreground">管理网站系统配置</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logo 设置</CardTitle>
          <CardDescription>网站 Logo 图片配置</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-orange-500 shadow-lg">
                {logoSetting?.value ? (
                  <img
                    src={logoSetting.value}
                    alt="Logo 预览"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://r2.pubgmaptile.top/public/logo.png'
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-400">
                    无
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Logo 预览</p>
                <p className="text-xs text-slate-500">圆形显示，建议使用正方形图片</p>
              </div>
            </div>

            {editingKey === 'logo_url' ? (
              <div className="flex gap-2">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="输入 Logo 图片 URL"
                  className="max-w-md"
                />
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? '保存中' : '保存'}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  取消
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                {logoSetting ? (
                  <>
                    <Button variant="outline" onClick={() => handleEdit(logoSetting)}>
                      编辑 Logo
                    </Button>
                    <p className="flex items-center text-sm text-muted-foreground">
                      {logoSetting.value}
                    </p>
                  </>
                ) : (
                  <Button onClick={handleCreateLogoSetting} disabled={saving}>
                    添加 Logo
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>基本设置</CardTitle>
          <CardDescription>网站的基本配置信息</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">加载中...</p>
          ) : settings.length === 0 ? (
            <p className="text-center text-muted-foreground">暂无设置数据</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">键</TableHead>
                  <TableHead>值</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead className="w-[100px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.filter(s => s.key !== 'logo_url').map((setting) => (
                  <TableRow key={setting.id}>
                    <TableCell className="font-mono text-sm">{setting.key}</TableCell>
                    <TableCell>
                      {editingKey === setting.key ? (
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="max-w-md"
                        />
                      ) : (
                        <span className="font-mono text-sm text-muted-foreground">
                          {setting.value || '-'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {setting.description || '-'}
                    </TableCell>
                    <TableCell>
                      {editingKey === setting.key ? (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSave} disabled={saving}>
                            {saving ? '保存中' : '保存'}
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancel}>
                            取消
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleEdit(setting)}>
                          编辑
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>关于</CardTitle>
          <CardDescription>系统版本信息</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">版本：</span>1.0.0
            </p>
            <p>
              <span className="text-muted-foreground">构建时间：</span>
              {new Date().toLocaleDateString('zh-CN')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
