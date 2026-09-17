import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Login } from '@/pages/Login'
import { SignUp } from '@/pages/SignUp'
import { Home } from '@/pages/Home'
import { CreateTrip } from '@/pages/CreateTrip'
import { TripDetail } from '@/pages/TripDetail'
import { ShareTrip } from '@/pages/ShareTrip'
import { AddExpense } from '@/pages/AddExpense'
import { EditExpense } from '@/pages/EditExpense'
import { getExpense } from '@/lib/expenses'
import { Expense } from '@/types'
import './App.css'

type Page = 'login' | 'signup' | 'home' | 'create-trip' | 'trip-detail' | 'share-trip' | 'add-expense' | 'edit-expense'

export function App() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState<Page>('login')
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)

  useEffect(() => {
    if (!loading) setCurrentPage(user ? 'home' : 'login')
  }, [user, loading])

  if (loading) return <div className="loading">Loading...</div>

  if (!user) {
    if (currentPage === 'signup') {
      return <SignUp onSuccess={() => setCurrentPage('home')} onLogin={() => setCurrentPage('login')} />
    }
    return <Login onSuccess={() => setCurrentPage('home')} onSignUp={() => setCurrentPage('signup')} />
  }

  if (currentPage === 'create-trip') {
    return <CreateTrip onSuccess={(tripId) => { setSelectedTripId(tripId); setCurrentPage('trip-detail') }} onCancel={() => setCurrentPage('home')} />
  }

  if (currentPage === 'trip-detail' && selectedTripId) {
    return <TripDetail tripId={selectedTripId} onBack={() => setCurrentPage('home')} onShareTrip={() => setCurrentPage('share-trip')} onAddExpense={() => setCurrentPage('add-expense')} onEditExpense={loadAndEditExpense} />
  }

  if (currentPage === 'share-trip' && selectedTripId) {
    return <ShareTrip tripId={selectedTripId} onBack={() => setCurrentPage('trip-detail')} />
  }

  if (currentPage === 'add-expense' && selectedTripId) {
    return <AddExpense tripId={selectedTripId} onSuccess={() => setCurrentPage('trip-detail')} onCancel={() => setCurrentPage('trip-detail')} />
  }

  if (currentPage === 'edit-expense' && selectedExpense) {
    return <EditExpense expense={selectedExpense} onSuccess={() => setCurrentPage('trip-detail')} onCancel={() => setCurrentPage('trip-detail')} />
  }

  return (
    <Home
      onSelectTrip={(tripId) => { setSelectedTripId(tripId); setCurrentPage('trip-detail') }}
      onCreateTrip={() => setCurrentPage('create-trip')}
      onLogout={() => setCurrentPage('login')}
      onAccountDeleted={() => {
        setSelectedTripId(null)
        setSelectedExpense(null)
        setCurrentPage('login')
      }}
    />
  )

  async function loadAndEditExpense(expenseId: string) {
    try {
      const expense = await getExpense(expenseId)
      setSelectedExpense(expense)
      setCurrentPage('edit-expense')
    } catch (err) {
      console.error('Failed to load expense', err)
    }
  }
}
