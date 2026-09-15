import { useEffect, useState } from 'react'
import { getCurrentUser, onAuthStateChange } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getCurrentUser()
      .then(setUser)
      .catch((err) => {
        console.error('Failed to get current user:', err)
        setError(err.message)
      })
      .finally(() => setLoading(false))

    const subscription = onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  return { user, loading, error }
}
