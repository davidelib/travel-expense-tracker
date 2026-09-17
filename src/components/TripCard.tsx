import styles from './TripCard.module.css'
import { Trip } from '@/types'
import { formatDateRange, formatCurrency } from '@/lib/format'

interface TripCardProps {
  trip: Trip
  totalExpenses: number
  onClick: () => void
}

export function TripCard({ trip, totalExpenses, onClick }: TripCardProps) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.header}>
        <h3 className={styles.destination}>{trip.destination}</h3>
        <p className={styles.dates}>{formatDateRange(trip.start_date, trip.end_date)}</p>
      </div>
      <div className={styles.footer}>
        <span className={styles.label}>Total Expenses:</span>
        <span className={styles.amount}>{formatCurrency(totalExpenses, trip.currency)}</span>
      </div>
    </div>
  )
}
