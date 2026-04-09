'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AdminContextType {
  isAdmin: boolean
  loading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  loading: true,
  login: async () => false,
  logout: () => {},
})

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = sessionStorage.getItem('isAdmin')
    if (stored === 'true') {
      setIsAdmin(true)
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const supabase = createClient()

    const { data: usernameRow } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'admin_username')
      .single()

    const { data: passwordRow } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'admin_password')
      .single()

    if (
      usernameRow?.value === username &&
      passwordRow?.value === password
    ) {
      setIsAdmin(true)
      sessionStorage.setItem('isAdmin', 'true')
      return true
    }

    return false
  }, [])

  const logout = useCallback(() => {
    setIsAdmin(false)
    sessionStorage.removeItem('isAdmin')
  }, [])

  return (
    <AdminContext.Provider value={{ isAdmin, loading, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  return useContext(AdminContext)
}
