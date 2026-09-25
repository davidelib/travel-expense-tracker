import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Login } from '@/pages/Login'
import { SignUp } from '@/pages/SignUp'
import { Home } from '@/pages/Home'
import { CreateTrip } from '@/pages/CreateTrip'
import { TripDetail } from '@/pages/TripDetail'
import { ShareTrip } from '@/pages/ShareTrip'
import { AddExpense } from '@/pages/AddExpense'
import { EditExpense } from '@/pages/EditExpense'
import { acceptTripInvitation } from '@/lib/trips'
import { getExpense } from '@/lib/expenses'
import { Expense } from '@/types'
import './App.css'

type Page = 'login' | 'signup' | 'home' | 'create-trip' | 'trip-detail' | 'share-trip' | 'add-expense' | 'edit-expense'

type PersistedNavigation = {
  userId: string
  page: Exclude<Page, 'login' | 'signup'>
  selectedTripId: string | null
  selectedExpenseId: string | null
}

const NAVIGATION_STORAGE_KEY = 'travel-expense-tracker.navigation'
const restorablePages = new Set<PersistedNavigation['page']>([
  'home',
  'create-trip',
  'trip-detail',
  'share-trip',
  'add-expense',
  'edit-expense',
])

function getPersistedNavigation(userId: string): PersistedNavigation | null {
  try {
    const value = sessionStorage.getItem(NAVIGATION_STORAGE_KEY)
    if (!value) return null

    const navigation: unknown = JSON.parse(value)
    if (
      !navigation
      || typeof navigation !== 'object'
    ) {
      sessionStorage.removeItem(NAVIGATION_STORAGE_KEY)
      return null
    }

    const storedNavigation = navigation as Record<string, unknown>
    const page = storedNavigation.page
    const selectedTripId = storedNavigation.selectedTripId
    const selectedExpenseId = storedNavigation.selectedExpenseId
    if (
      storedNavigation.userId !== userId
      || typeof page !== 'string'
      || !restorablePages.has(page as PersistedNavigation['page'])
      || (selectedTripId !== undefined && selectedTripId !== null && typeof selectedTripId !== 'string')
      || (selectedExpenseId !== undefined && selectedExpenseId !== null && typeof selectedExpenseId !== 'string')
    ) {
      sessionStorage.removeItem(NAVIGATION_STORAGE_KEY)
      return null
    }

    return {
      userId,
      page: page as PersistedNavigation['page'],
      selectedTripId: typeof selectedTripId === 'string' ? selectedTripId : null,
      selectedExpenseId: typeof selectedExpenseId === 'string' ? selectedExpenseId : null,
    }
  } catch {
    sessionStorage.removeItem(NAVIGATION_STORAGE_KEY)
    return null
  }
}

export function App() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState<Page>('login')
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [navigationReady, setNavigationReady] = useState(false)
  const processedInviteToken = useRef<string | null>(null)

  useEffect(() => {
    if (loading) return

    if (!user) {
      sessionStorage.removeItem(NAVIGATION_STORAGE_KEY)
      setSelectedTripId(null)
      setSelectedExpense(null)
      setSelectedExpenseId(null)
      setCurrentPage('login')
      setNavigationReady(true)
      return
    }

    setNavigationReady(false)
    const navigation = getPersistedNavigation(user.id)

    if (navigation?.page === 'edit-expense' && navigation.selectedExpenseId) {
      void getExpense(navigation.selectedExpenseId)
        .then((expense) => {
          setSelectedTripId(expense.trip_id)
          setSelectedExpense(expense)
          setSelectedExpenseId(expense.id)
          setCurrentPage('edit-expense')
        })
        .catch(() => {
          setSelectedTripId(navigation.selectedTripId)
          setCurrentPage(navigation.selectedTripId ? 'trip-detail' : 'home')
        })
        .finally(() => setNavigationReady(true))
      return
    }

    setSelectedTripId(navigation?.selectedTripId ?? null)
    setSelectedExpense(null)
    setSelectedExpenseId(null)
    setCurrentPage(navigation?.page ?? 'home')
    setNavigationReady(true)
  }, [loading, user?.id])

  useEffect(() => {
    if (loading || !user || !navigationReady || currentPage === 'login' || currentPage === 'signup') return

    const navigation: PersistedNavigation = {
      userId: user.id,
      page: currentPage,
      selectedTripId,
      selectedExpenseId,
    }
    sessionStorage.setItem(NAVIGATION_STORAGE_KEY, JSON.stringify(navigation))
  }, [currentPage, loading, navigationReady, selectedExpenseId, selectedTripId, user])

  useEffect(() => {
    if (loading || !user) return

    const token = new URLSearchParams(window.location.search).get('invite')?.trim()
    if (!token || processedInviteToken.current === token) return

    processedInviteToken.current = token
    setInviteError(null)

    void acceptTripInvitation(token)
      .then((result) => {
        const tripId = typeof result?.tripId === 'string' ? result.tripId : ''
        if (!tripId) throw new Error('Invitation accepted, but the trip could not be identified')

        window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.hash}`)
        setSelectedTripId(tripId)
        setSelectedExpense(null)
        setSelectedExpenseId(null)
        setCurrentPage('trip-detail')
      })
      .catch((error: unknown) => {
        processedInviteToken.current = null
        setInviteError(error instanceof Error ? error.message : 'Failed to accept trip invitation')
      })
  }, [loading, user])

  if (loading || (user && !navigationReady)) return <div className="loading">Loading...</div>

  if (!user) {
    if (currentPage === 'signup') {
      return <SignUp onSuccess={() => setCurrentPage('home')} onLogin={() => setCurrentPage('login')} />
    }
    return <Login onSuccess={() => setCurrentPage('home')} onSignUp={() => setCurrentPage('signup')} />
  }

  if (inviteError) {
    return (
      <div className="loading" role="alert">
        <p>{inviteError}</p>
        <button type="button" onClick={() => { setInviteError(null); window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.hash}`); setCurrentPage('home') }}>
          Continue to my trips
        </button>
      </div>
    )
  }

  if (currentPage === 'create-trip') {
    return <CreateTrip onSuccess={(tripId) => { setSelectedTripId(tripId); setCurrentPage('trip-detail') }} onCancel={() => setCurrentPage('home')} />
  }

  if (currentPage === 'trip-detail' && selectedTripId) {
    return (
      <TripDetail
        tripId={selectedTripId}
        onBack={() => setCurrentPage('home')}
        onDeleted={() => {
          setSelectedTripId(null)
          setSelectedExpense(null)
          setSelectedExpenseId(null)
          setCurrentPage('home')
        }}
        onShareTrip={() => setCurrentPage('share-trip')}
        onAddExpense={() => setCurrentPage('add-expense')}
        onEditExpense={loadAndEditExpense}
      />
    )
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
        setSelectedExpenseId(null)
        setCurrentPage('login')
      }}
    />
  )

  async function loadAndEditExpense(expenseId: string) {
    try {
      const expense = await getExpense(expenseId)
      setSelectedExpense(expense)
      setSelectedExpenseId(expense.id)
      setSelectedTripId(expense.trip_id)
      setCurrentPage('edit-expense')
    } catch (err) {
      console.error('Failed to load expense', err)
    }
  }
}
