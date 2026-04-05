interface OmdbRatings {
  imdbRating: string
  rottenTomatoes: string
  metacritic: string
  imdbVotes: string
  boxOffice: string
}

// Fetches only ratings from OMDB using an IMDB ID.
// Returns null if OMDB is unavailable or daily limit is hit — callers should handle gracefully.
export async function fetchOmdbRatings(imdbId: string): Promise<OmdbRatings | null> {
  if (!imdbId) return null

  try {
    const res = await fetch(
      `https://www.omdbapi.com/?i=${encodeURIComponent(imdbId)}&apikey=${process.env.OMDB_API_KEY}`
    )
    if (!res.ok) return null

    const data = await res.json()
    if (data.Response === 'False') return null

    const ratings: Array<{ Source: string; Value: string }> = data.Ratings || []

    return {
      imdbRating:      data.imdbRating || 'N/A',
      rottenTomatoes:  ratings.find(r => r.Source === 'Rotten Tomatoes')?.Value || '',
      metacritic:      ratings.find(r => r.Source === 'Metacritic')?.Value || '',
      imdbVotes:       data.imdbVotes || '',
      boxOffice:       data.BoxOffice || '',
    }
  } catch {
    // Network error or rate limit — return null so the caller can continue without ratings
    return null
  }
}
