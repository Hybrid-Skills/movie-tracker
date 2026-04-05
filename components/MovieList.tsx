'use client'

import { useState } from 'react'
import type { Movie } from '@/types'
import { CONTENT_TYPE_LABELS } from '@/types'
import MovieDetailModal from './MovieDetailModal'
import RatingScale from './RatingScale'

interface MovieListProps {
  movies: Movie[]
  loading: boolean
  onRefresh: () => void
  onDelete: (movie: Movie) => Promise<void>
  onUpdateRating: (movie: Movie, rating: number) => Promise<void>
}

function movieKey(m: Movie) {
  return `${m.title}__${m.dateAdded}`
}

export default function MovieList({ movies, loading, onRefresh, onDelete, onUpdateRating }: MovieListProps) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [pendingRating, setPendingRating] = useState(0)
  const [savingKey, setSavingKey] = useState<string | null>(null)

  async function handleInlineSave(movie: Movie) {
    const key = movieKey(movie)
    setSavingKey(key)
    await onUpdateRating(movie, pendingRating)
    setSavingKey(null)
    setEditingKey(null)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse flex gap-4">
            <div className="w-16 h-24 bg-border rounded shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-4 bg-border rounded w-1/2" />
              <div className="h-3 bg-border rounded w-1/3" />
              <div className="h-3 bg-border rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-16 text-muted">
        <p className="text-4xl mb-3">🎬</p>
        <p className="text-lg">No movies logged yet</p>
        <p className="text-sm mt-1">Add your first title using the form</p>
      </div>
    )
  }

  return (
    <>
      {selectedMovie && (
        <MovieDetailModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onDelete={onDelete}
          onUpdateRating={onUpdateRating}
        />
      )}

      <div className="space-y-3">
        {/* Refresh button */}
        <div className="flex justify-end">
          <button
            onClick={onRefresh}
            className="text-xs text-muted hover:text-white transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {[...movies].reverse().map((movie, i) => {
          const key = movieKey(movie)
          const isEditing = editingKey === key
          const isSaving = savingKey === key

          return (
            <div
              key={i}
              className="bg-card border border-border rounded-lg p-4 hover:border-accent/40 transition-colors group"
            >
              <div className="flex gap-4">
                {/* Poster */}
                <button
                  type="button"
                  onClick={() => setSelectedMovie(movie)}
                  className="shrink-0"
                >
                  {movie.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-16 h-24 object-cover rounded hover:opacity-80 transition-opacity"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-16 h-24 bg-surface border border-border rounded flex items-center justify-center text-2xl hover:opacity-80 transition-opacity">
                      🎬
                    </div>
                  )}
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMovie(movie)}
                      className="min-w-0 text-left"
                    >
                      <h3 className="text-white font-medium leading-tight hover:text-accent transition-colors">
                        {movie.title}
                        {movie.year && <span className="text-muted font-normal ml-1.5 text-sm">({movie.year})</span>}
                      </h3>
                      {movie.director && <p className="text-xs text-muted mt-0.5">Dir. {movie.director}</p>}
                    </button>

                    {/* Rating + inline edit */}
                    <div className="shrink-0">
                      {isEditing ? (
                        <div className="flex flex-col items-end gap-1.5">
                          <RatingScale value={pendingRating} onChange={setPendingRating} compact />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleInlineSave(movie)}
                              disabled={isSaving}
                              className="text-xs text-accent hover:underline disabled:opacity-50"
                            >
                              {isSaving ? '...' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingKey(null)}
                              className="text-xs text-muted hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {movie.myRating > 0 && (
                            <div className="text-right">
                              <div className="text-white font-bold">{movie.myRating}<span className="text-muted text-sm">/10</span></div>
                              <div className="text-xs text-muted">my rating</div>
                            </div>
                          )}
                          <button
                            onClick={() => { setPendingRating(movie.myRating); setEditingKey(key) }}
                            className="text-muted hover:text-accent transition-colors opacity-0 group-hover:opacity-100 p-1"
                            title="Edit rating"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <span className="text-xs bg-surface border border-border rounded px-2 py-0.5 text-muted">
                      {CONTENT_TYPE_LABELS[movie.type]}
                    </span>
                    {movie.rated && (
                      <span className="text-xs border border-border rounded px-1.5 py-0.5 text-muted">{movie.rated}</span>
                    )}
                    {movie.runtime && <span className="text-xs text-muted">{movie.runtime}</span>}
                    {movie.genre && <span className="text-xs text-muted truncate max-w-[160px]">{movie.genre}</span>}
                  </div>

                  {/* Ratings */}
                  <div className="flex flex-wrap gap-3 mt-1.5 text-xs">
                    {movie.imdbRating && movie.imdbRating !== 'N/A' && (
                      <span className="text-yellow-400">⭐ IMDB {movie.imdbRating}</span>
                    )}
                    {movie.rottenTomatoes && <span className="text-red-400">🍅 {movie.rottenTomatoes}</span>}
                    {movie.metacritic && <span className="text-green-400">🎯 {movie.metacritic}</span>}
                  </div>

                  {/* Notes */}
                  {movie.myNotes && (
                    <p className="text-xs text-muted mt-1.5 italic">"{movie.myNotes}"</p>
                  )}

                  {/* Read more + date */}
                  <div className="flex items-center justify-between mt-2">
                    <button
                      onClick={() => setSelectedMovie(movie)}
                      className="text-xs text-accent hover:underline"
                    >
                      Read more
                    </button>
                    <p className="text-xs text-muted/50">{movie.dateAdded}</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
