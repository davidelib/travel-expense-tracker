import { useState, useEffect } from 'react'
import { getTrip } from '@/lib/trips'
import { getExpenses } from '@/lib/expenses'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { Card } from '@/components/Card'
import { ExpenseItem } from '@/components/ExpenseItem'
import { Trip, Expense } from '@/types'
import { formatCurrency, formatDateRange } from '@/lib/format'

interface TripDetailProps { tripId: string; onBack: () => void; onAddExpense: () => void; onEditExpense: (expenseId: string) => void }
export function TripDetail({ tripId, onBack, onAddExpense, onEditExpense }: TripDetailProps) {
  const [trip, setTrip] = useState<Trip | null>(null); const [expenses, setExpenses] = useState<Expense[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  useEffect(() => { void loadData() }, [tripId])
  const loadData = async () => { setLoading(true); try { setTrip(await getTrip(tripId)); setExpenses(await getExpenses(tripId)) } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed to load trip') } finally { setLoading(false) } }
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0)
  const expensesByCategory = expenses.reduce<Record<string, number>>((acc, exp) => { acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount); return acc }, {})
  if (loading) return <Container><div style={pageStyle}><Card><p>Loading trip...</p></Card></div></Container>
  if (!trip) return <Container><div style={pageStyle}><Card><p>Trip not found</p><Button onClick={onBack} variant="secondary">Go Back</Button></Card></div></Container>
  return <Container><div style={{ padding: '2rem 0' }}><div style={headerStyle}><div><h1>{trip.destination}</h1><p style={{ color: '#6b7280' }}>{formatDateRange(trip.start_date, trip.end_date)}</p></div><Button onClick={onBack} variant="secondary">Back to Trips</Button></div>{error && <div style={errorStyle}>{error}</div>}<div style={gridStyle}><Card><h2>Summary</h2><div style={columnStyle}><div style={rowStyle}><span>Total Expenses:</span><strong style={{ color: '#2563eb' }}>{formatCurrency(totalExpenses, trip.currency)}</strong></div><div style={rowStyle}><span>Number of Expenses:</span><span>{expenses.length}</span></div></div></Card>{Object.keys(expensesByCategory).length > 0 && <Card><h2>By Category</h2><div style={columnStyle}>{Object.entries(expensesByCategory).map(([category, amount]) => <div key={category} style={categoryStyle}><span>{category}</span><span>{formatCurrency(amount, trip.currency)}</span></div>)}</div></Card>}</div><div><div style={headerStyle}><h2>Expenses</h2><Button onClick={onAddExpense}>Add Expense</Button></div>{expenses.length === 0 ? <Card><p>No expenses yet. Add your first expense!</p></Card> : <div style={columnStyle}>{expenses.map((expense) => <ExpenseItem key={expense.id} expense={expense} currency={trip.currency} onClick={() => onEditExpense(expense.id)} />)}</div>}</div></div></Container>
}
const pageStyle: React.CSSProperties = { padding: '2rem 0', minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }
const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }
const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }
const columnStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1rem' }
const rowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '.75rem', borderBottom: '1px solid #f3f4f6' }
const categoryStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '.75rem', background: '#f9fafb', borderRadius: 4 }
const errorStyle: React.CSSProperties = { padding: '1rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, color: '#991b1b', marginBottom: '2rem' }
