import { useState } from 'react'
import { signIn } from '@/lib/auth'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Container } from '@/components/Container'
import { Card } from '@/components/Card'
import styles from './Login.module.css'

interface LoginProps {
  onSuccess: () => void
  onSignUp: () => void
}

export function Login({ onSuccess, onSignUp }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    setLoading(true)

    try {
      await signIn(email, password)
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      <div className={styles.container}>
        <Card>
          <div className={styles.header}>
            <h1>Travel Expense Tracker</h1>
            <p>Sign in to manage your trip expenses</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
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
            {error && <div className={styles.error}>{error}</div>}
            <Button type="submit" fullWidth size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          <div className={styles.footer}>
            <p>
              Don't have an account?{' '}
              <button className={styles.link} onClick={onSignUp}>
                Sign up
              </button>
            </p>
          </div>
        </Card>
      </div>
    </Container>
  )
}
