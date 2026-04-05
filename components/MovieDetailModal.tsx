'use client'

import { useState, useEffect } from 'react'
import type { Movie } from '@/types'
import { CONTENT_TYPE_LABELS } from '@/types'
import RatingScale from './RatingScale'

interface Props {
  movie: Movie
  onClose: () => void
  onDelete: (movie: Movie) => Promise<void>
  onUpdateRating: (movie: Movie, rating: number) => Promise<void>
}

export default function MovieDetailModal({ movie, onClose, onDelete, onUpdateRating }: Props) {
  const [editingRating, setEditingRating] = useState(false)
  const [rating, setRating] = useState(movie.myRating)
  const [currentRating, setCurrentRating] = useState(movie.myRating)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  async function handleDelete() {
    setDeleting(true)
    await onDelete(movie)
    onClose()
  }

  async function handleSaveRating() {
    setSaving(true)
    await onUpdateRating(movie, rating)
    setCurrentRating(rating)
    setSaving(false)
    setEditingRating(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Sheet / Modal */}
      <div className="relative z-10 w-full md:max-w-2xl md:mx-4 bg-card border border-border rounded-t-2xl md:rounded-2xl max-h-[92vh] overflow-y-auto">
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 bg-border rounded-full" />
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center text-muted hover:text-white transition-colors rounded-full hover:bg-surface"
        >
          ✕
        </button>

        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex gap-4">
            {movie.posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-28 h-40 object-cover rounded-lg shrink-0 shadow-lg"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-28 h-40 bg-surface border border-border rounded-lg shrink-0 flex items-center justify-center text-3xl">
                🎬
              </div>
            )}
            <div className="min-w-0 space-y-1.5 pt-1">
              <h2 className="text-white text-lg font-bold leading-tight pr-8">
                {movie.title}
                {movie.year && <span className="text-muted font-normal ml-2 text-base">({movie.year})</span>}
              </h2>
              {movie.tagline && <p className="text-muted text-sm italic">{movie.tagline}</p>}
              {movie.director && <p className="text-sm text-muted">Dir. {movie.director}</p>}

              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs bg-surface border border-border rounded px-2 py-0.5 text-muted">
                  {CONTENT_TYPE_LABELS[movie.type]}
                </span>
                {movie.rated && (
                  <span className="text-xs border border-border rounded px-1.5 py-0.5 text-muted">{movie.rated}</span>
                )}
                {movie.runtime && <span className="text-xs text-muted self-center">{movie.runtime}</span>}
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                {movie.tmdbRating && <span className="text-blue-400">TMDB {movie.tmdbRating}</span>}
                {movie.imdbRating && movie.imdbRating !== 'N/A' && (
                  <span className="text-yellow-400">⭐ {movie.imdbRating}</span>
                )}
                {movie.rottenTomatoes && <span className="text-red-400">🍅 {movie.rottenTomatoes}</span>}
                {movie.metacritic && <span className="text-green-400">🎯 {movie.metacritic}</span>}
                {movie.boxOffice && movie.boxOffice !== 'N/A' && (
                  <span className="text-muted">💰 {movie.boxOffice}</span>
                )}
              </div>
            </div>
          </div>

          {/* My Rating */}
          <div className="bg-surface border border-border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted font-medium">My Rating</span>
              {!editingRating && (
                <button
                  onClick={() => { setRating(currentRating); setEditingRating(true) }}
                  className="text-xs text-accent hover:underline"
                >
                  Edit
                </button>
              )}
            </div>
            {editingRating ? (
              <div className="space-y-2">
                <RatingScale value={rating} onChange={setRating} />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveRating}
                    disabled={saving}
                    className="flex-1 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm py-1.5 rounded transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditingRating(false)}
                    className="flex-1 bg-surface border border-border text-muted text-sm py-1.5 rounded hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-white font-bold text-xl">
                {currentRating > 0
                  ? <>{currentRating}<span className="text-muted text-sm font-normal">/10</span></>
                  : <span className="text-muted text-sm font-normal">Not rated</span>
                }
              </div>
            )}
          </div>

          {/* Notes */}
          {movie.myNotes && (
            <div>
              <p className="text-xs text-muted mb-1">My Notes</p>
              <p className="text-sm text-gray-300 italic">"{movie.myNotes}"</p>
            </div>
          )}

          {/* Plot */}
          {movie.plot && (
            <div>
              <p className="text-xs text-muted mb-1">Plot</p>
              <p className="text-sm text-gray-300 leading-relaxed">{movie.plot}</p>
            </div>
          )}

          {/* Genre */}
          {movie.genre && (
            <div>
              <p className="text-xs text-muted mb-1">Genre</p>
              <p className="text-sm text-gray-300">{movie.genre}</p>
            </div>
          )}

          {/* Cast */}
          {movie.actors && (
            <div>
              <p className="text-xs text-muted mb-1">Cast</p>
              <p className="text-sm text-gray-300">{movie.actors}</p>
            </div>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {movie.language && (
              <div>
                <p className="text-xs text-muted">Language</p>
                <p className="text-gray-300 capitalize">{movie.language}</p>
              </div>
            )}
            {movie.country && (
              <div>
                <p className="text-xs text-muted">Country</p>
                <p className="text-gray-300">{movie.country}</p>
              </div>
            )}
            {movie.released && (
              <div>
                <p className="text-xs text-muted">Released</p>
                <p className="text-gray-300">{movie.released}</p>
              </div>
            )}
            {movie.imdbVotes && (
              <div>
                <p className="text-xs text-muted">IMDB Votes</p>
                <p className="text-gray-300">{movie.imdbVotes}</p>
              </div>
            )}
          </div>

          {movie.awards && movie.awards !== 'N/A' && (
            <div>
              <p className="text-xs text-muted mb-1">Awards</p>
              <p className="text-sm text-gray-300">{movie.awards}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <p className="text-xs text-muted">Added {movie.dateAdded}</p>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Sure?</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 font-medium"
                >
                  {deleting ? 'Removing...' : 'Yes, remove'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-muted hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Remove from list
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
