-- ============================================
-- 1. CREATE TABLES
-- ============================================

CREATE TABLE milkmen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pin TEXT NOT NULL CHECK (pin ~ '^\d{4}$'),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  sort_order INT DEFAULT 0
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  size TEXT NOT NULL,
  color TEXT NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0
);

CREATE TABLE clipboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milkman_id UUID NOT NULL REFERENCES milkmen(id),
  product_id UUID NOT NULL REFERENCES products(id),
  date DATE NOT NULL,
  out INT DEFAULT 0,
  back INT DEFAULT 0,
  waste INT DEFAULT 0,
  morning_out INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(milkman_id, product_id, date)
);

CREATE TABLE clipboard_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milkman_id UUID NOT NULL REFERENCES milkmen(id),
  date DATE NOT NULL,
  headed_out BOOLEAN DEFAULT false,
  headed_out_at TIMESTAMPTZ,
  submitted BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ,
  UNIQUE(milkman_id, date)
);

CREATE TABLE absences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milkman_id UUID NOT NULL REFERENCES milkmen(id),
  date DATE NOT NULL,
  covering_id UUID REFERENCES milkmen(id),
  UNIQUE(milkman_id, date)
);

CREATE TABLE fridge_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  date DATE NOT NULL,
  quantity INT DEFAULT 0,
  counted_at TIMESTAMPTZ,
  UNIQUE(product_id, date)
);

CREATE TABLE stock_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('mon','tue','wed','thu','fri','sat')),
  target INT NOT NULL,
  UNIQUE(product_id, day_of_week)
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  supplier_email TEXT,
  email_body TEXT,
  sent_at TIMESTAMPTZ
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INT NOT NULL
);

CREATE TABLE day_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  closed BOOLEAN DEFAULT false,
  closed_at TIMESTAMPTZ
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Indexes
CREATE INDEX idx_clipboard_entries_milkman_date ON clipboard_entries(milkman_id, date);
CREATE INDEX idx_clipboard_entries_product_date ON clipboard_entries(product_id, date);
CREATE INDEX idx_clipboard_status_milkman_date ON clipboard_status(milkman_id, date);
CREATE INDEX idx_absences_date ON absences(date);
CREATE INDEX idx_fridge_counts_date ON fridge_counts(date);
CREATE INDEX idx_orders_date ON orders(date);

-- ============================================
-- 2. RLS POLICIES (allow all via anon key)
-- ============================================

ALTER TABLE milkmen ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON milkmen FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON products FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE clipboard_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON clipboard_entries FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE clipboard_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON clipboard_status FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE absences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON absences FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE fridge_counts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON fridge_counts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE stock_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON stock_targets FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON orders FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON order_items FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE day_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON day_status FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON settings FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 3. SEED DATA
-- ============================================

-- Milkmen
INSERT INTO milkmen (name, pin, sort_order) VALUES
  ('Ian',    '1234', 1),
  ('Gary',   '5678', 2),
  ('Andy',   '9012', 3),
  ('Joseph', '3456', 4),
  ('Tommy',  '7890', 5),
  ('Reg',    '2345', 6),
  ('Frank',  '6789', 7);

-- Products
INSERT INTO products (name, size, color, sort_order) VALUES
  ('Blue Milk',  '2 Litre', '#2563EB', 1),
  ('Green Milk', '2 Litre', '#16A34A', 2),
  ('Blue Milk',  '1 Litre', '#2563EB', 3),
  ('Green Milk', '1 Litre', '#16A34A', 4),
  ('Blue Milk',  'Pint',    '#2563EB', 5),
  ('Green Milk', 'Pint',    '#16A34A', 6);

-- Stock targets (uses subqueries to reference product UUIDs by sort_order)
INSERT INTO stock_targets (product_id, day_of_week, target)
SELECT p.id, d.dow, d.target
FROM products p
JOIN (VALUES
  (1, 'mon', 45), (2, 'mon', 40), (3, 'mon', 28), (4, 'mon', 25), (5, 'mon', 15), (6, 'mon', 12),
  (1, 'tue', 48), (2, 'tue', 42), (3, 'tue', 30), (4, 'tue', 27), (5, 'tue', 16), (6, 'tue', 13),
  (1, 'wed', 42), (2, 'wed', 38), (3, 'wed', 26), (4, 'wed', 23), (5, 'wed', 14), (6, 'wed', 11),
  (1, 'thu', 45), (2, 'thu', 40), (3, 'thu', 28), (4, 'thu', 25), (5, 'thu', 15), (6, 'thu', 12),
  (1, 'fri', 55), (2, 'fri', 48), (3, 'fri', 35), (4, 'fri', 30), (5, 'fri', 19), (6, 'fri', 15),
  (1, 'sat', 50), (2, 'sat', 45), (3, 'sat', 32), (4, 'sat', 28), (5, 'sat', 18), (6, 'sat', 14)
) AS d(sort_order, dow, target) ON p.sort_order = d.sort_order;

-- Settings
INSERT INTO settings (key, value) VALUES
  ('supplier_email', 'supplier@dairy.co.uk'),
  ('admin_username', 'john'),
  ('admin_password', 'admin');
