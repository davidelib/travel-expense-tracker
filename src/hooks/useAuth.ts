import { useEffect, useState } from 'react'
import { getCurrentUser, onAuthStateChange } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (err) {
        console.error('Failed to get user', err)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const { data } = onAuthStateChange((authUser) => {
      setUser(authUser)
    })

    return () => {
      data?.subscription?.unsubscribe()
    }
  }, [])

  return { user, loading }
}
