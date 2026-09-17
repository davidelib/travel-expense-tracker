import { useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = typeof window === 'undefined' ? null : window.localStorage.getItem(key)
      return item === null ? initialValue : (JSON.parse(item) as T)
    } catch {
      return initialValue
    }
  })

  const setValue = (value: T) => {
    setStoredValue(value)
    if (typeof window !== 'undefined') window.localStorage.setItem(key, JSON.stringify(value))
  }

  return [storedValue, setValue]
}
