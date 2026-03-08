# AGENTS.md - 开发规范指南

本文档为 AI 代理和开发者提供项目开发规范。

---

## 1. 项目概述

- **技术栈**: Next.js 14+ (App Router + SSR), TypeScript, shadcn/ui, Tailwind CSS, Leaflet + react-leaflet, Supabase (PostgreSQL + PostGIS), Cloudflare R2
- **类型语言**: TypeScript
- **目标**: PUBG 游戏地图交互式查询系统

---

## 2. 命令

### 2.1 开发命令

```bash
# 安装依赖
pnpm install

# 开发服务器
pnpm run dev

# 生产构建
pnpm run build

# 生产启动
pnpm run start
```

### 2.2 代码检查

```bash
# ESLint 检查
pnpm run lint

# TypeScript 类型检查
pnpm run typecheck

# 同时运行 lint 和 typecheck
pnpm run check
```

### 2.3 测试

```bash
# 运行所有测试
pnpm test

# 运行单个测试文件
pnpm test -- path/to/test.test.ts

# 运行单个测试（按名称过滤）
pnpm test -- -t "test name"

# 监听模式运行测试
pnpm test -- --watch

# 生成测试覆盖率
pnpm test -- --coverage
```

### 2.4 其他

```bash
# 安装 shadcn/ui 组件
npx shadcn add <component>

# 清理 node_modules 和 lock 文件后重新安装
rm -rf node_modules package-lock.json && pnpm install
```

---

## 3. 代码风格

### 3.1 TypeScript

- **严格模式**: 始终启用 strict 模式，所有类型必须明确
- **类型定义**: 使用需求文档中定义的数据库类型（见 `types/database.ts`）
- **接口 vs 类型**: 使用 `interface` 定义数据结构，`type` 用于联合类型和工具类型
- **any 禁止**: 禁止使用 `any`，使用 `unknown` 配合类型守卫
- **null 处理**: 使用可选链 `?.` 和空值合并 `??`

```typescript
// 正确示例 - 使用 PostGIS 几何类型
interface Marker {
  id: string;
  map_id: string;
  type_id: string;
  latlng: {
    type: string;
    coordinates: [number, number];  // [lng, lat]
  };
  title?: string;
  description?: string;
}

// 类型守卫示例
function isMarkerType(obj: unknown): obj is MarkerType {
  return obj !== null && typeof obj === 'object' && 'id' in obj;
}
```

### 3.2 导入规范

- **绝对导入**: 使用 `@/` 别名替代相对路径
- **顺序**: 外部库 → 内部模块 → 组件 → 类型/工具
- **命名导入**: 优先使用命名导入，保持树摇优化

```typescript
// 正确
import { useState, useEffect } from 'react';
import { createServerClient } from '@/lib/supabase/server';
import { Marker } from '@/types/database';
import { LeafletMap } from '@/components/map/LeafletMap';

// 错误
import { Button } from '../ui/button';
import { useMarker } from '../../hooks/useMarkers';
```

### 3.3 组件规范

- **文件命名**: 使用帕斯卡命名法（PascalCase）
  - 组件文件: `LeafletMap.tsx`
  - 工具文件: `useMarkers.ts`
  - 类型文件: `database.ts`
- **组件结构**: 遵循 Next.js App Router 约定
- **SSR 兼容**: 确保 Leaflet 组件仅在客户端渲染

```typescript
// 'use client' 标记客户端组件
'use client';

import { useEffect, useState } from 'react';

export function LeafletMap({ center, zoom }: LeafletMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return <div>地图内容</div>;
}
```

### 3.4 命名规范

| 类型 | 规则 | 示例 |
|------|------|------|
| 组件 | PascalCase | `MapSwitcher`, `MarkerFilter` |
| Hooks | camelCase，use 前缀 | `useMarkers`, `useAuth` |
| 变量/函数 | camelCase | `mapId`, `handleMarkerClick` |
| 常量 | UPPER_SNAKE_CASE | `MAX_ZOOM`, `DEFAULT_CENTER` |
| 接口/类型 | PascalCase | `Marker`, `MapProps` |
| 文件名 | kebab-case | `leaflet-map.tsx` |

### 3.5 格式化

- **缩进**: 2 空格
- **引号**: 单引号优先
- **分号**: 语句结尾使用分号
- **对象末尾**: 允许尾随逗号
- **行宽**: 最大 100 字符

```typescript
// 正确示例 - 使用 PostGIS 坐标
const marker: Marker = {
  id: 'uuid',
  map_id: 'map-uuid',
  type_id: 'type-uuid',
  latlng: {
    type: 'Point',
    coordinates: [126.5, 45.5],  // [lng, lat]
  },
};

// 组件属性
<MarkerPopup
  title={marker.title}
  description={marker.description}
  type={marker.marker_type}
/>
```

### 3.6 Tailwind CSS

- **类名顺序**: 布局 → 定位 → 尺寸 → 间距 → 背景 → 边框 → 文字 → 交互
- **响应式**: 移动优先 `mobile-first`，使用 `md:`、`lg:` 等断点
- **颜色**: 使用需求文档定义的颜色系统

```html
<!-- 正确顺序示例 -->
<div className="flex items-center justify-between w-full p-4 bg-slate-50 border-r border-slate-200">
  <span className="text-sm font-medium text-slate-900">标题</span>
  <Button className="hover:bg-slate-800">点击</Button>
</div>
```

### 3.7 错误处理

- **Supabase 错误**: 使用 `try-catch` 包装异步操作，提供用户友好的错误消息
- **边界情况**: 处理空数据、网络错误、权限不足等情况
- **类型安全**: 错误类型应明确

```typescript
async function fetchMarkers(mapId: string): Promise<Marker[]> {
  try {
    const { data, error } = await supabase
      .from('markers')
      .select('*, marker_type(*)')
      .eq('map_id', mapId);

    if (error) {
      console.error('获取标记失败:', error.message);
      throw new Error('无法加载标记数据');
    }

    return data || [];
  } catch (err) {
    console.error('网络错误:', err);
    return [];
  }
}
```

### 3.8 状态管理

- **客户端状态**: 使用 `useState` 和 `useReducer`
- **服务端数据**: 使用 Next.js App Router 的 Server Components 和 `fetch` 缓存
- **全局状态**: 避免过度使用 Context，优先考虑状态提升

---

## 4. 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/           # 公开页面
│   ├── admin/              # 后台管理
│   └── api/                # API 路由
├── components/
│   ├── ui/                 # shadcn/ui 组件
│   ├── map/                # 地图相关组件
│   └── admin/              # 后台管理组件
├── hooks/                  # 自定义 Hooks
├── lib/
│   ├── supabase/           # Supabase 客户端
│   ├── r2.ts              # Cloudflare R2 客户端
│   └── utils.ts            # 工具函数
└── types/
    └── database.ts         # 数据库类型定义
```

---

## 5. 数据库类型

使用需求文档定义的类型系统，确保类型与 Supabase 数据库一致：

```typescript
// types/database.ts 中的核心类型
interface Map {
  id: string;
  name: string;
  slug: string;
  tile_url: string;
  bounds?: { sw: [number, number]; ne: [number, number] };
  is_active: boolean;
}

interface MarkerType {
  id: string;
  name: string;
  icon_url?: string;
  color: string;
  sort_order: number;
  is_active: boolean;
}

interface Marker {
  id: string;
  map_id: string;
  type_id: string;
  latlng: {
    type: string;
    coordinates: [number, number];  // [lng, lat]
  };
  title?: string;
  description?: string;
}

// 坐标提取辅助函数
export function getMarkerCoords(marker: Marker): { lat: number; lng: number } {
  return {
    lat: marker.latlng.coordinates[1],
    lng: marker.latlng.coordinates[0],
  };
}
```

---

## 6. 坐标系统

使用 PostGIS 几何类型存储坐标，Supabase 自动处理坐标转换：

```typescript
// 存储坐标
await supabase.from('markers').insert({
  map_id: mapId,
  type_id: typeId,
  latlng: `SRID=3857;POINT(${lng} ${lat})`,
  title: '标记标题'
});

// 查询坐标
const { data } = await supabase.from('markers').select('*, marker_type(*)');
const markers = data.map(item => ({
  lat: item.latlng.coordinates[1],
  lng: item.latlng.coordinates[0],
}));
```

---

## 7. 组件开发注意事项

### 7.1 Leaflet 组件

- Leaflet 仅在浏览器环境运行，必须使用 `'use client'`
- 使用动态导入避免 SSR 问题
- 处理移动端触摸事件（仅地图查看页面需要适配移动端，后台管理系统不需要）

### 7.2 shadcn/ui 组件

- 通过 `npx shadcn add` 安装组件
- 组件位于 `components/ui/`，按需修改
- 使用 `cn()` 工具函数合并类名

### 7.3 后台管理

- 所有管理页面需检查用户认证状态
- 使用 Server Components 进行数据获取
- 表单验证使用 React Hook Form + Zod

---

## 8. 提交规范

```bash
# 提交信息格式
feat: 添加地图切换功能
fix: 修复标记显示问题
docs: 更新 README
refactor: 重构数据获取逻辑
test: 添加标记筛选测试
```

---

## 9. 环境变量

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
NEXT_PUBLIC_R2_DOMAIN=your-domain.r2.dev
```

---

## 10. 常用模式

### 10.1 SSR 数据获取

```typescript
// app/(public)/page.tsx
import { createServerClient } from '@/lib/supabase/server';

export default async function MapPage() {
  const supabase = createServerClient();
  
  const [maps, markerTypes, recommendations] = await Promise.all([
    supabase.from('maps').select('*').eq('is_active', true),
    supabase.from('marker_types').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('recommendations').select('*').eq('is_active', true).order('sort_order')
  ]);

  return (
    <MapClient
      initialMaps={maps.data || []}
      initialTypes={markerTypes.data || []}
      initialRecommendations={recommendations.data || []}
    />
  );
}
```

### 10.2 路由保护

```typescript
// app/admin/layout.tsx
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';

export default async function AdminLayout({ children }) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/admin/login');
  }

  return <>{children}</>;
}
```

### 10.3 Cloudflare R2 文件上传

```typescript
// lib/r2.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export function createR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export async function uploadFile(
  bucket: 'marker-icons' | 'recommendations',
  key: string,
  body: Buffer,
  contentType: string
) {
  const client = createR2Client();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  });
  
  await client.send(command);
  return `https://${process.env.NEXT_PUBLIC_R2_DOMAIN}/${key}`;
}
```

---

## 11. 部署

### 11.1 部署平台

使用 Cloudflare Workers + @opennextjs/cloudflare 部署 Next.js 应用。

### 11.2 部署命令

```bash
# 本地预览
pnpm run preview

# 部署生产
pnpm run deploy
```

### 11.3 配置文件

- `next.config.js` - 使用 `withCloudflare()` 包装配置
- `wrangler.toml` - Cloudflare Workers 配置（包含 R2 存储桶绑定）
- `public/_headers` - 静态资源缓存头
