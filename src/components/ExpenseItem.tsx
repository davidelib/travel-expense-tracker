import { Expense } from '@/types'
import { formatCurrency, formatDateShort } from '@/lib/format'

interface ExpenseItemProps { expense: Expense; currency: string; onClick: () => void }

export function ExpenseItem({ expense, currency, onClick }: ExpenseItemProps) {
  return <div onClick={onClick} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, padding: '1rem', cursor: 'pointer' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
      <div><p style={{ margin: 0, fontWeight: 500 }}>{expense.description}</p><p style={{ margin: 0, color: '#6b7280' }}>{expense.category}</p><p style={{ margin: 0, color: '#9ca3af' }}>{formatDateShort(expense.expense_date)}</p></div>
      <strong style={{ color: '#2563eb', whiteSpace: 'nowrap' }}>{formatCurrency(expense.amount, currency)}</strong>
    </div>
  </div>
}
