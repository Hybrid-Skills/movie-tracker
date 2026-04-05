import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { searchTmdb, fetchTmdbDetails } from '@/lib/tmdb'
import { fetchOmdbRatings } from '@/lib/omdb'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const search = req.nextUrl.searchParams.get('search')
  const id = req.nextUrl.searchParams.get('id')
  const mediaType = (req.nextUrl.searchParams.get('type') || 'movie') as 'movie' | 'tv'

  if (search) {
    const results = await searchTmdb(search)
    return NextResponse.json({ results })
  }

  if (id) {
    const tmdbData = await fetchTmdbDetails(Number(id), mediaType)

    // Try OMDB for ratings — gracefully continue if it fails
    const ratings = await fetchOmdbRatings(tmdbData.imdbId)

    return NextResponse.json({
      ...tmdbData,
      imdbRating:     ratings?.imdbRating     || 'N/A',
      rottenTomatoes: ratings?.rottenTomatoes  || '',
      metacritic:     ratings?.metacritic      || '',
      imdbVotes:      ratings?.imdbVotes       || '',
      boxOffice:      ratings?.boxOffice       || '',
      omdbAvailable: ratings !== null,
    })
  }

  return NextResponse.json({ error: 'Provide search or id param' }, { status: 400 })
}
