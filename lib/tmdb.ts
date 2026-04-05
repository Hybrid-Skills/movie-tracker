import type { SearchResult, MovieDetails } from '@/types'

const BASE = 'https://api.themoviedb.org/3'
const IMG = 'https://image.tmdb.org/t/p/w500'

function img(path: string | null): string {
  return path ? `${IMG}${path}` : ''
}

async function tmdbFetch(path: string) {
  const res = await fetch(`${BASE}${path}${path.includes('?') ? '&' : '?'}api_key=${process.env.TMDB_API_KEY}`)
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`)
  return res.json()
}

export async function searchTmdb(query: string): Promise<SearchResult[]> {
  const data = await tmdbFetch(`/search/multi?query=${encodeURIComponent(query)}&include_adult=false`)

  return (data.results || [])
    .filter((r: Record<string, unknown>) => r.media_type === 'movie' || r.media_type === 'tv')
    .slice(0, 10)
    .map((r: Record<string, unknown>) => ({
      tmdbId: r.id as number,
      title: r.media_type === 'movie' ? r.title : r.name,
      year: ((r.media_type === 'movie' ? r.release_date : r.first_air_date) as string || '').slice(0, 4),
      mediaType: r.media_type as 'movie' | 'tv',
      posterUrl: img(r.poster_path as string | null),
      tmdbRating: r.vote_average ? (r.vote_average as number).toFixed(1) : '',
    }))
}

export async function fetchTmdbDetails(tmdbId: number, mediaType: 'movie' | 'tv'): Promise<Omit<MovieDetails, 'imdbRating' | 'rottenTomatoes' | 'metacritic' | 'imdbVotes' | 'boxOffice'>> {
  const append = mediaType === 'movie'
    ? 'external_ids,credits,release_dates'
    : 'external_ids,credits,content_ratings'

  const d = await tmdbFetch(`/${mediaType}/${tmdbId}?append_to_response=${append}`)

  const title = mediaType === 'movie' ? d.title : d.name
  const year = ((mediaType === 'movie' ? d.release_date : d.first_air_date) || '').slice(0, 4)
  const released = mediaType === 'movie' ? (d.release_date || '') : (d.first_air_date || '')
  const runtime = mediaType === 'movie'
    ? (d.runtime ? `${d.runtime} min` : '')
    : (d.episode_run_time?.[0] ? `${d.episode_run_time[0]} min` : '')

  const genre = (d.genres || []).map((g: { name: string }) => g.name).join(', ')

  const crew: Array<{ job: string; name: string }> = d.credits?.crew || []
  const director = crew.find(c => c.job === 'Director')?.name
    || crew.find(c => c.job === 'Series Director')?.name
    || ''

  const cast: Array<{ name: string }> = d.credits?.cast || []
  const actors = cast.slice(0, 5).map(c => c.name).join(', ')

  const country = mediaType === 'movie'
    ? (d.production_countries?.[0]?.name || '')
    : (d.origin_country?.[0] || '')

  // Content rating
  let rated = ''
  if (mediaType === 'movie') {
    const us = (d.release_dates?.results || []).find((r: { iso_3166_1: string }) => r.iso_3166_1 === 'US')
    rated = (us?.release_dates || []).find((rd: { certification: string }) => rd.certification)?.certification || ''
  } else {
    const us = (d.content_ratings?.results || []).find((r: { iso_3166_1: string }) => r.iso_3166_1 === 'US')
    rated = us?.rating || ''
  }

  return {
    tmdbId: String(tmdbId),
    imdbId: d.external_ids?.imdb_id || '',
    title,
    year,
    rated,
    released,
    runtime,
    genre,
    director,
    writer: '',
    actors,
    plot: d.overview || '',
    tagline: d.tagline || '',
    language: d.original_language || '',
    country,
    awards: '',
    posterUrl: img(d.poster_path),
    tmdbRating: d.vote_average ? d.vote_average.toFixed(1) : '',
    tmdbVotes: d.vote_count ? String(d.vote_count) : '',
  }
}
