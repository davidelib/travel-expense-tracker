import { useState } from 'react'
import { createExpense } from '@/lib/expenses'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Container } from '@/components/Container'
import { Card } from '@/components/Card'

const categories = [
  { value: 'Accommodation', label: 'Accommodation' },
  { value: 'Food & Dining', label: 'Food & Dining' },
  { value: 'Transportation', label: 'Transportation' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Shopping', label: 'Shopping' },
  { value: 'Activities', label: 'Activities' },
  { value: 'Other', label: 'Other' },
]

interface AddExpenseProps {
  tripId: string
  onSuccess: () => void
  onCancel: () => void
}

export function AddExpense({ tripId, onSuccess, onCancel }: AddExpenseProps) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food & Dining')
  const [description, setDescription] = useState('')
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!amount) {
      setError('Amount is required')
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be a positive number')
      return
    }

    setLoading(true)
    try {
      await createExpense({
        trip_id: tripId,
        amount: numAmount,
        category,
        description: description.trim() || null,
        expense_date: expenseDate,
      })
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      <div style={pageStyle}>
        <Card>
          <h1 style={{ marginTop: 0 }}>Add Expense</h1>
          <form onSubmit={handleSubmit} style={formStyle}>
            <Input label="Amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
            <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} options={categories} />
            <Input label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Hotel booking" />
            <Input label="Date" type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} required />
            {error && <div style={errorStyle}>{error}</div>}
            <div style={actionsStyle}>
              <Button type="submit" fullWidth loading={loading}>Add Expense</Button>
              <Button type="button" variant="secondary" fullWidth onClick={onCancel}>Cancel</Button>
            </div>
          </form>
        </Card>
      </div>
    </Container>
  )
}

const pageStyle: React.CSSProperties = { padding: '2rem 0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }
const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1rem' }
const actionsStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '.5rem', marginTop: '.5rem' }
const errorStyle: React.CSSProperties = { padding: '.75rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, color: '#991b1b', fontSize: '.875rem' }
