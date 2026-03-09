-- Supabase RLS 策略初始化脚本
-- 在 Supabase SQL 编辑器中执行

-- ==================== maps ====================
ALTER TABLE maps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all reads on maps" ON maps;
CREATE POLICY "Allow all reads on maps" ON maps FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all inserts on maps" ON maps;
CREATE POLICY "Allow all inserts on maps" ON maps FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all updates on maps" ON maps;
CREATE POLICY "Allow all updates on maps" ON maps FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow all deletes on maps" ON maps;
CREATE POLICY "Allow all deletes on maps" ON maps FOR DELETE USING (true);

-- ==================== marker_types ====================
ALTER TABLE marker_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all reads on marker_types" ON marker_types;
CREATE POLICY "Allow all reads on marker_types" ON marker_types FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all inserts on marker_types" ON marker_types;
CREATE POLICY "Allow all inserts on marker_types" ON marker_types FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all updates on marker_types" ON marker_types;
CREATE POLICY "Allow all updates on marker_types" ON marker_types FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow all deletes on marker_types" ON marker_types;
CREATE POLICY "Allow all deletes on marker_types" ON marker_types FOR DELETE USING (true);

-- ==================== map_types ====================
ALTER TABLE map_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all reads on map_types" ON map_types;
CREATE POLICY "Allow all reads on map_types" ON map_types FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all inserts on map_types" ON map_types;
CREATE POLICY "Allow all inserts on map_types" ON map_types FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all updates on map_types" ON map_types;
CREATE POLICY "Allow all updates on map_types" ON map_types FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow all deletes on map_types" ON map_types;
CREATE POLICY "Allow all deletes on map_types" ON map_types FOR DELETE USING (true);

-- ==================== markers ====================
ALTER TABLE markers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all reads on markers" ON markers;
CREATE POLICY "Allow all reads on markers" ON markers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all inserts on markers" ON markers;
CREATE POLICY "Allow all inserts on markers" ON markers FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all updates on markers" ON markers;
CREATE POLICY "Allow all updates on markers" ON markers FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow all deletes on markers" ON markers;
CREATE POLICY "Allow all deletes on markers" ON markers FOR DELETE USING (true);

-- ==================== recommendations ====================
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all reads on recommendations" ON recommendations;
CREATE POLICY "Allow all reads on recommendations" ON recommendations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all inserts on recommendations" ON recommendations;
CREATE POLICY "Allow all inserts on recommendations" ON recommendations FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all updates on recommendations" ON recommendations;
CREATE POLICY "Allow all updates on recommendations" ON recommendations FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow all deletes on recommendations" ON recommendations;
CREATE POLICY "Allow all deletes on recommendations" ON recommendations FOR DELETE USING (true);

-- ==================== map_type_marker_types ====================
ALTER TABLE map_type_marker_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all reads on map_type_marker_types" ON map_type_marker_types;
CREATE POLICY "Allow all reads on map_type_marker_types" ON map_type_marker_types FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all inserts on map_type_marker_types" ON map_type_marker_types;
CREATE POLICY "Allow all inserts on map_type_marker_types" ON map_type_marker_types FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all updates on map_type_marker_types" ON map_type_marker_types;
CREATE POLICY "Allow all updates on map_type_marker_types" ON map_type_marker_types FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow all deletes on map_type_marker_types" ON map_type_marker_types;
CREATE POLICY "Allow all deletes on map_type_marker_types" ON map_type_marker_types FOR DELETE USING (true);

-- ==================== routes ====================
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all reads on routes" ON routes;
CREATE POLICY "Allow all reads on routes" ON routes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all inserts on routes" ON routes;
CREATE POLICY "Allow all inserts on routes" ON routes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all updates on routes" ON routes;
CREATE POLICY "Allow all updates on routes" ON routes FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow all deletes on routes" ON routes;
CREATE POLICY "Allow all deletes on routes" ON routes FOR DELETE USING (true);

-- ==================== route_recommendations ====================
ALTER TABLE route_recommendations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all reads on route_recommendations" ON route_recommendations;
CREATE POLICY "Allow all reads on route_recommendations" ON route_recommendations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all inserts on route_recommendations" ON route_recommendations;
CREATE POLICY "Allow all inserts on route_recommendations" ON route_recommendations FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all updates on route_recommendations" ON route_recommendations;
CREATE POLICY "Allow all updates on route_recommendations" ON route_recommendations FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow all deletes on route_recommendations" ON route_recommendations;
CREATE POLICY "Allow all deletes on route_recommendations" ON route_recommendations FOR DELETE USING (true);

-- ==================== settings ====================
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all reads on settings" ON settings;
CREATE POLICY "Allow all reads on settings" ON settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all updates on settings" ON settings;
CREATE POLICY "Allow all updates on settings" ON settings FOR UPDATE USING (true);
