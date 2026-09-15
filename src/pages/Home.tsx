import { useState, useEffect } from 'react'
import { getTrips } from '@/lib/trips'
import { signOut } from '@/lib/auth'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { Card } from '@/components/Card'
import { TripCard } from '@/components/TripCard'
import { formatCurrency, formatDateRange } from '@/lib/format'
import { getTotalExpenses } from '@/lib/expenses'
import styles from './Home.module.css'
import { Trip } from '@/types'

interface HomeProps {
  onSelectTrip: (tripId: string) => void
  onCreateTrip: () => void
  onLogout: () => void
}

export function Home({ onSelectTrip, onCreateTrip, onLogout }: HomeProps) {
  const [trips, setTrips] = useState<Trip[]>([])
  const [tripTotals, setTripTotals] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadTrips()
  }, [])

  const loadTrips = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getTrips()
      setTrips(data)

      // Load totals for each trip
      const totals: Record<string, number> = {}
      for (const trip of data) {
        totals[trip.id] = await getTotalExpenses(trip.id)
      }
      setTripTotals(totals)
    } catch (err: any) {
      setError(err.message || 'Failed to load trips')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      onLogout()
    } catch (err) {
      setError('Failed to sign out')
    }
  }

  return (
    <Container>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1>Trips</h1>
            <p>Manage your travel expenses</p>
          </div>
          <div className={styles.headerActions}>
            <Button variant="primary" onClick={onCreateTrip} size="lg">
              + New Trip
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {loading ? (
          <div className={styles.loading}>Loading trips...</div>
        ) : trips.length === 0 ? (
          <Card>
            <div className={styles.emptyState}>
              <p>No trips yet</p>
              <p>Create your first trip to start tracking expenses</p>
              <Button onClick={onCreateTrip} size="lg">
                Create Trip
              </Button>
            </div>
          </Card>
        ) : (
          <div className={styles.tripsList}>
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                destination={trip.destination}
                dates={formatDateRange(trip.start_date, trip.end_date)}
                total={formatCurrency(tripTotals[trip.id] || 0, trip.currency)}
                currency={trip.currency}
                onClick={() => onSelectTrip(trip.id)}
              />
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}
