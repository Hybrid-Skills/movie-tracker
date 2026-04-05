import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { fetchMovieData } from '@/lib/omdb'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const title = req.nextUrl.searchParams.get('title')
  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const data = await fetchMovieData(title)
  return NextResponse.json(data || { imdbRating: 'N/A', genre: '' })
}
