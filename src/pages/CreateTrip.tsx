import { useState } from 'react'
import { createTrip } from '@/lib/trips'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Container } from '@/components/Container'
import { Card } from '@/components/Card'
import styles from './CreateTrip.module.css'

const currencies = [
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'JPY', label: 'Japanese Yen (JPY)' },
  { value: 'CHF', label: 'Swiss Franc (CHF)' },
  { value: 'CAD', label: 'Canadian Dollar (CAD)' },
  { value: 'AUD', label: 'Australian Dollar (AUD)' },
  { value: 'NZD', label: 'New Zealand Dollar (NZD)' },
  { value: 'INR', label: 'Indian Rupee (INR)' },
  { value: 'IDR', label: 'Indonesian Rupiah (IDR)' },
  { value: 'THB', label: 'Thai Baht (THB)' },
  { value: 'SGD', label: 'Singapore Dollar (SGD)' },
  { value: 'MYR', label: 'Malaysian Ringgit (MYR)' },
  { value: 'PHP', label: 'Philippine Peso (PHP)' },
  { value: 'VND', label: 'Vietnamese Dong (VND)' },
  { value: 'CNY', label: 'Chinese Yuan (CNY)' },
]

interface CreateTripProps {
  onSuccess: (tripId: string) => void
  onCancel: () => void
}

export function CreateTrip({ onSuccess, onCancel }: CreateTripProps) {
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!destination || !startDate || !endDate) {
      setError('All fields are required')
      return
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('End date must be after start date')
      return
    }

    setLoading(true)

    try {
      const tripId = await createTrip({
        destination,
        start_date: startDate,
        end_date: endDate,
        currency,
      })
      onSuccess(tripId)
    } catch (err: any) {
      setError(err.message || 'Failed to create trip')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      <div className={styles.container}>
        <Card>
          <div className={styles.header}>
            <h1>Create New Trip</h1>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Tokyo, Japan"
              required
            />
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
            <Select
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={currencies}
            />
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.actions}>
              <Button type="submit" fullWidth loading={loading}>
                Create Trip
              </Button>
              <Button type="button" variant="secondary" fullWidth onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Container>
  )
}
