-- ============================================
-- PUBG 地图系统数据库初始化脚本
-- ============================================

-- 1. 启用 PostGIS 扩展
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. 创建 map_types 表（地图类型）
-- 注意：如果此表已存在，请勿重复执行
CREATE TABLE IF NOT EXISTS map_types (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. 创建 maps 表（地图切片信息）
CREATE TABLE IF NOT EXISTS maps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  tile_url text NOT NULL,
  bounds jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. 创建 marker_types 表（标记类型）
CREATE TABLE IF NOT EXISTS marker_types (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  icon_url text,
  color text DEFAULT '#f59e0b',
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 5. 创建 markers 表（标记）
-- 注意：需要先删除旧的外键约束，然后添加新的
-- 如果 markers 表已存在，请手动执行以下 SQL：
-- ALTER TABLE markers DROP CONSTRAINT IF EXISTS markers_map_id_fkey;
-- ALTER TABLE markers ADD CONSTRAINT markers_map_id_fkey FOREIGN KEY (map_id) REFERENCES map_types(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS markers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  map_id uuid REFERENCES map_types(id) ON DELETE CASCADE,
  type_id uuid REFERENCES marker_types(id),
  latlng geometry(Point, 3857),
  title text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. 创建 recommendations 表（站长推荐）
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  image_url text,
  link_url text NOT NULL,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 7. 创建 settings 表（系统设置）
CREATE TABLE IF NOT EXISTS settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  value text,
  description text,
  updated_at timestamptz DEFAULT now()
);

-- 8. 创建 map_type_marker_types 表（地图类型与标记类型关联）
CREATE TABLE IF NOT EXISTS map_type_marker_types (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  map_type_id uuid REFERENCES map_types(id) ON DELETE CASCADE,
  marker_type_id uuid REFERENCES marker_types(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(map_type_id, marker_type_id)
);

-- ============================================
-- 索引
-- ============================================

CREATE INDEX IF NOT EXISTS idx_markers_map_id ON markers(map_id);
CREATE INDEX IF NOT EXISTS idx_markers_type_id ON markers(type_id);
CREATE INDEX IF NOT EXISTS idx_markers_map_type ON markers(map_id, type_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_sort ON recommendations(sort_order) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_marker_types_sort ON marker_types(sort_order) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_map_types_sort ON map_types(sort_order) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_mtt_map_type ON map_type_marker_types(map_type_id);
CREATE INDEX IF NOT EXISTS idx_mtt_marker_type ON map_type_marker_types(marker_type_id);

-- ============================================
-- RLS 策略
-- ============================================

ALTER TABLE map_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE marker_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE markers ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- 公开读取策略
CREATE POLICY "Public map types are viewable" ON map_types FOR SELECT USING (is_active = true);
CREATE POLICY "Public maps are viewable" ON maps FOR SELECT USING (is_active = true);
CREATE POLICY "Public marker types are viewable" ON marker_types FOR SELECT USING (is_active = true);
CREATE POLICY "Public markers are viewable" ON markers FOR SELECT USING (true);
CREATE POLICY "Public recommendations are viewable" ON recommendations FOR SELECT USING (is_active = true);

-- 管理员写入策略
CREATE POLICY "Authenticated users can manage map_types" ON map_types FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage maps" ON maps FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage marker_types" ON marker_types FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage markers" ON markers FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage recommendations" ON recommendations FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- map_type_marker_types RLS
ALTER TABLE map_type_marker_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read map_type_marker_types" ON map_type_marker_types FOR SELECT USING (true);
CREATE POLICY "Auth can manage map_type_marker_types" ON map_type_marker_types FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- 初始数据
-- ============================================

-- 插入默认标记类型
INSERT INTO marker_types (name, color, sort_order) VALUES
  ('载具', '#3b82f6', 1),
  ('滑翔机', '#22c55e', 2),
  ('密室', '#f59e0b', 3)
ON CONFLICT DO NOTHING;

-- 插入示例地图类型（请根据实际情况修改）
INSERT INTO map_types (name, slug, description, sort_order) VALUES
  ('艾伦格', 'erangel', '绝地求生经典地图', 1),
  ('米拉玛', 'miramar', '绝地求生沙漠地图', 2)
ON CONFLICT (slug) DO NOTHING;

-- 插入示例地图切片信息（请根据实际情况修改 tile_url）
INSERT INTO maps (name, slug, tile_url) VALUES
  ('艾伦格', 'erangel', 'https://your-tile-server.com/erangel/{z}/{x}/{y}.png'),
  ('米拉玛', 'miramar', 'https://your-tile-server.com/miramar/{z}/{x}/{y}.png')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 注意事项
-- ============================================
-- 1. 执行此脚本前请确保已在 Supabase 仪表板中启用 PostGIS 扩展
-- 2. 管理员账号需要在 Supabase Dashboard 的 Authentication 中手动创建
-- 3. Cloudflare R2 存储桶需要在 Cloudflare 控制台中创建
-- 4. 创建存储桶后需要在 wrangler.toml 中配置绑定
-- 5. 如果 markers 表已存在，需要手动修改外键约束：
--    ALTER TABLE markers DROP CONSTRAINT IF EXISTS markers_map_id_fkey;
--    ALTER TABLE markers ADD CONSTRAINT markers_map_id_fkey FOREIGN KEY (map_id) REFERENCES map_types(id) ON DELETE CASCADE;