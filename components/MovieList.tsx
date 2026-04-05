'use client'

import type { Movie } from '@/types'
import { CONTENT_TYPE_LABELS } from '@/types'

interface MovieListProps {
  movies: Movie[]
  loading: boolean
}

export default function MovieList({ movies, loading }: MovieListProps) {
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
    <div className="space-y-3">
      {[...movies].reverse().map((movie, i) => (
        <div key={i} className="bg-card border border-border rounded-lg p-4 hover:border-accent/40 transition-colors">
          <div className="flex gap-4">
            {/* Poster */}
            {movie.posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-16 h-24 object-cover rounded shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-24 bg-surface border border-border rounded shrink-0 flex items-center justify-center text-2xl">
                🎬
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-white font-medium">{movie.title}</h3>
                  <div className="text-right shrink-0 space-y-0.5">
                    {movie.myRating > 0 && (
                      <div className="text-white font-bold">{movie.myRating}<span className="text-muted text-sm">/10</span></div>
                    )}
                    {movie.imdbRating && movie.imdbRating !== 'N/A' && (
                      <div className="text-xs text-yellow-400">⭐ IMDB {movie.imdbRating}</div>
                    )}
                    {movie.rottenTomatoes && (
                      <div className="text-xs text-red-400">🍅 {movie.rottenTomatoes}</div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs bg-surface border border-border rounded px-2 py-0.5 text-muted">
                    {CONTENT_TYPE_LABELS[movie.type]}
                  </span>
                  {movie.genre && (
                    <span className="text-xs text-muted">{movie.genre}</span>
                  )}
                </div>
                {movie.plot && (
                  <p className="text-sm text-gray-400 mt-1.5 line-clamp-2">{movie.plot}</p>
                )}
                {movie.myNotes && (
                  <p className="text-sm text-muted mt-1 italic">"{movie.myNotes}"</p>
                )}
              </div>
              <p className="text-xs text-muted mt-2">{movie.dateAdded}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
