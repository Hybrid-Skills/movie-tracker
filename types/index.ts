export type ContentType = 'feature' | 'documentary' | 'anime' | 'animated' | 'tvshow'

export interface Movie {
  title: string
  type: ContentType
  myRating: number
  myNotes: string
  imdbRating: string
  rottenTomatoes: string
  genre: string
  plot: string
  dateAdded: string
  posterUrl: string
}

export interface OmdbResult {
  Title: string
  imdbRating: string
  Genre: string
  Type: string
  Poster: string
  Plot: string
  Ratings: Array<{ Source: string; Value: string }>
  Response: string
  Error?: string
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
