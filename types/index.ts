export type ContentType = 'feature' | 'documentary' | 'anime' | 'animated' | 'tvshow'

export interface Movie {
  // User fields
  title: string
  type: ContentType
  myRating: number
  myNotes: string
  dateAdded: string
  // OMDB fields (kept for backward compat with existing sheet data)
  imdbId: string
  year: string
  rated: string
  released: string
  runtime: string
  genre: string
  director: string
  writer: string
  actors: string
  plot: string
  language: string
  country: string
  awards: string
  posterUrl: string
  imdbRating: string
  rottenTomatoes: string
  metacritic: string
  imdbVotes: string
  boxOffice: string
  // TMDB fields
  tmdbId: string
  tmdbRating: string
  tmdbVotes: string
  tagline: string
}

// Returned from TMDB search
export interface SearchResult {
  tmdbId: number
  title: string
  year: string
  mediaType: 'movie' | 'tv'
  posterUrl: string
  tmdbRating: string
}

// Full details combining TMDB + OMDB ratings — sent from form to /api/movies
export interface MovieDetails {
  tmdbId: string
  imdbId: string
  title: string
  year: string
  rated: string
  released: string
  runtime: string
  genre: string
  director: string
  writer: string
  actors: string
  plot: string
  tagline: string
  language: string
  country: string
  awards: string
  posterUrl: string
  tmdbRating: string
  tmdbVotes: string
  // OMDB ratings (empty if OMDB failed or limit hit)
  imdbRating: string
  rottenTomatoes: string
  metacritic: string
  imdbVotes: string
  boxOffice: string
}

export interface Recommendation {
  title: string
  year: string
  genre: string
  reason: string
  imdbRating: string
}

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  feature: 'Feature Film',
  documentary: 'Documentary',
  anime: 'Anime',
  animated: 'Animated Movie',
  tvshow: 'TV Show',
}
