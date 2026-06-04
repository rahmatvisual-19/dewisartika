-- =============================================================================
-- SQL KEBIJAKAN RLS (ROW-LEVEL SECURITY) & TABEL TRACKING KUNJUNGAN
-- =============================================================================
-- Jalankan skrip ini di Supabase SQL Editor untuk mengatur izin akses orders,
-- order_items, dan membuat tabel tracking kunjungan halaman (page_views).

-- 1. Hapus kebijakan lama jika ada untuk menghindari konflik/error
DROP POLICY IF EXISTS "Allow public insert to orders" ON orders;
DROP POLICY IF EXISTS "Allow public insert to order_items" ON order_items;
DROP POLICY IF EXISTS "Allow auth select to orders" ON orders;
DROP POLICY IF EXISTS "Allow auth update to orders" ON orders;
DROP POLICY IF EXISTS "Allow auth delete to orders" ON orders;
DROP POLICY IF EXISTS "Allow auth select to order_items" ON order_items;
DROP POLICY IF EXISTS "Allow auth update to order_items" ON order_items;
DROP POLICY IF EXISTS "Allow auth delete to order_items" ON order_items;

-- 2. Kebijakan INSERT untuk Pembeli Publik (Agar pelanggan bisa checkout)
CREATE POLICY "Allow public insert to orders" 
ON orders 
FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "Allow public insert to order_items" 
ON order_items 
FOR INSERT 
TO public 
WITH CHECK (true);

-- 3. Kebijakan KONTROL PENUH untuk Admin Terautentikasi (Agar dashboard admin berfungsi)
CREATE POLICY "Allow auth select to orders" ON orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow auth update to orders" ON orders FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow auth delete to orders" ON orders FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow auth select to order_items" ON order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow auth update to order_items" ON order_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow auth delete to order_items" ON order_items FOR DELETE TO authenticated USING (true);

-- 4. Tabel Tracking Kunjungan Halaman (Page Views)
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  path TEXT NOT NULL,
  visitor_id TEXT NOT NULL
);

-- Mengaktifkan RLS pada page_views
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Kebijakan INSERT untuk Publik (Agar visitor terhitung)
DROP POLICY IF EXISTS "Allow public insert to page_views" ON page_views;
CREATE POLICY "Allow public insert to page_views" 
ON page_views 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Kebijakan SELECT untuk Admin Terautentikasi
DROP POLICY IF EXISTS "Allow auth select to page_views" ON page_views;
CREATE POLICY "Allow auth select to page_views" 
ON page_views 
FOR SELECT 
TO authenticated 
USING (true);
