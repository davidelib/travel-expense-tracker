import styles from './TripCard.module.css'

interface TripCardProps {
  destination: string
  dates: string
  total: string
  currency: string
  onClick: () => void
}

export function TripCard({ destination, dates, total, currency, onClick }: TripCardProps) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.destination}>{destination}</div>
      <div className={styles.dates}>{dates}</div>
      <div className={styles.total}>{total}</div>
      <div className={styles.currency}>{currency}</div>
    </div>
  )
}
