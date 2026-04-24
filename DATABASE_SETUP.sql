-- 1. Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  parent_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create hero_config table
CREATE TABLE IF NOT EXISTS hero_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_name TEXT DEFAULT 'Master Cell',
  hero_image_url TEXT,
  hero_logo_url TEXT,
  carousel_title TEXT DEFAULT 'Destaques',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Add column to products table for "por_pedido" (on request)
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_on_request BOOLEAN DEFAULT false;

-- 4. Create product_highlights table
CREATE TABLE IF NOT EXISTS product_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id)
);

-- 5. Create default menu items
INSERT INTO menu_items (label, href, order_index, is_visible) VALUES
('Início', '/', 1, true),
('Produtos', '/produtos', 2, true),
('Apple', '/produtos?brand=Apple', 3, true),
('Samsung', '/produtos?brand=Samsung', 4, true),
('Xiaomi', '/produtos?brand=Xiaomi', 5, true),
('LG', '/produtos?brand=LG', 6, true),
('Motorola', '/produtos?brand=Motorola', 7, true)
ON CONFLICT DO NOTHING;

-- 6. Create default hero config
INSERT INTO hero_config (id, hero_name, carousel_title) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Master Cell', 'Destaques')
ON CONFLICT DO NOTHING;

-- 7. Enable RLS (Row Level Security) if needed
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_highlights ENABLE ROW LEVEL SECURITY;

-- 8. Create policies for public read access
CREATE POLICY "menu_items_read" ON menu_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "hero_config_read" ON hero_config FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "product_highlights_read" ON product_highlights FOR SELECT TO anon, authenticated USING (true);

-- 9. Create policies for admin write access (if using RLS with admin check)
-- Note: You'll need to set up a function to check if user is admin
-- For now, allow authenticated users with admin role
CREATE POLICY "menu_items_write" ON menu_items FOR ALL TO authenticated USING (
  (SELECT raw_user_meta_data->>'is_admin' FROM auth.users WHERE auth.users.id = auth.uid())::boolean = true
);
CREATE POLICY "hero_config_write" ON hero_config FOR ALL TO authenticated USING (
  (SELECT raw_user_meta_data->>'is_admin' FROM auth.users WHERE auth.users.id = auth.uid())::boolean = true
);
CREATE POLICY "product_highlights_write" ON product_highlights FOR ALL TO authenticated USING (
  (SELECT raw_user_meta_data->>'is_admin' FROM auth.users WHERE auth.users.id = auth.uid())::boolean = true
);
