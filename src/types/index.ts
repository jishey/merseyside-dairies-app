export interface Milkman {
  id: string
  name: string
  pin: string
  active: boolean
  created_at?: string
  sort_order: number
}

export interface Product {
  id: string
  name: string
  size: string
  color: string
  active: boolean
  sort_order: number
}

export interface ClipboardEntry {
  id: string
  milkman_id: string
  product_id: string
  date: string
  out: number
  back: number
  waste: number
  morning_out?: number
  created_at?: string
  updated_at?: string
}

export interface ClipboardStatus {
  id: string
  milkman_id: string
  date: string
  headed_out: boolean
  headed_out_at?: string
  submitted: boolean
  submitted_at?: string
}

export interface Absence {
  id: string
  milkman_id: string
  date: string
  covering_id?: string
}

export interface FridgeCount {
  id: string
  product_id: string
  date: string
  quantity: number
  counted_at?: string
}

export interface StockTarget {
  id: string
  product_id: string
  day_of_week: string
  target: number
}

export interface Order {
  id: string
  date: string
  supplier_email?: string
  email_body?: string
  sent_at?: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
}

export interface DayStatus {
  id: string
  date: string
  closed: boolean
  closed_at?: string
}

export interface Settings {
  key: string
  value: string
}
