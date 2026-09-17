import { useState, useEffect } from 'react'
import { getTrips } from '@/lib/trips'
import { getTotalExpenses } from '@/lib/expenses'
import { signOut } from '@/lib/auth'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { Card } from '@/components/Card'
import { TripCard } from '@/components/TripCard'
import './Home.module.css'
import { Trip } from '@/types'

interface HomeProps {
  onSelectTrip: (tripId: string) => void
  onCreateTrip: () => void
  onLogout: () => void
}

export function Home({ onSelectTrip, onCreateTrip, onLogout }: HomeProps) {
  const [trips, setTrips] = useState<Array<Trip & { totalExpenses: number }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrips()
  }, [])

  const loadTrips = async () => {
    setLoading(true)
    try {
      const data = await getTrips()
      const tripsWithExpenses = await Promise.all(
        data.map(async (trip) => ({
          ...trip,
          totalExpenses: await getTotalExpenses(trip.id),
        }))
      )
      setTrips(tripsWithExpenses)
    } catch (err) {
      console.error('Failed to load trips', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      onLogout()
    } catch (err) {
      console.error('Failed to logout', err)
    }
  }

  return (
    <Container>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1>My Trips</h1>
          <Button variant="ghost" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <div style={styles.actions}>
          <Button onClick={onCreateTrip} size="lg">
            Create New Trip
          </Button>
        </div>

        {loading ? (
          <Card>
            <p>Loading trips...</p>
          </Card>
        ) : trips.length === 0 ? (
          <Card>
            <p>No trips yet. Create your first trip to get started!</p>
          </Card>
        ) : (
          <div style={styles.grid}>
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                totalExpenses={trip.totalExpenses}
                onClick={() => onSelectTrip(trip.id)}
              />
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '2rem 0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
}
