-- Milkmen table
CREATE TABLE milkmen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pin TEXT NOT NULL CHECK (pin ~ '^\d{4}$'),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  sort_order INT DEFAULT 0
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  size TEXT NOT NULL,
  color TEXT NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0
);

-- Clipboard entries
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

-- Clipboard status
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

-- Absences
CREATE TABLE absences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milkman_id UUID NOT NULL REFERENCES milkmen(id),
  date DATE NOT NULL,
  covering_id UUID REFERENCES milkmen(id),
  UNIQUE(milkman_id, date)
);

-- Fridge counts
CREATE TABLE fridge_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  date DATE NOT NULL,
  quantity INT DEFAULT 0,
  counted_at TIMESTAMPTZ,
  UNIQUE(product_id, date)
);

-- Stock targets
CREATE TABLE stock_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('mon','tue','wed','thu','fri','sat')),
  target INT NOT NULL,
  UNIQUE(product_id, day_of_week)
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  supplier_email TEXT,
  email_body TEXT,
  sent_at TIMESTAMPTZ
);

-- Order items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INT NOT NULL
);

-- Day status
CREATE TABLE day_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  closed BOOLEAN DEFAULT false,
  closed_at TIMESTAMPTZ
);

-- Settings
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Indexes for performance
CREATE INDEX idx_clipboard_entries_milkman_date ON clipboard_entries(milkman_id, date);
CREATE INDEX idx_clipboard_entries_product_date ON clipboard_entries(product_id, date);
CREATE INDEX idx_clipboard_status_milkman_date ON clipboard_status(milkman_id, date);
CREATE INDEX idx_absences_date ON absences(date);
CREATE INDEX idx_fridge_counts_date ON fridge_counts(date);
CREATE INDEX idx_orders_date ON orders(date);
