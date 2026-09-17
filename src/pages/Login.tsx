import { useState } from 'react'
import { signIn } from '@/lib/auth'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Container } from '@/components/Container'
import { Card } from '@/components/Card'

interface LoginProps { onSuccess: () => void; onSignUp: () => void }

export function Login({ onSuccess, onSignUp }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) return setError('Email and password are required')

    setLoading(true)
    try {
      await signIn(email, password)
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      <div style={pageStyle}>
        <Card>
          <div style={headerStyle}>
            <h1>Travel Expense Tracker</h1>
            <p>Sign in to manage your trip expenses</p>
          </div>
          <form onSubmit={handleSubmit} style={formStyle}>
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
            <div style={passwordFieldStyle}>
              <Input label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              <button type="button" style={toggleStyle} onClick={() => setShowPassword((visible) => !visible)} aria-pressed={showPassword}>
                {showPassword ? 'Hide password' : 'Show password'}
              </button>
            </div>
            {error && <div style={errorStyle}>{error}</div>}
            <Button type="submit" fullWidth size="lg" loading={loading}>Sign In</Button>
          </form>
          <div style={footerStyle}>
            <p>Don't have an account? <button type="button" style={linkStyle} onClick={onSignUp}>Sign up</button></p>
          </div>
        </Card>
      </div>
    </Container>
  )
}

const pageStyle: React.CSSProperties = { padding: '2rem 0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }
const headerStyle: React.CSSProperties = { textAlign: 'center', marginBottom: '2rem' }
const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }
const passwordFieldStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '.5rem' }
const toggleStyle: React.CSSProperties = { alignSelf: 'flex-start', background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0, fontSize: '.875rem' }
const errorStyle: React.CSSProperties = { padding: '.75rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, color: '#991b1b', fontSize: '.875rem' }
const footerStyle: React.CSSProperties = { textAlign: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }
const linkStyle: React.CSSProperties = { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline', padding: 0 }
