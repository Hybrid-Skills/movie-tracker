import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getOrCreateSpreadsheet, listProfiles, createProfile, deleteProfile, renameProfile } from '@/lib/sheets'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const spreadsheetId = await getOrCreateSpreadsheet(session.accessToken)
    const profiles = await listProfiles(session.accessToken, spreadsheetId)
    return NextResponse.json({ profiles, spreadsheetId })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    const details = (err as { response?: { data?: unknown } })?.response?.data
    console.error('[profiles GET]', message, details)
    return NextResponse.json({ error: message, details }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name } = await req.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Profile name is required' }, { status: 400 })
  }

  try {
    const spreadsheetId = await getOrCreateSpreadsheet(session.accessToken)
    await createProfile(session.accessToken, spreadsheetId, name.trim())
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { oldName, newName } = await req.json()
  if (!oldName?.trim() || !newName?.trim()) {
    return NextResponse.json({ error: 'Old and new names are required' }, { status: 400 })
  }

  try {
    const spreadsheetId = await getOrCreateSpreadsheet(session.accessToken)
    await renameProfile(session.accessToken, spreadsheetId, oldName.trim(), newName.trim())
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to rename profile' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name } = await req.json()

  try {
    const spreadsheetId = await getOrCreateSpreadsheet(session.accessToken)
    const profiles = await listProfiles(session.accessToken, spreadsheetId)

    if (profiles.length <= 1) {
      return NextResponse.json({ error: 'Cannot delete the only profile' }, { status: 400 })
    }

    await deleteProfile(session.accessToken, spreadsheetId, name)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 })
  }
}
