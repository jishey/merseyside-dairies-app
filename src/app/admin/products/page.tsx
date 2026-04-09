'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Phone from '@/components/shared/Phone'
import BackBtn from '@/components/shared/BackBtn'
import Btn from '@/components/shared/Btn'
import BottomNav from '@/components/shared/BottomNav'
import { useAdmin } from '@/lib/auth/admin-context'
import { createClient } from '@/lib/supabase/client'
import { Check, Edit3, Trash2, Plus } from 'lucide-react'

interface ProductInfo {
  id: string
  name: string
  size: string
  color: string
  sort_order: number
}

const COLOURS = [
  { hex: '#2563EB', label: 'Blue' },
  { hex: '#16A34A', label: 'Green' },
  { hex: '#DC2626', label: 'Red' },
  { hex: '#EA580C', label: 'Orange' },
  { hex: '#CA8A04', label: 'Yellow' },
  { hex: '#7C3AED', label: 'Purple' },
  { hex: '#DB2777', label: 'Pink' },
  { hex: '#0D9488', label: 'Teal' },
]

export default function ProductsPage() {
  const router = useRouter()
  const { isAdmin, loading: authLoading } = useAdmin()
  const supabase = createClient()

  const [products, setProducts] = useState<ProductInfo[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editSize, setEditSize] = useState('')
  const [editColour, setEditColour] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSize, setNewSize] = useState('')
  const [newColour, setNewColour] = useState(COLOURS[0].hex)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/admin')
  }, [isAdmin, authLoading, router])

  useEffect(() => {
    if (isAdmin) loadProducts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('id, name, size, color, sort_order')
      .eq('active', true)
      .order('sort_order')

    if (data) setProducts(data)
  }

  const startEdit = (p: ProductInfo) => {
    setEditingId(p.id)
    setEditName(p.name)
    setEditSize(p.size)
    setEditColour(p.color)
  }

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return
    setSaving(true)

    await supabase
      .from('products')
      .update({ name: editName.trim(), size: editSize.trim(), color: editColour })
      .eq('id', editingId)

    setEditingId(null)
    await loadProducts()
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this product from all future clipboards?')) return
    setSaving(true)

    await supabase
      .from('products')
      .update({ active: false })
      .eq('id', id)

    setEditingId(null)
    await loadProducts()
    setSaving(false)
  }

  const handleAdd = async () => {
    if (!newName.trim()) return
    setSaving(true)

    const maxOrder = products.length > 0
      ? Math.max(...products.map((p) => p.sort_order))
      : 0

    await supabase.from('products').insert({
      name: newName.trim(),
      size: newSize.trim(),
      color: newColour,
      sort_order: maxOrder + 1,
      active: true,
    })

    setNewName('')
    setNewSize('')
    setNewColour(COLOURS[0].hex)
    setShowAdd(false)
    await loadProducts()
    setSaving(false)
  }

  const handleNav = (id: string) => {
    router.push(`/admin/${id}`)
  }

  if (authLoading || !isAdmin) return null

  return (
    <Phone bg="#F8FAFC">
      <div style={{ padding: '24px 20px 100px' }} className="screen-fade">
        <BackBtn onClick={() => router.push('/admin/settings')} />

        <h1 style={{
          fontSize: 32,
          fontWeight: 800,
          color: '#1E3A5F',
          margin: '0 0 24px',
          letterSpacing: '-0.02em',
        }}>
          Products
        </h1>

        {/* Product list */}
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              background: '#F8FAFC',
              borderRadius: 12,
              padding: 16,
              border: '2px solid #E2E8F0',
              borderLeft: `4px solid ${product.color}`,
              marginBottom: 14,
            }}
          >
            {editingId === product.id ? (
              /* Edit mode */
              <div>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Product name"
                  style={{
                    width: '100%',
                    padding: 12,
                    fontSize: 16,
                    borderRadius: 10,
                    border: '2px solid #E2E8F0',
                    marginBottom: 10,
                    boxSizing: 'border-box',
                  }}
                />
                <input
                  value={editSize}
                  onChange={(e) => setEditSize(e.target.value)}
                  placeholder="Size (e.g. 1 Litre)"
                  style={{
                    width: '100%',
                    padding: 12,
                    fontSize: 16,
                    borderRadius: 10,
                    border: '2px solid #E2E8F0',
                    marginBottom: 10,
                    boxSizing: 'border-box',
                  }}
                />

                {/* Colour palette */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
                  {COLOURS.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => setEditColour(c.hex)}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: c.hex,
                        border: editColour === c.hex
                          ? '3px solid #1E293B'
                          : '3px solid #E2E8F0',
                        boxShadow: editColour === c.hex
                          ? `0 0 0 3px #fff, 0 0 0 5px ${c.hex}`
                          : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                      }}
                    >
                      {editColour === c.hex && <Check size={18} color="#fff" />}
                    </button>
                  ))}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <Btn onClick={handleSaveEdit} color="#16A34A" disabled={saving}>
                      <Check size={20} /> Done
                    </Btn>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Btn onClick={() => handleDelete(product.id)} color="#DC2626" disabled={saving}>
                      <Trash2 size={20} /> Delete
                    </Btn>
                  </div>
                </div>
              </div>
            ) : (
              /* View mode */
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: product.color,
                  }} />
                  <div>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#1E3A5F' }}>
                      {product.name}
                    </span>
                    <span style={{ fontSize: 14, color: '#64748B', marginLeft: 8 }}>
                      {product.size}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => startEdit(product)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    border: '2px solid #E2E8F0',
                    background: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#64748B',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Edit3 size={14} /> Edit
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Add product section */}
        {showAdd ? (
          <div style={{
            background: '#F0FDF4',
            border: '2px solid #86EFAC',
            borderRadius: 12,
            padding: 16,
            marginTop: 14,
          }}>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Product name"
              style={{
                width: '100%',
                padding: 12,
                fontSize: 16,
                borderRadius: 10,
                border: '2px solid #E2E8F0',
                marginBottom: 10,
                boxSizing: 'border-box',
              }}
            />
            <input
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              placeholder="Size (e.g. 1 Litre)"
              style={{
                width: '100%',
                padding: 12,
                fontSize: 16,
                borderRadius: 10,
                border: '2px solid #E2E8F0',
                marginBottom: 10,
                boxSizing: 'border-box',
              }}
            />

            {/* Colour palette */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
              {COLOURS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setNewColour(c.hex)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: c.hex,
                    border: newColour === c.hex
                      ? '3px solid #1E293B'
                      : '3px solid #E2E8F0',
                    boxShadow: newColour === c.hex
                      ? `0 0 0 3px #fff, 0 0 0 5px ${c.hex}`
                      : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                  }}
                >
                  {newColour === c.hex && <Check size={18} color="#fff" />}
                </button>
              ))}
            </div>

            <Btn onClick={handleAdd} color="#16A34A" disabled={saving}>
              <Check size={20} /> Add Product
            </Btn>
          </div>
        ) : (
          <div style={{ marginTop: 14 }}>
            <Btn onClick={() => setShowAdd(true)} outline color="#16A34A">
              <Plus size={20} /> Add Product
            </Btn>
          </div>
        )}
      </div>

      <BottomNav active="settings" onNav={handleNav} />
    </Phone>
  )
}
