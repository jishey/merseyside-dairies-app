'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Phone from '@/components/shared/Phone'
import Page from '@/components/shared/Page'
import Btn from '@/components/shared/Btn'
import { useAdmin } from '@/lib/auth/admin-context'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const { login } = useAdmin()
  const [username, setUsername] = useState('john')
  const [password, setPassword] = useState('admin')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError('')

    const success = await login(username, password)
    if (success) {
      router.push('/admin/dashboard')
    } else {
      setError('Wrong username or password')
    }

    setLoading(false)
  }

  return (
    <Phone bg="#F8FAFC">
      <Page>
        {/* Gradient header */}
        <div style={{
          background: 'linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)',
          borderRadius: 20,
          padding: '28px 24px',
          textAlign: 'center',
          marginBottom: 32,
          boxShadow: '0 8px 24px rgba(30, 58, 95, 0.15)',
        }}>
          <img
            src="https://merseysidedairies.co.uk/wp-content/uploads/2016/04/Merseyside_Dairies_Logo_PNG.png"
            alt="Merseyside Dairies"
            style={{ height: 70, margin: '0 auto 16px', display: 'block' }}
          />
          <h1 style={{
            fontSize: 32,
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.02em',
            margin: 0,
          }}>
            Admin Login
          </h1>
        </div>

        {/* Username */}
        <div style={{ marginBottom: 20 }}>
          <label style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#64748B',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'block',
            marginBottom: 8,
          }}>
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: '100%',
              padding: 16,
              fontSize: 18,
              fontWeight: 600,
              borderRadius: 12,
              border: '2px solid #E2E8F0',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 24 }}>
          <label style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#64748B',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'block',
            marginBottom: 8,
          }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: 16,
                paddingRight: 52,
                fontSize: 18,
                fontWeight: 600,
                borderRadius: 12,
                border: '2px solid #E2E8F0',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94A3B8',
                padding: 4,
              }}
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#FEE2E2',
            border: '1px solid #FCA5A5',
            borderRadius: 10,
            padding: 12,
            textAlign: 'center',
            marginBottom: 20,
            color: '#DC2626',
            fontWeight: 800,
            fontSize: 14,
          }}>
            {error}
          </div>
        )}

        {/* Login button */}
        <Btn onClick={handleLogin} disabled={loading}>
          <Lock size={20} /> Log In
        </Btn>

        {/* Demo note */}
        <p style={{
          fontSize: 13,
          color: '#9CA3AF',
          textAlign: 'center',
          fontWeight: 600,
          margin: '16px 0 0',
        }}>
          (Demo: tap Log In to enter)
        </p>

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563EB',
              fontSize: 17,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Back to Milkman View
          </button>
        </div>
      </Page>
    </Phone>
  )
}
