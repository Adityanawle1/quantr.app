import { useState, useCallback } from 'react'
import { useDebouncedCallback } from 'use-debounce'

export interface SearchResult {
  symbol: string
  name: string
  type: 'STOCK' | 'INDEX' | 'ETF'
  exchange: 'NSE' | 'BSE'
}

export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  const search = useDebouncedCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.results ?? [])
    } finally {
      setLoading(false)
    }
  }, 300) // 300ms debounce

  const handleChange = useCallback((val: string) => {
    setQuery(val)
    search(val)
  }, [search])

  return { query, setQuery: handleChange, results, loading, clear: () => { setQuery(''); setResults([]) } }
}
