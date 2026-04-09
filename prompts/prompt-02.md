## Prompt 2: Supabase Schema + Seed Data

**Goal:** Create the database schema, migrations, and seed data in Supabase.

1. Create `supabase/migrations/001_schema.sql` with the complete schema:
   ```sql
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
     color TEXT NOT NULL CHECK (color ~ '^#[0-9A-F]{6}$'),
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
   ```

2. Create `scripts/seed.ts` to populate default data:
   ```typescript
   import { createClient } from '@supabase/supabase-js'

   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
   const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

   const supabase = createClient(supabaseUrl, supabaseServiceKey)

   const MILKMEN_DATA = [
     { name: 'Ian', pin: '1234', sort_order: 1 },
     { name: 'Gary', pin: '5678', sort_order: 2 },
     { name: 'Andy', pin: '9012', sort_order: 3 },
     { name: 'Joseph', pin: '3456', sort_order: 4 },
     { name: 'Tommy', pin: '7890', sort_order: 5 },
     { name: 'Reg', pin: '2345', sort_order: 6 },
     { name: 'Frank', pin: '6789', sort_order: 7 },
   ]

   const PRODUCTS_DATA = [
     { name: 'Blue Milk', size: '2 Litre', color: '#2563EB', sort_order: 1 },
     { name: 'Green Milk', size: '2 Litre', color: '#16A34A', sort_order: 2 },
     { name: 'Blue Milk', size: '1 Litre', color: '#2563EB', sort_order: 3 },
     { name: 'Green Milk', size: '1 Litre', color: '#16A34A', sort_order: 4 },
     { name: 'Blue Milk', size: 'Pint', color: '#2563EB', sort_order: 5 },
     { name: 'Green Milk', size: 'Pint', color: '#16A34A', sort_order: 6 },
   ]

   const STOCK_TARGETS = {
     mon: { 1: 45, 2: 40, 3: 28, 4: 25, 5: 15, 6: 12 },
     tue: { 1: 48, 2: 42, 3: 30, 4: 27, 5: 16, 6: 13 },
     wed: { 1: 42, 2: 38, 3: 26, 4: 23, 5: 14, 6: 11 },
     thu: { 1: 45, 2: 40, 3: 28, 4: 25, 5: 15, 6: 12 },
     fri: { 1: 55, 2: 48, 3: 35, 4: 30, 5: 19, 6: 15 },
     sat: { 1: 50, 2: 45, 3: 32, 4: 28, 5: 18, 6: 14 },
   }

   async function seed() {
     try {
       // Insert milkmen
       const { data: milkmenData, error: milkmenError } = await supabase
         .from('milkmen')
         .insert(MILKMEN_DATA)
         .select()

       if (milkmenError) throw milkmenError
       console.log('Inserted milkmen:', milkmenData)

       // Insert products
       const { data: productsData, error: productsError } = await supabase
         .from('products')
         .insert(PRODUCTS_DATA)
         .select()

       if (productsError) throw productsError
       console.log('Inserted products:', productsData)

       // Insert stock targets
       const targetsToInsert = []
       for (const [dayOfWeek, targets] of Object.entries(STOCK_TARGETS)) {
         for (const product of productsData) {
           targetsToInsert.push({
             product_id: product.id,
             day_of_week: dayOfWeek,
             target: targets[product.sort_order] || 40,
           })
         }
       }

       const { error: targetsError } = await supabase
         .from('stock_targets')
         .insert(targetsToInsert)

       if (targetsError) throw targetsError
       console.log('Inserted stock targets')

       // Insert default settings
       const { error: settingsError } = await supabase
         .from('settings')
         .insert([
           { key: 'supplier_email', value: 'supplier@dairy.co.uk' },
           { key: 'admin_username', value: 'john' },
           { key: 'admin_password', value: 'admin' },
         ])

       if (settingsError) throw settingsError
       console.log('Inserted settings')

       console.log('Seed completed successfully!')
     } catch (error) {
       console.error('Seed failed:', error)
       process.exit(1)
     }
   }

   seed()
   ```

3. Update `.env.local` to add the service role key (Luke will provide this from Supabase):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

4. Tell Luke:
   - Run the migration in the Supabase dashboard (SQL Editor), copy-paste the 001_schema.sql file
   - Add SUPABASE_SERVICE_ROLE_KEY to .env.local
   - Run `npx tsx scripts/seed.ts` to populate default data

**Verification:**
- Migration applies without errors in Supabase SQL Editor
- Seed script runs successfully: `npx tsx scripts/seed.ts`
- All 7 milkmen appear in the milkmen table
- All 6 products appear in the products table
- Stock targets populated for all products and days
- Settings table contains supplier_email, admin_username, admin_password

---
