import { Trip } from '@/types'
import { formatDateRange, formatCurrency } from '@/lib/format'

interface TripCardProps { trip: Trip; totalExpenses: number; onClick: () => void }

export function TripCard({ trip, totalExpenses, onClick }: TripCardProps) {
  return <div onClick={onClick} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1.5rem', cursor: 'pointer' }}>
    <h3 style={{ margin: '0 0 .5rem' }}>{trip.destination}</h3><p style={{ margin: 0, color: '#6b7280' }}>{formatDateRange(trip.start_date, trip.end_date)}</p>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}><span>Total Expenses:</span><strong style={{ color: '#2563eb' }}>{formatCurrency(totalExpenses, trip.currency)}</strong></div>
  </div>
}
