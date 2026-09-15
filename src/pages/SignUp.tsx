import { useState } from 'react'
import { signUp } from '@/lib/auth'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Container } from '@/components/Container'
import { Card } from '@/components/Card'
import styles from './Auth.module.css'

interface SignUpProps {
  onSuccess: () => void
  onToggle: () => void
}

export function SignUp({ onSuccess, onToggle }: SignUpProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

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
      setError('Check your email to confirm your account')
      setTimeout(onSuccess, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to sign up')
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
            <Input
              type="password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            {error && <div className={`${styles.error} ${error.includes('Check') ? styles.success : ''}`}>{error}</div>}
            <Button type="submit" fullWidth loading={loading}>
              Create Account
            </Button>
          </form>

          <div className={styles.footer}>
            <p>
              Already have an account?{' '}
              <button type="button" onClick={onToggle} className={styles.link}>
                Sign in
              </button>
            </p>
          </div>
        </Card>
      </div>
    </Container>
  )
}
