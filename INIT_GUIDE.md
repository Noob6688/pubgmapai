# 项目初始化指南

## 阶段一完成：项目框架已创建

以下文件已自动创建：

### 配置文件
- `package.json` - 项目依赖配置
- `tsconfig.json` - TypeScript 配置
- `next.config.js` - Next.js 配置
- `tailwind.config.ts` - Tailwind CSS 配置
- `postcss.config.js` - PostCSS 配置

### 源代码
- `src/app/globals.css` - 全局样式
- `src/app/layout.tsx` - 根布局
- `src/app/page.tsx` - 首页
- `src/lib/utils.ts` - 工具函数
- `src/lib/r2.ts` - Cloudflare R2 客户端
- `src/lib/supabase/client.ts` - 浏览器端 Supabase 客户端
- `src/lib/supabase/server.ts` - 服务端 Supabase 客户端
- `src/types/database.ts` - 数据库类型定义
- `src/components/ui/button.tsx` - Button 组件

### 数据库
- `supabase/init.sql` - 数据库初始化脚本

---

## 接下来需要你执行的操作

### 1. 安装依赖

在项目根目录执行：

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local`，并填入实际配置：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`，填入以下内容：
- `NEXT_PUBLIC_SUPABASE_URL` - 你的 Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - 你的 Supabase ANON KEY
- `CLOUDFLARE_ACCOUNT_ID` - 你的 Cloudflare 账户 ID
- `R2_ACCESS_KEY_ID` - R2 访问密钥 ID
- `R2_SECRET_ACCESS_KEY` - R2 密钥
- `NEXT_PUBLIC_R2_DOMAIN` - R2 域名

### 3. 初始化数据库

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 SQL Editor
4. 复制 `supabase/init.sql` 文件内容并执行

### 4. 创建 Cloudflare R2 存储桶

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 R2 存储桶
3. 创建两个存储桶：
   - `marker-icons` - 标记图标
   - `recommendations` - 推荐图片

### 5. 验证开发环境

执行以下命令验证：

```bash
npm run dev
```

如果一切正常，访问 http://localhost:3000 应该能看到项目首页。

---

## 后续开发任务

完成上述初始化后，我将自动继续以下任务：

1. 创建更多 shadcn/ui 组件
2. 实现后台管理系统
3. 实现地图查看页面
4. 配置部署

请完成上述步骤后告诉我，我将自动继续开发。
