'use client'

import { useState, useEffect, useRef } from 'react'
import type { ContentType, Movie, SearchResult, MovieDetails } from '@/types'
import { CONTENT_TYPE_LABELS } from '@/types'
import RatingScale from './RatingScale'

interface MovieFormProps {
  profile: string
  onAdded: (movie: Movie) => void
}

const CONTENT_TYPES: ContentType[] = ['feature', 'documentary', 'anime', 'animated', 'tvshow']

export default function MovieForm({ profile, onAdded }: MovieFormProps) {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [details, setDetails] = useState<MovieDetails | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const [type, setType] = useState<ContentType>('feature')
  const [rating, setRating] = useState(0)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 2) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const res = await fetch(`/api/tmdb?search=${encodeURIComponent(query)}`)
      const data = await res.json()
      setSearchResults(data.results || [])
      setShowDropdown(true)
      setSearching(false)
    }, 400)
  }, [query])

  async function handleSelect(item: SearchResult) {
    setQuery(item.title)
    setShowDropdown(false)
    setDetails(null)
    setLoadingDetails(true)
    const res = await fetch(`/api/tmdb?id=${item.tmdbId}&type=${item.mediaType}`)
    const data: MovieDetails = await res.json()
    setDetails(data)
    setLoadingDetails(false)
  }

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    if (details) setDetails(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/movies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: query.trim(), type, myRating: rating, myNotes: notes, profile, details }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Failed to add movie')
    } else {
      onAdded(data.movie)
      setQuery('')
      setDetails(null)
      setRating(0)
      setNotes('')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-5 space-y-4">
      <h2 className="text-lg font-semibold text-white">Add to List</h2>

      {/* Search */}
      <div>
        <label className="block text-sm text-muted mb-1">Search Title</label>
        <div ref={wrapperRef} className="relative">
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            placeholder="e.g. Inception"
            required
            className="w-full bg-surface border border-border rounded px-3 py-2 text-white placeholder-muted focus:outline-none focus:border-accent"
          />
          {(searching || loadingDetails) && (
            <span className="absolute right-3 top-2.5 text-xs text-muted animate-pulse">
              {loadingDetails ? 'Loading...' : 'Searching...'}
            </span>
          )}

          {/* Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden max-h-72 overflow-y-auto">
              {searchResults.map(item => (
                <button
                  key={item.tmdbId}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-surface text-left transition-colors"
                >
                  {item.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.posterUrl} alt={item.title} className="w-8 h-12 object-cover rounded shrink-0" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-12 bg-surface border border-border rounded shrink-0 flex items-center justify-center text-xs">🎬</div>
                  )}
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.title}</p>
                    <p className="text-muted text-xs">{item.year} · {item.mediaType} {item.tmdbRating && `· ⭐ ${item.tmdbRating}`}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected movie preview */}
        {details && (
          <div className="mt-2 p-3 bg-surface border border-border rounded-lg flex gap-3">
            {details.posterUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={details.posterUrl} alt={query} className="w-12 object-cover rounded shrink-0" style={{ height: '72px' }} referrerPolicy="no-referrer" />
            )}
            <div className="min-w-0 space-y-1">
              <p className="text-white text-sm font-medium">
                {query} {details.year && <span className="text-muted font-normal">({details.year})</span>}
              </p>
              {details.tagline && <p className="text-xs text-muted italic">{details.tagline}</p>}
              <div className="flex flex-wrap gap-2 text-xs">
                {details.tmdbRating && <span className="text-blue-400">TMDB {details.tmdbRating}</span>}
                {details.imdbRating !== 'N/A' && details.imdbRating && <span className="text-yellow-400">⭐ {details.imdbRating}</span>}
                {details.rottenTomatoes && <span className="text-red-400">🍅 {details.rottenTomatoes}</span>}
                {details.metacritic && <span className="text-green-400">🎯 {details.metacritic}</span>}
                {details.runtime && <span className="text-muted">{details.runtime}</span>}
                {details.rated && <span className="text-muted border border-border px-1 rounded">{details.rated}</span>}
              </div>
              {details.genre && <p className="text-xs text-muted">{details.genre}</p>}
              {details.director && <p className="text-xs text-muted">Dir. {details.director}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Content Type */}
      <div>
        <label className="block text-sm text-muted mb-1">Type</label>
        <div className="flex flex-wrap gap-2">
          {CONTENT_TYPES.map(ct => (
            <button
              key={ct}
              type="button"
              onClick={() => setType(ct)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                type === ct
                  ? 'bg-accent text-white'
                  : 'bg-surface border border-border text-muted hover:text-white'
              }`}
            >
              {CONTENT_TYPE_LABELS[ct]}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-sm text-muted mb-2">My Rating</label>
        <RatingScale value={rating} onChange={setRating} />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm text-muted mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="e.g. Ending was great"
          rows={2}
          className="w-full bg-surface border border-border rounded px-3 py-2 text-white placeholder-muted focus:outline-none focus:border-accent resize-none"
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading || !query.trim()}
        className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 rounded transition-colors"
      >
        {loading ? 'Saving...' : 'Add to List'}
      </button>
    </form>
  )
}
