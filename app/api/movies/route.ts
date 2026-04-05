import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { getOrCreateSpreadsheet, getMovies, addMovie } from '@/lib/sheets'
import { fetchMovieData } from '@/lib/omdb'
import type { Movie } from '@/types'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profile = req.nextUrl.searchParams.get('profile') || 'Default'

  try {
    const spreadsheetId = await getOrCreateSpreadsheet(session.accessToken)
    const movies = await getMovies(session.accessToken, spreadsheetId, profile)
    return NextResponse.json({ movies, spreadsheetId })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { title, type, myRating, myNotes, profile = 'Default' } = body

  if (!title || !type) {
    return NextResponse.json({ error: 'Title and type are required' }, { status: 400 })
  }

  try {
    // Fetch IMDB data from OMDB
    const omdbData = await fetchMovieData(title)

    const movie: Movie = {
      title,
      type,
      myRating: Number(myRating) || 0,
      myNotes: myNotes || '',
      imdbRating: omdbData?.imdbRating || 'N/A',
      rottenTomatoes: omdbData?.rottenTomatoes || '',
      genre: omdbData?.genre || '',
      plot: omdbData?.plot || '',
      dateAdded: new Date().toISOString().split('T')[0],
      posterUrl: omdbData?.posterUrl || '',
    }

    const spreadsheetId = await getOrCreateSpreadsheet(session.accessToken)
    await addMovie(session.accessToken, spreadsheetId, profile, movie)

    return NextResponse.json({ success: true, movie })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to add movie' }, { status: 500 })
  }
}
