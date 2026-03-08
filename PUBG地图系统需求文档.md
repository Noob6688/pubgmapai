# PUBG地图系统需求文档

## 1. 项目概述

### 1.1 项目背景
为PUBG（绝地求生）游戏玩家提供一个交互式地图查询系统，支持多地图、多类型标记的展示和管理。系统包含面向玩家的地图展示网站和面向管理员的后台管理系统。

### 1.2 项目目标
- 提供直观、流畅的游戏地图浏览体验
- 支持多种标记类型的显示和筛选
- 实现管理员对地图数据的便捷编辑
- 确保SEO友好，便于搜索引擎收录

### 1.3 技术栈
- **前端框架**: Next.js 14+ (App Router + SSR)
- **UI框架**: shadcn/ui + Tailwind CSS
- **地图引擎**: Leaflet + react-leaflet
- **后端服务**: Supabase (PostgreSQL + Auth + Storage)
- **图标库**: Lucide React
- **类型语言**: TypeScript

### 1.4 约束条件
- 无需国际化支持
- 移动端必须适配
- 对接已有地图切片服务
- 用户无需注册登录即可查看地图

---

## 2. 功能需求

### 2.1 前端地图展示网站

#### 2.1.1 页面布局

**桌面端布局**:
- 左侧固定边栏（宽度：280px）
  - 标记类型筛选区域
  - 站长推荐展示区域
- 主区域：全屏地图展示区域
- 顶部工具栏
  - Logo和网站名称
  - 地图选择下拉框
  - 服务器选择（如适用）

**移动端布局**:
- 顶部简化工具栏
  - Logo（小尺寸）
  - 地图选择器
  - 筛选按钮（呼出底部抽屉）
- 主区域：全屏地图（支持手势操作）
- 底部抽屉面板（Sheet组件）
  - 标记类型筛选
  - 滑动或点击关闭

#### 2.1.2 核心功能

| 功能编号 | 功能名称 | 功能描述 | 优先级 |
|---------|---------|---------|--------|
| F-001 | 地图切换 | 支持下拉选择不同的游戏地图（艾伦格、米拉玛等），切换时标记数据同步更新 | P0 |
| F-002 | 标记显示/隐藏 | 通过复选框控制不同类型标记的显示与隐藏，支持全选/取消全选 | P0 |
| F-003 | 标记点击查看 | 点击地图上的标记，弹出信息卡片显示标记详情（标题、描述、类型） | P0 |
| F-004 | 地图缩放平移 | 支持鼠标滚轮缩放、拖拽平移；移动端支持双指缩放、单指平移 | P0 |
| F-005 | 坐标系统 | 使用相对坐标（0-100）存储标记位置，适配不同尺寸的地图 | P1 |
| F-006 | URL状态同步 | 筛选状态和当前地图同步到URL参数，便于分享和SEO | P1 |

#### 2.1.3 标记类型

默认标记类型包括：

1. **载具** - 车辆刷新点
2. **滑翔机** - 滑翔机刷新点  
3. **密室** - 密室位置标记

标记类型属性：
- 名称
- 图标（支持自定义上传）
- 颜色标识
- 显示顺序

#### 2.1.4 站长推荐

在侧边栏展示推荐内容：
- 标题
- 缩略图
- 链接地址
- 排序权重

### 2.2 后台管理系统

#### 2.2.1 认证系统

- **登录方式**: 通过Supabase Auth进行身份验证
- **账号管理**: 管理员账号通过Supabase Dashboard预创建，系统不提供注册功能
- **会话管理**: JWT Token持久化，支持"记住我"功能
- **权限控制**: 不区分权限等级，所有管理员拥有相同权限

#### 2.2.2 管理模块

**仪表盘模块**
- 系统概览统计卡片
  - 地图总数
  - 标记总数
  - 标记类型数量
  - 推荐内容数量
- 快捷操作入口

**地图管理模块**

| 功能 | 描述 |
|-----|------|
| 地图列表 | 表格展示所有地图，包含名称、标识符、切片地址、标记数量、操作按钮 |
| 新增地图 | 表单输入：名称、URL标识符、切片服务地址、地图边界（可选） |
| 编辑地图 | 修改地图基本信息 |
| 删除地图 | 软删除地图（隐藏但保留数据），需二次确认 |

**标记管理模块**
- 地图选择器：先选择要管理的地图
- 标记列表：
  - 表格展示该地图下的所有标记
  - 支持按类型筛选
  - 支持搜索标记标题
  - 分页展示（每页20条）
- 新增标记：
  - 在地图编辑器上点击添加
  - 自动获取点击位置的坐标
  - 填写标记信息：类型、标题、描述
- 编辑标记：
  - 修改标记信息
  - 在地图上拖拽调整位置
- 删除标记：单个删除或批量删除
- 导入导出：支持CSV格式批量导入导出标记数据

**标记类型管理模块**
- 类型列表：
  - 名称、图标预览、颜色、排序
  - 是否启用开关
- 新增类型：
  - 名称输入
  - 图标上传（支持PNG/SVG，存储到Supabase Storage）
  - 颜色选择器
- 编辑类型：修改类型信息
- 删除类型：删除前检查是否有关联标记
- 排序调整：拖拽调整显示顺序

**站长推荐管理模块**
- 推荐列表：标题、图片、链接、排序、状态
- 新增推荐：
  - 标题输入
  - 图片上传
  - 链接地址
  - 排序权重
- 编辑推荐：修改推荐内容
- 删除推荐：移除推荐项
- 启用/禁用：控制推荐是否显示

**系统设置模块**
- 地图切片服务地址配置
- 网站基本信息设置（名称、Logo等）

---

## 3. 数据库设计

### 3.1 表结构

#### maps（地图表）
```sql
create table maps (
  id uuid default gen_random_uuid() primary key,
  name text not null,                    -- 地图显示名称
  slug text unique not null,             -- URL标识符
  tile_url text not null,                -- 切片服务地址
  bounds jsonb,                          -- 地图边界坐标 {sw: [lat, lng], ne: [lat, lng]}
  is_active boolean default true,        -- 是否启用
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

#### marker_types（标记类型表）
```sql
create table marker_types (
  id uuid default gen_random_uuid() primary key,
  name text not null,                    -- 类型名称（如：载具、滑翔机）
  icon_url text,                         -- 图标URL（存储在Supabase Storage）
  color text default '#f59e0b',          -- 标识颜色（HEX格式）
  sort_order int default 0,              -- 显示顺序
  is_active boolean default true,        -- 是否启用
  created_at timestamptz default now()
);
```

#### markers（标记表）
```sql
create table markers (
  id uuid default gen_random_uuid() primary key,
  map_id uuid references maps(id) on delete cascade,
  type_id uuid references marker_types(id),
  x float not null check (x >= 0 and x <= 100),      -- 相对X坐标 0-100
  y float not null check (y >= 0 and y <= 100),      -- 相对Y坐标 0-100
  title text,                            -- 标记标题
  description text,                      -- 详细描述
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

#### recommendations（站长推荐表）
```sql
create table recommendations (
  id uuid default gen_random_uuid() primary key,
  title text not null,                   -- 推荐标题
  image_url text,                        -- 图片URL
  link_url text not null,                -- 链接地址
  sort_order int default 0,              -- 排序权重
  is_active boolean default true,        -- 是否显示
  created_at timestamptz default now()
);
```

#### settings（系统设置表）
```sql
create table settings (
  id uuid default gen_random_uuid() primary key,
  key text unique not null,              -- 设置项键名
  value text,                            -- 设置项值
  description text,                      -- 设置说明
  updated_at timestamptz default now()
);
```

### 3.2 索引设计

```sql
-- 标记查询优化
create index idx_markers_map_id on markers(map_id);
create index idx_markers_type_id on markers(type_id);
create index idx_markers_map_type on markers(map_id, type_id);

-- 推荐列表排序
create index idx_recommendations_sort on recommendations(sort_order) where is_active = true;

-- 类型排序
create index idx_marker_types_sort on marker_types(sort_order) where is_active = true;
```

### 3.3 Row Level Security (RLS)

```sql
-- 启用RLS
alter table maps enable row level security;
alter table marker_types enable row level security;
alter table markers enable row level security;
alter table recommendations enable row level security;

-- 公开读取策略（所有人可读）
create policy "Public maps are viewable" on maps
  for select using (is_active = true);

create policy "Public marker types are viewable" on marker_types
  for select using (is_active = true);

create policy "Public markers are viewable" on markers
  for select using (true);

create policy "Public recommendations are viewable" on recommendations
  for select using (is_active = true);

-- 管理员写入策略（仅认证用户可写）
create policy "Authenticated users can manage maps" on maps
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated users can manage marker_types" on marker_types
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated users can manage markers" on markers
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated users can manage recommendations" on recommendations
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
```

### 3.4 存储桶配置

```sql
-- 创建图标存储桶
insert into storage.buckets (id, name, public) 
values ('marker-icons', 'marker-icons', true);

-- 创建推荐图片存储桶
insert into storage.buckets (id, name, public) 
values ('recommendations', 'recommendations', true);

-- 公开访问策略
create policy "Public marker icons access" on storage.objects
  for select using (bucket_id = 'marker-icons');

create policy "Public recommendations images access" on storage.objects
  for select using (bucket_id = 'recommendations');

-- 管理员上传策略
create policy "Authenticated users can upload marker icons" on storage.objects
  for insert with check (
    bucket_id = 'marker-icons' 
    and auth.role() = 'authenticated'
  );

create policy "Authenticated users can upload recommendation images" on storage.objects
  for insert with check (
    bucket_id = 'recommendations' 
    and auth.role() = 'authenticated'
  );
```

---

## 4. 接口设计

### 4.1 API 端点

由于使用Supabase，大部分操作通过Supabase Client直接访问数据库，无需自定义API。但以下场景需要特殊处理：

#### 文件上传
- **端点**: `/api/upload`
- **方法**: POST
- **描述**: 上传标记图标或推荐图片到Supabase Storage
- **请求**: multipart/form-data
- **响应**: `{ url: string }`

#### 批量导入
- **端点**: `/api/markers/import`
- **方法**: POST
- **描述**: CSV文件批量导入标记
- **请求**: `{ mapId: string, csvData: string }`
- **响应**: `{ success: number, failed: number, errors: string[] }`

### 4.2 数据类型定义

```typescript
// types/database.ts

// 地图
export interface Map {
  id: string;
  name: string;
  slug: string;
  tile_url: string;
  bounds?: {
    sw: [number, number];
    ne: [number, number];
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 标记类型
export interface MarkerType {
  id: string;
  name: string;
  icon_url: string | null;
  color: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

// 标记
export interface Marker {
  id: string;
  map_id: string;
  type_id: string;
  x: number;  // 0-100
  y: number;  // 0-100
  title: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  // 关联数据
  marker_type?: MarkerType;
}

// 站长推荐
export interface Recommendation {
  id: string;
  title: string;
  image_url: string | null;
  link_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

// 系统设置
export interface Setting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
  updated_at: string;
}
```

---

## 5. 界面设计规范

### 5.1 响应式断点

```css
/* Tailwind默认断点 */
sm: 640px   /* 手机横屏 */
md: 768px   /* 平板 */
lg: 1024px  /* 桌面 */
xl: 1280px  /* 大屏桌面 */
```

### 5.2 桌面端布局规范

**侧边栏**:
- 宽度: 280px (w-72)
- 背景: bg-slate-50
- 边框: border-r border-slate-200
- 内边距: p-4

**地图区域**:
- 全屏高度: h-screen
- 相对定位: relative
- 层级: z-0

**标记筛选器**:
- 标题: text-sm font-medium text-slate-900
- 复选框: 使用shadcn/ui Checkbox组件
- 间距: space-y-2

**标记弹窗**:
- 最大宽度: max-w-xs (320px)
- 圆角: rounded-lg
- 阴影: shadow-lg
- 背景: bg-white

### 5.3 移动端布局规范

**顶部栏**:
- 高度: h-14 (56px)
- 背景: bg-slate-900 text-white
- 固定定位: fixed top-0

**底部抽屉**:
- 触发按钮: 固定在右下角，圆形按钮
- 抽屉高度: 最大70%屏幕高度
- 关闭方式: 点击遮罩、向下滑动、点击关闭按钮

**触摸目标**:
- 最小尺寸: 44px × 44px
- 标记点击区域: 适当放大便于触摸

### 5.4 颜色方案

**主色调**:
- Primary: slate-900 (#0f172a)
- Primary Hover: slate-800 (#1e293b)

**强调色**:
- Accent: amber-500 (#f59e0b) - 用于标记高亮
- Success: green-500 (#22c55e)
- Danger: red-500 (#ef4444)
- Warning: yellow-500 (#eab308)

**中性色**:
- Background: white / slate-50
- Border: slate-200
- Text Primary: slate-900
- Text Secondary: slate-600
- Text Muted: slate-400

### 5.5 字体规范

- 基础字体: system-ui, -apple-system, sans-serif (Tailwind默认)
- 标题: font-semibold
- 正文: font-normal
- 小字: text-sm
- 标签: text-xs uppercase tracking-wide

---

## 6. 组件清单

### 6.1 shadcn/ui 组件

需安装的组件列表：

```bash
npx shadcn add \
  button \
  card \
  input \
  label \
  select \
  checkbox \
  dialog \
  sheet \
  table \
  tabs \
  sonner \
  dropdown-menu \
  tooltip \
  scroll-area \
  separator \
  skeleton
```

### 6.2 自定义组件

#### 地图相关

| 组件名 | 路径 | 描述 |
|--------|------|------|
| LeafletMap | components/map/LeafletMap.tsx | 地图容器组件，包含TileLayer初始化 |
| MapMarkers | components/map/MapMarkers.tsx | 标记渲染组件，处理标记数据和事件 |
| MarkerPopup | components/map/MarkerPopup.tsx | 标记弹窗内容组件 |
| MarkerFilter | components/map/MarkerFilter.tsx | 标记筛选器，桌面端侧边栏/移动端抽屉 |
| MapSwitcher | components/map/MapSwitcher.tsx | 地图切换下拉框 |

#### 后台管理

| 组件名 | 路径 | 描述 |
|--------|------|------|
| AdminSidebar | components/admin/AdminSidebar.tsx | 后台侧边栏导航 |
| AdminHeader | components/admin/AdminHeader.tsx | 后台顶部栏，包含用户信息 |
| DataTable | components/admin/DataTable.tsx | 通用数据表格，支持排序、筛选 |
| MapEditor | components/admin/MapEditor.tsx | 地图编辑器，用于添加/编辑标记 |
| ImageUploader | components/admin/ImageUploader.tsx | 图片上传组件，集成Supabase Storage |
| ColorPicker | components/admin/ColorPicker.tsx | 颜色选择器封装 |
| ConfirmDialog | components/admin/ConfirmDialog.tsx | 确认对话框 |

#### 移动端专用

| 组件名 | 路径 | 描述 |
|--------|------|------|
| MobileFilter | components/mobile/MobileFilter.tsx | 移动端筛选抽屉内容 |
| MobileHeader | components/mobile/MobileHeader.tsx | 移动端顶部栏 |
| BottomSheet | components/mobile/BottomSheet.tsx | 底部抽屉容器（如需要自定义） |

### 6.3 自定义Hooks

```typescript
// hooks/useSupabase.ts
export function useSupabaseClient() { ... }
export function useSupabaseServer() { ... }

// hooks/useMarkers.ts
export function useMarkers(mapId: string, typeIds?: string[]) { ... }

// hooks/useAuth.ts
export function useAuth() { ... }
```

---

## 7. 项目结构

```
my-app/
├── app/
│   ├── layout.tsx                    # 根布局
│   ├── page.tsx                      # 首页（公开地图页）
│   ├── globals.css                   # 全局样式
│   ├── (public)/                     # 公开页面分组
│   │   ├── page.tsx                  # 地图展示页面（SSR）
│   │   └── layout.tsx                # 公开页面布局
│   ├── admin/                        # 后台管理路由
│   │   ├── login/
│   │   │   └── page.tsx              # 登录页
│   │   ├── layout.tsx                # 后台布局（含侧边栏）
│   │   ├── page.tsx                  # 仪表盘（默认页）
│   │   ├── maps/
│   │   │   └── page.tsx              # 地图管理
│   │   ├── markers/
│   │   │   └── page.tsx              # 标记管理
│   │   ├── marker-types/
│   │   │   └── page.tsx              # 标记类型管理
│   │   ├── recommendations/
│   │   │   └── page.tsx              # 站长推荐管理
│   │   └── settings/
│   │       └── page.tsx              # 系统设置
│   └── api/                          # API路由（如需）
│       └── upload/
│           └── route.ts              # 文件上传接口
├── components/
│   ├── ui/                           # shadcn/ui 组件（自动生成）
│   ├── map/                          # 地图相关组件
│   │   ├── LeafletMap.tsx
│   │   ├── MapMarkers.tsx
│   │   ├── MarkerPopup.tsx
│   │   ├── MarkerFilter.tsx
│   │   └── MapSwitcher.tsx
│   ├── admin/                        # 后台管理组件
│   │   ├── AdminSidebar.tsx
│   │   ├── AdminHeader.tsx
│   │   ├── DataTable.tsx
│   │   ├── MapEditor.tsx
│   │   ├── ImageUploader.tsx
│   │   └── ConfirmDialog.tsx
│   └── mobile/                       # 移动端专用组件
│       ├── MobileFilter.tsx
│       └── MobileHeader.tsx
├── hooks/
│   ├── useSupabase.ts
│   ├── useMarkers.ts
│   └── useAuth.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # 浏览器客户端
│   │   ├── server.ts                 # 服务端客户端
│   │   └── middleware.ts             # 中间件配置
│   └── utils.ts                      # 工具函数
├── types/
│   └── database.ts                   # TypeScript类型定义
├── public/
│   └── images/                       # 静态图片资源
└── config/
    └── site.ts                       # 网站配置
```

---

## 8. 关键实现细节

### 8.1 SSR数据获取

```typescript
// app/(public)/page.tsx
import { createServerClient } from '@/lib/supabase/server';

export default async function MapPage() {
  const supabase = createServerClient();
  
  // 并行获取数据
  const [
    { data: maps },
    { data: markerTypes },
    { data: recommendations }
  ] = await Promise.all([
    supabase.from('maps').select('*').eq('is_active', true),
    supabase.from('marker_types').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('recommendations').select('*').eq('is_active', true).order('sort_order')
  ]);

  return (
    <MapClient 
      initialMaps={maps || []}
      initialTypes={markerTypes || []}
      initialRecommendations={recommendations || []}
    />
  );
}
```

### 8.2 Leaflet坐标映射

```typescript
// lib/coordinates.ts

// 数据库坐标 (0-100) 转 Leaflet坐标
export function toLeafletCoord(x: number, y: number, mapBounds: [[number, number], [number, number]]) {
  const [[minLat, minLng], [maxLat, maxLng]] = mapBounds;
  const lat = minLat + (y / 100) * (maxLat - minLat);
  const lng = minLng + (x / 100) * (maxLng - minLng);
  return [lat, lng];
}

// Leaflet坐标转数据库坐标 (0-100)
export function toDbCoord(lat: number, lng: number, mapBounds: [[number, number], [number, number]]) {
  const [[minLat, minLng], [maxLat, maxLng]] = mapBounds;
  const x = ((lng - minLng) / (maxLng - minLng)) * 100;
  const y = ((lat - minLat) / (maxLat - minLat)) * 100;
  return { x, y };
}
```

### 8.3 移动端检测

```typescript
// hooks/useMediaQuery.ts
import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

// 使用
const isMobile = useMediaQuery('(max-width: 768px)');
```

### 8.4 认证路由保护

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

  return (
    <div className="flex h-screen">
      <AdminSidebar user={session.user} />
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}
```

---

## 9. 部署配置

### 9.1 环境变量

```bash
# .env.local (开发环境)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# .env.production (生产环境)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 9.2 部署平台推荐

**推荐**: Vercel
- 原生支持Next.js
- 自动CI/CD
- Edge Network加速
- Serverless Functions

**部署步骤**:

1. 推送代码到GitHub仓库
2. 在Vercel导入项目
3. 配置环境变量
4. 自动部署

### 9.3 Supabase配置检查

- [ ] RLS策略已启用
- [ ] 存储桶公开访问已配置
- [ ] CORS允许Vercel域名
- [ ] 管理员账号已创建

---

## 10. 测试清单

### 10.1 功能测试

**前端地图页**:
- [ ] 地图正确加载显示
- [ ] 标记正确渲染在对应位置
- [ ] 标记筛选功能正常
- [ ] 点击标记显示弹窗
- [ ] 地图缩放平移流畅
- [ ] URL参数同步正确

**后台管理**:
- [ ] 登录功能正常
- [ ] 会话持久化
- [ ] 地图CRUD操作正常
- [ ] 标记CRUD操作正常
- [ ] 地图编辑器点击添加标记
- [ ] 图片上传成功
- [ ] 数据实时同步

### 10.2 移动端测试

- [ ] iOS Safari地图加载正常
- [ ] Android Chrome手势操作正常
- [ ] 底部抽屉动画流畅
- [ ] 触摸目标大小合适
- [ ] 横屏/竖屏切换正常

### 10.3 性能测试

- [ ] 首屏加载时间 < 3秒
- [ ] 地图标记渲染流畅（> 30fps）
- [ ] 大量标记（>100）时性能可接受

---

## 11. 维护与扩展

### 11.1 后续可扩展功能

- [ ] 标记搜索功能
- [ ] 路线规划功能
- [ ] 用户收藏标记
- [ ] 标记评分/反馈
- [ ] 数据统计分析
- [ ] API开放接口
- [ ] 多语言支持

### 11.2 监控与日志

建议集成：
- Vercel Analytics（性能监控）
- Supabase Dashboard（数据库监控）
- Sentry（错误追踪）

---

## 12. 附录

### 12.1 默认标记类型数据

```sql
-- 初始化标记类型
insert into marker_types (name, color, sort_order) values
  ('载具', '#3b82f6', 1),
  ('滑翔机', '#22c55e', 2),
  ('密室', '#f59e0b', 3);
```

### 12.2 默认地图数据

```sql
-- 初始化地图（示例）
insert into maps (name, slug, tile_url) values
  ('艾伦格', 'erangel', 'https://your-tile-server.com/erangel/{z}/{x}/{y}.png'),
  ('米拉玛', 'miramar', 'https://your-tile-server.com/miramar/{z}/{x}/{y}.png');
```

### 12.3 依赖版本参考

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/ssr": "^0.0.10",
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1",
    "lucide-react": "^0.292.0",
    "tailwind-merge": "^2.0.0",
    "clsx": "^2.0.0"
  },
  "devDependencies": {
    "@types/leaflet": "^1.9.8",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "typescript": "^5.0.0"
  }
}
```

---

**文档版本**: 1.0  
**创建日期**: 2024年  
**最后更新**: 2024年
