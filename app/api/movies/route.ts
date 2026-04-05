import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getOrCreateSpreadsheet, getMovies, addMovie, deleteMovie, updateMovieRating } from '@/lib/sheets'
import type { Movie, MovieDetails } from '@/types'

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
  const { title, type, myRating, myNotes, profile = 'Default', details } = body as {
    title: string
    type: string
    myRating: number
    myNotes: string
    profile: string
    details: MovieDetails | null
  }

  if (!title || !type) {
    return NextResponse.json({ error: 'Title and type are required' }, { status: 400 })
  }

  const movie: Movie = {
    title,
    type: type as Movie['type'],
    myRating: Number(myRating) || 0,
    myNotes: myNotes || '',
    dateAdded: new Date().toISOString().split('T')[0],
    imdbId:         details?.imdbId         || '',
    year:           details?.year           || '',
    rated:          details?.rated          || '',
    released:       details?.released       || '',
    runtime:        details?.runtime        || '',
    genre:          details?.genre          || '',
    director:       details?.director       || '',
    writer:         details?.writer         || '',
    actors:         details?.actors         || '',
    plot:           details?.plot           || '',
    language:       details?.language       || '',
    country:        details?.country        || '',
    awards:         details?.awards         || '',
    posterUrl:      details?.posterUrl      || '',
    imdbRating:     details?.imdbRating     || 'N/A',
    rottenTomatoes: details?.rottenTomatoes || '',
    metacritic:     details?.metacritic     || '',
    imdbVotes:      details?.imdbVotes      || '',
    boxOffice:      details?.boxOffice      || '',
    tmdbId:         details?.tmdbId         || '',
    tmdbRating:     details?.tmdbRating     || '',
    tmdbVotes:      details?.tmdbVotes      || '',
    tagline:        details?.tagline        || '',
  }

  try {
    const spreadsheetId = await getOrCreateSpreadsheet(session.accessToken)
    await addMovie(session.accessToken, spreadsheetId, profile, movie)
    return NextResponse.json({ success: true, movie })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to add movie' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, dateAdded, profile = 'Default' } = await req.json()

  try {
    const spreadsheetId = await getOrCreateSpreadsheet(session.accessToken)
    await deleteMovie(session.accessToken, spreadsheetId, profile, title, dateAdded)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete movie' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, dateAdded, profile = 'Default', myRating } = await req.json()

  try {
    const spreadsheetId = await getOrCreateSpreadsheet(session.accessToken)
    await updateMovieRating(session.accessToken, spreadsheetId, profile, title, dateAdded, Number(myRating))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update rating' }, { status: 500 })
  }
}
