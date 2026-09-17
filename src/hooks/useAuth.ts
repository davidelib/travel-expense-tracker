import { useState, useEffect } from 'react'
import { getCurrentUser, onAuthStateChange } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
    const { data } = onAuthStateChange((authUser) => {
      setUser(authUser)
    })

    return () => {
      data?.subscription?.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (err) {
      console.error('Failed to check user', err)
    } finally {
      setLoading(false)
    }
  }

  return { user, loading }
}
