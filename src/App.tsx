import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Login } from '@/pages/Login'
import { SignUp } from '@/pages/SignUp'
import { Home } from '@/pages/Home'
import { CreateTrip } from '@/pages/CreateTrip'
import { TripDetail } from '@/pages/TripDetail'
import { AddExpense } from '@/pages/AddExpense'
import { EditExpense } from '@/pages/EditExpense'
import './App.css'

type AppPage = 'login' | 'signup' | 'home' | 'create-trip' | 'trip-detail' | 'add-expense' | 'edit-expense'

export function App() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState<AppPage>('login')
  const [selectedTripId, setSelectedTripId] = useState<string>('')
  const [selectedExpenseId, setSelectedExpenseId] = useState<string>('')

  if (loading) {
    return <div className="loading-screen">Loading...</div>
  }

  // Authentication flow
  if (!user) {
    if (currentPage === 'signup') {
      return (
        <SignUp
          onSuccess={() => setCurrentPage('login')}
          onToggle={() => setCurrentPage('login')}
        />
      )
    }
    return (
      <Login
        onSuccess={() => setCurrentPage('home')}
        onToggle={() => setCurrentPage('signup')}
      />
    )
  }

  // App flow
  switch (currentPage) {
    case 'home':
      return (
        <Home
          onSelectTrip={(tripId) => {
            setSelectedTripId(tripId)
            setCurrentPage('trip-detail')
          }}
          onCreateTrip={() => setCurrentPage('create-trip')}
          onLogout={() => setCurrentPage('login')}
        />
      )

    case 'create-trip':
      return (
        <CreateTrip
          onSuccess={(tripId) => {
            setSelectedTripId(tripId)
            setCurrentPage('trip-detail')
          }}
          onCancel={() => setCurrentPage('home')}
        />
      )

    case 'trip-detail':
      return (
        <TripDetail
          tripId={selectedTripId}
          onBack={() => setCurrentPage('home')}
          onAddExpense={() => setCurrentPage('add-expense')}
          onEditExpense={(expenseId) => {
            setSelectedExpenseId(expenseId)
            setCurrentPage('edit-expense')
          }}
        />
      )

    case 'add-expense':
      return (
        <AddExpense
          tripId={selectedTripId}
          onSuccess={() => setCurrentPage('trip-detail')}
          onCancel={() => setCurrentPage('trip-detail')}
        />
      )

    case 'edit-expense':
      return (
        <EditExpense
          expenseId={selectedExpenseId}
          onSuccess={() => setCurrentPage('trip-detail')}
          onCancel={() => setCurrentPage('trip-detail')}
        />
      )

    default:
      return (
        <Home
          onSelectTrip={(tripId) => {
            setSelectedTripId(tripId)
            setCurrentPage('trip-detail')
          }}
          onCreateTrip={() => setCurrentPage('create-trip')}
          onLogout={() => setCurrentPage('login')}
        />
      )
  }
}
