'use client'

import { useState } from 'react'
import type { ContentType, Movie } from '@/types'
import { CONTENT_TYPE_LABELS } from '@/types'
import RatingScale from './RatingScale'

interface MovieFormProps {
  profile: string
  onAdded: (movie: Movie) => void
}

const CONTENT_TYPES: ContentType[] = ['feature', 'documentary', 'anime', 'animated', 'tvshow']

export default function MovieForm({ profile, onAdded }: MovieFormProps) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<ContentType>('feature')
  const [rating, setRating] = useState(0)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fetchedData, setFetchedData] = useState<{ imdbRating: string; rottenTomatoes: string; genre: string } | null>(null)
  const [fetching, setFetching] = useState(false)

  async function handleTitleBlur() {
    if (!title.trim()) return
    setFetching(true)
    setFetchedData(null)
    const res = await fetch(`/api/omdb?title=${encodeURIComponent(title)}`)
    const data = await res.json()
    if (data.imdbRating && data.imdbRating !== 'N/A') {
      setFetchedData(data)
    }
    setFetching(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/movies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), type, myRating: rating, myNotes: notes, profile }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Failed to add movie')
    } else {
      onAdded(data.movie)
      setTitle('')
      setRating(0)
      setNotes('')
      setFetchedData(null)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-5 space-y-4">
      <h2 className="text-lg font-semibold text-white">Add to List</h2>

      {/* Title */}
      <div>
        <label className="block text-sm text-muted mb-1">Title</label>
        <div className="relative">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="e.g. Inception"
            required
            className="w-full bg-surface border border-border rounded px-3 py-2 text-white placeholder-muted focus:outline-none focus:border-accent"
          />
          {fetching && (
            <span className="absolute right-3 top-2.5 text-xs text-muted animate-pulse">Fetching...</span>
          )}
        </div>
        {fetchedData && (
          <div className="mt-1.5 flex flex-wrap gap-2 text-xs">
            <span className="text-yellow-400">IMDB {fetchedData.imdbRating}</span>
            {fetchedData.rottenTomatoes && (
              <span className="text-red-400">🍅 {fetchedData.rottenTomatoes}</span>
            )}
            {fetchedData.genre && (
              <span className="text-muted">{fetchedData.genre}</span>
            )}
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

      {/* Rating Scale */}
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
        disabled={loading || !title.trim()}
        className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 rounded transition-colors"
      >
        {loading ? 'Saving...' : 'Add to List'}
      </button>
    </form>
  )
}
