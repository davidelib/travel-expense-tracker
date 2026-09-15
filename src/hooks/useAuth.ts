import { useState, useEffect } from 'react'
import { getCurrentUser, onAuthStateChange } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Subscribe to auth state changes
    const { data } = onAuthStateChange((authUser) => {
      setUser(authUser)
      setLoading(false)
    })

    return () => {
      data?.subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}
