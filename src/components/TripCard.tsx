import { Trip } from '@/types'
import { formatDateRange, formatCurrency } from '@/lib/format'

interface CategoryTotal {
  category: string
  amount: number
}

interface TripCardProps {
  trip: Trip
  totalExpenses: number
  categoryTotals: CategoryTotal[]
  onClick: () => void
}

const chartColors = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2', '#db2777', '#65a30d']

export function TripCard({ trip, totalExpenses, categoryTotals, onClick }: TripCardProps) {
  return <div onClick={onClick} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1.5rem', cursor: 'pointer' }}>
    <h3 style={{ margin: '0 0 .5rem' }}>{trip.destination}</h3><p style={{ margin: 0, color: '#6b7280' }}>{formatDateRange(trip.start_date, trip.end_date)}</p>
    <ExpensePieChart categoryTotals={categoryTotals} totalExpenses={totalExpenses} currency={trip.currency} />
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}><span>Total Expenses:</span><strong style={{ color: '#2563eb' }}>{formatCurrency(totalExpenses, trip.currency)}</strong></div>
  </div>
}

function ExpensePieChart({ categoryTotals, totalExpenses, currency }: {
  categoryTotals: CategoryTotal[]
  totalExpenses: number
  currency: string
}) {
  if (!totalExpenses) {
    return <p style={emptyChartStyle}>No expenses recorded yet</p>
  }

  let startAngle = -90

  return (
    <div style={chartContainerStyle}>
      <svg viewBox="0 0 120 120" role="img" aria-label={`Expense breakdown for ${categoryTotals.map(({ category, amount }) => `${category}: ${formatCurrency(amount, currency)}`).join(', ')}`} style={chartStyle}>
        <title>Expense breakdown by category</title>
        {categoryTotals.map(({ category, amount }, index) => {
          const angle = (amount / totalExpenses) * 360
          const path = describeSlice(60, 60, 52, startAngle, startAngle + angle)
          startAngle += angle
          return <path key={category} d={path} fill={chartColors[index % chartColors.length]} />
        })}
      </svg>
      <div style={legendStyle}>
        <table style={legendTableStyle}>
          <thead>
            <tr>
              <th style={categoryHeaderStyle}>Category</th>
              <th style={numericHeaderStyle}>%</th>
              <th style={numericHeaderStyle}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {categoryTotals.map(({ category, amount }, index) => (
              <tr key={category}>
                <td style={categoryCellStyle}>
                  <span style={categoryContentStyle}>
                    <span style={{ ...legendMarkerStyle, background: chartColors[index % chartColors.length] }} />
                    {category}
                  </span>
                </td>
                <td style={numericCellStyle}>{Math.round((amount / totalExpenses) * 100)}%</td>
                <td style={numericCellStyle}>{formatCurrency(amount, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function describeSlice(centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) {
  if (endAngle - startAngle >= 360) {
    return `M ${centerX} ${centerY - radius} A ${radius} ${radius} 0 1 1 ${centerX - 0.01} ${centerY - radius} Z`
  }

  const start = polarToCartesian(centerX, centerY, radius, endAngle)
  const end = polarToCartesian(centerX, centerY, radius, startAngle)
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
  return `M ${centerX} ${centerY} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angle: number) {
  const radians = (angle - 90) * Math.PI / 180
  return { x: centerX + radius * Math.cos(radians), y: centerY + radius * Math.sin(radians) }
}

const chartContainerStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }
const chartStyle: React.CSSProperties = { width: 112, height: 112, flex: '0 0 auto' }
const legendStyle: React.CSSProperties = { minWidth: 0, flex: 1 }
const legendTableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '.75rem' }
const categoryHeaderStyle: React.CSSProperties = { padding: '0 0 .35rem', color: '#6b7280', fontSize: '.7rem', textAlign: 'left', textTransform: 'uppercase' }
const numericHeaderStyle: React.CSSProperties = { padding: '0 0 .35rem .5rem', color: '#6b7280', fontSize: '.7rem', textAlign: 'right', textTransform: 'uppercase' }
const categoryCellStyle: React.CSSProperties = { padding: '.2rem 0' }
const categoryContentStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '.4rem' }
const numericCellStyle: React.CSSProperties = { padding: '.2rem 0 .2rem .5rem', fontVariantNumeric: 'tabular-nums', textAlign: 'right', whiteSpace: 'nowrap' }
const legendMarkerStyle: React.CSSProperties = { width: 10, height: 10, borderRadius: 2 }
const emptyChartStyle: React.CSSProperties = { margin: '1rem 0 0', color: '#6b7280', fontSize: '.875rem' }
