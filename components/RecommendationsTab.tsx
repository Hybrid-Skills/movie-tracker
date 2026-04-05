'use client'

import { useState } from 'react'
import type { ContentType, Recommendation } from '@/types'
import { CONTENT_TYPE_LABELS } from '@/types'

const CONTENT_TYPES: Array<{ value: ContentType | 'any'; label: string }> = [
  { value: 'any', label: 'Any Type' },
  { value: 'feature', label: 'Feature Film' },
  { value: 'documentary', label: 'Documentary' },
  { value: 'anime', label: 'Anime' },
  { value: 'animated', label: 'Animated' },
  { value: 'tvshow', label: 'TV Show' },
]

const GENRES = [
  '', 'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War',
]

interface RecommendationsTabProps {
  profile: string
}

export default function RecommendationsTab({ profile }: RecommendationsTabProps) {
  const [contentType, setContentType] = useState<ContentType | 'any'>('any')
  const [genre, setGenre] = useState('')
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fetched, setFetched] = useState(false)

  async function fetchRecommendations() {
    setLoading(true)
    setError('')
    setFetched(false)

    const res = await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, contentType, genre }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Failed to get recommendations')
    } else {
      setRecommendations(data.recommendations)
      setFetched(true)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        <h2 className="text-lg font-semibold text-white">Get Recommendations</h2>
        <p className="text-sm text-muted">
          Based on <span className="text-white font-medium">{profile}</span>'s preferences
        </p>

        <div>
          <label className="block text-sm text-muted mb-2">Content Type</label>
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPES.map(ct => (
              <button
                key={ct.value}
                onClick={() => setContentType(ct.value)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  contentType === ct.value
                    ? 'bg-accent text-white'
                    : 'bg-surface border border-border text-muted hover:text-white'
                }`}
              >
                {ct.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-muted mb-2">Genre (optional)</label>
          <select
            value={genre}
            onChange={e => setGenre(e.target.value)}
            className="bg-surface border border-border rounded px-3 py-2 text-white focus:outline-none focus:border-accent"
          >
            {GENRES.map(g => (
              <option key={g} value={g}>{g || 'Any Genre'}</option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded transition-colors"
        >
          {loading ? 'Asking Claude...' : 'Get Recommendations'}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Results */}
      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-border rounded w-1/3 mb-2" />
              <div className="h-3 bg-border rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {fetched && !loading && recommendations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-white font-medium">Recommended for you</h3>
          {recommendations.map((rec, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4 hover:border-accent/40 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-white font-medium">{rec.title}</h4>
                    <span className="text-muted text-sm">({rec.year})</span>
                  </div>
                  {rec.genre && <p className="text-xs text-muted mt-0.5">{rec.genre}</p>}
                  <p className="text-sm text-gray-300 mt-2">{rec.reason}</p>
                </div>
                {rec.imdbRating && rec.imdbRating !== 'N/A' && (
                  <div className="shrink-0 text-right">
                    <div className="text-xs text-muted">IMDB</div>
                    <div className="text-yellow-400 font-bold">{rec.imdbRating}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
