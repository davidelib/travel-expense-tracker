import { useState } from 'react'
import { signIn } from '@/lib/auth'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Container } from '@/components/Container'
import { Card } from '@/components/Card'
import styles from './Auth.module.css'

interface LoginProps {
  onSuccess: () => void
  onToggle: () => void
}

export function Login({ onSuccess, onToggle }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
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
            <p>Track your expenses on the go</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            {error && <div className={styles.error}>{error}</div>}
            <Button type="submit" fullWidth loading={loading}>
              Sign In
            </Button>
          </form>

          <div className={styles.footer}>
            <p>
              Don't have an account?{' '}
              <button type="button" onClick={onToggle} className={styles.link}>
                Sign up
              </button>
            </p>
          </div>
        </Card>
      </div>
    </Container>
  )
}
