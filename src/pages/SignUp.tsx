import { useState } from 'react'
import { signUp } from '@/lib/auth'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Container } from '@/components/Container'
import { Card } from '@/components/Card'
import './SignUp.module.css'

interface SignUpProps {
  onSuccess: () => void
  onLogin: () => void
}

export function SignUp({ onSuccess, onLogin }: SignUpProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password || !confirmPassword) {
      setError('All fields are required')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await signUp(email, password)
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      <div style={styles.container}>
        <Card>
          <div style={styles.header}>
            <h1>Create Account</h1>
            <p>Sign up to start tracking your travel expenses</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            {error && <div style={styles.error}>{error}</div>}
            <Button type="submit" fullWidth size="lg" loading={loading}>
              Create Account
            </Button>
          </form>

          <div style={styles.footer}>
            <p>
              Already have an account?{' '}
              <button style={styles.link} onClick={onLogin}>
                Sign in
              </button>
            </p>
          </div>
        </Card>
      </div>
    </Container>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '2rem 0',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  error: {
    padding: '0.75rem',
    background: '#fee2e2',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    color: '#991b1b',
    fontSize: '0.875rem',
  },
  footer: {
    textAlign: 'center',
    borderTop: '1px solid #e5e7eb',
    paddingTop: '1.5rem',
  },
  link: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    cursor: 'pointer',
    fontWeight: '600',
    textDecoration: 'underline',
    padding: '0',
  },
}
