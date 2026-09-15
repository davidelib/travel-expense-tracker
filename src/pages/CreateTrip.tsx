import { useState } from 'react'
import { createTrip } from '@/lib/trips'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Container } from '@/components/Container'
import { Card } from '@/components/Card'
import styles from './CreateTrip.module.css'

const currencies = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'CHF', label: 'CHF - Swiss Franc' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'NZD', label: 'NZD - New Zealand Dollar' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'IDR', label: 'IDR - Indonesian Rupiah' },
  { value: 'THB', label: 'THB - Thai Baht' },
  { value: 'SGD', label: 'SGD - Singapore Dollar' },
  { value: 'MYR', label: 'MYR - Malaysian Ringgit' },
  { value: 'PHP', label: 'PHP - Philippine Peso' },
  { value: 'VND', label: 'VND - Vietnamese Dong' },
  { value: 'CNY', label: 'CNY - Chinese Yuan' },
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

    if (!destination || !startDate || !endDate || !currency) {
      setError('All fields are required')
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before end date')
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
              placeholder="e.g., Paris, Tokyo, New York"
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
