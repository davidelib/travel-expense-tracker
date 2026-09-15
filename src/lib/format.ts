export function formatCurrency(amount: number, currency: string): string {
  const numericAmount = parseFloat(amount.toString())

  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CHF: 'CHF',
    CAD: 'C$',
    AUD: 'A$',
    NZD: 'NZ$',
    INR: '₹',
    IDR: 'Rp',
    THB: '฿',
    SGD: 'S$',
    MYR: 'RM',
    PHP: '₱',
    VND: '₫',
    CNY: '¥',
  }

  const symbol = currencySymbols[currency] || currency

  // Currencies that typically use symbol before amount
  const symbolBeforeCurrencies = ['USD', 'EUR', 'GBP', 'CHF', 'CAD', 'AUD', 'NZD', 'SGD', 'MYR']

  // Format with 2 decimal places
  const formatted = numericAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  if (symbolBeforeCurrencies.includes(currency)) {
    return `${symbol}${formatted}`
  } else if (currency === 'IDR') {
    return `${symbol} ${formatted.replace(/,/g, '.')}`
  } else {
    return `${formatted} ${symbol}`
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const startFormatted = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  const endFormatted = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return `${startFormatted} – ${endFormatted}`
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }
}
