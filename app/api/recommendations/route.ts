import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { getOrCreateSpreadsheet, getMovies } from '@/lib/sheets'
import { getRecommendations } from '@/lib/claude'
import type { ContentType } from '@/types'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { profile = 'Default', contentType = 'any', genre = '' } = await req.json()

  try {
    const spreadsheetId = await getOrCreateSpreadsheet(session.accessToken)
    const movies = await getMovies(session.accessToken, spreadsheetId, profile)
    const recommendations = await getRecommendations(movies, contentType as ContentType | 'any', genre)
    return NextResponse.json({ recommendations })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 })
  }
}
