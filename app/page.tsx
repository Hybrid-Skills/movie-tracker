'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import AuthButton from '@/components/AuthButton'
import Logo from '@/components/Logo'
import ProfileManager from '@/components/ProfileManager'
import MovieForm from '@/components/MovieForm'
import MovieList from '@/components/MovieList'
import RecommendationsTab from '@/components/RecommendationsTab'
import type { Movie } from '@/types'

type Tab = 'tracker' | 'recommendations'

export default function Home() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<Tab>('tracker')
  const [profiles, setProfiles] = useState<string[]>([])
  const [activeProfile, setActiveProfile] = useState('Default')
  const [movies, setMovies] = useState<Movie[]>([])
  const [moviesLoading, setMoviesLoading] = useState(false)

  const activeProfileRef = useRef(activeProfile)
  activeProfileRef.current = activeProfile

  async function fetchMovies() {
    setMoviesLoading(true)
    const res = await fetch(`/api/movies?profile=${encodeURIComponent(activeProfileRef.current)}`)
    if (res.ok) {
      const data = await res.json()
      setMovies(data.movies)
    }
    setMoviesLoading(false)
  }

  useEffect(() => {
    if (!session) return
    let cancelled = false
    async function loadProfiles() {
      const res = await fetch('/api/profiles')
      if (!res.ok || cancelled) return
      const data = await res.json()
      setProfiles(data.profiles)
      setActiveProfile(prev => data.profiles.includes(prev) ? prev : (data.profiles[0] || 'Default'))
    }
    loadProfiles()
    return () => { cancelled = true }
  }, [session])

  useEffect(() => {
    if (!session || !activeProfile) return
    let cancelled = false
    async function loadMovies() {
      setMoviesLoading(true)
      const res = await fetch(`/api/movies?profile=${encodeURIComponent(activeProfile)}`)
      if (!cancelled && res.ok) {
        const data = await res.json()
        setMovies(data.movies)
      }
      if (!cancelled) setMoviesLoading(false)
    }
    loadMovies()
    return () => { cancelled = true }
  }, [session, activeProfile])

  function handleMovieAdded(movie: Movie) {
    setMovies(prev => [...prev, movie])
  }

  async function handleDeleteMovie(movie: Movie) {
    const res = await fetch('/api/movies', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: movie.title, dateAdded: movie.dateAdded, profile: activeProfile }),
    })
    if (res.ok) {
      setMovies(prev => prev.filter(m => !(m.title === movie.title && m.dateAdded === movie.dateAdded)))
    }
  }

  async function handleUpdateRating(movie: Movie, rating: number) {
    const res = await fetch('/api/movies', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: movie.title, dateAdded: movie.dateAdded, profile: activeProfile, myRating: rating }),
    })
    if (res.ok) {
      setMovies(prev => prev.map(m =>
        m.title === movie.title && m.dateAdded === movie.dateAdded
          ? { ...m, myRating: rating }
          : m
      ))
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Logo size={32} />
            <h1 className="text-xl font-bold text-white">
              <span className="text-accent">Movie</span> Tracker
            </h1>
          </div>
          <AuthButton />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {status === 'loading' && (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {status === 'unauthenticated' && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-5xl mb-4">🎬</p>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to Movie Tracker</h2>
            <p className="text-muted mb-6 max-w-sm">
              Log your movies, get AI-powered recommendations, and sync everything to your Google Sheets.
            </p>
            <AuthButton />
          </div>
        )}

        {status === 'authenticated' && (
          <div className="space-y-5">
            {/* Profile Manager */}
            <ProfileManager
              profiles={profiles}
              activeProfile={activeProfile}
              onSelect={setActiveProfile}
              onProfilesChange={async () => {
                const res = await fetch('/api/profiles')
                if (res.ok) {
                  const data = await res.json()
                  setProfiles(data.profiles)
                  setActiveProfile(prev => data.profiles.includes(prev) ? prev : (data.profiles[0] || 'Default'))
                }
              }}
            />

            {/* Tabs */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab('tracker')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'tracker'
                    ? 'border-accent text-white'
                    : 'border-transparent text-muted hover:text-white'
                }`}
              >
                My List
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'recommendations'
                    ? 'border-accent text-white'
                    : 'border-transparent text-muted hover:text-white'
                }`}
              >
                Recommendations
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'tracker' && (
              <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5">
                <MovieForm profile={activeProfile} movies={movies} onAdded={handleMovieAdded} />
                <MovieList
                  movies={movies}
                  loading={moviesLoading}
                  onRefresh={() => fetchMovies()}
                  onDelete={handleDeleteMovie}
                  onUpdateRating={handleUpdateRating}
                />
              </div>
            )}

            {activeTab === 'recommendations' && (
              <RecommendationsTab profile={activeProfile} />
            )}
          </div>
        )}
      </main>
    </div>
  )
}
