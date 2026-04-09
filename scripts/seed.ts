import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

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

const STOCK_TARGETS: Record<string, Record<number, number>> = {
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
    console.log('Inserted milkmen:', milkmenData.length, 'rows')

    // Insert products
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .insert(PRODUCTS_DATA)
      .select()

    if (productsError) throw productsError
    console.log('Inserted products:', productsData.length, 'rows')

    // Insert stock targets
    const targetsToInsert = []
    for (const [dayOfWeek, targets] of Object.entries(STOCK_TARGETS)) {
      for (const product of productsData) {
        targetsToInsert.push({
          product_id: product.id,
          day_of_week: dayOfWeek,
          target: targets[product.sort_order as number] || 40,
        })
      }
    }

    const { error: targetsError } = await supabase
      .from('stock_targets')
      .insert(targetsToInsert)

    if (targetsError) throw targetsError
    console.log('Inserted stock targets:', targetsToInsert.length, 'rows')

    // Insert default settings
    const { error: settingsError } = await supabase
      .from('settings')
      .insert([
        { key: 'supplier_email', value: 'supplier@dairy.co.uk' },
        { key: 'admin_username', value: 'john' },
        { key: 'admin_password', value: 'admin' },
      ])

    if (settingsError) throw settingsError
    console.log('Inserted settings: 3 rows')

    console.log('Seed completed successfully!')
  } catch (error) {
    console.error('Seed failed:', error)
    process.exit(1)
  }
}

seed()
