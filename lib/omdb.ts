import type { OmdbResult } from '@/types'

export async function fetchMovieData(title: string): Promise<{
  imdbRating: string
  rottenTomatoes: string
  genre: string
  plot: string
  posterUrl: string
} | null> {
  const apiKey = process.env.OMDB_API_KEY
  const url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`

  const res = await fetch(url)
  const data: OmdbResult = await res.json()

  if (data.Response === 'False') return null

  const rtRating = data.Ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value || ''

  return {
    imdbRating: data.imdbRating || 'N/A',
    rottenTomatoes: rtRating,
    genre: data.Genre || '',
    plot: data.Plot || '',
    posterUrl: data.Poster !== 'N/A' ? data.Poster : '',
  }
}
