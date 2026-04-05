import { google } from 'googleapis'
import { getGoogleAuthClient } from './google-auth'
import type { Movie } from '@/types'

const SPREADSHEET_NAME = 'Movie Tracker'
const HEADERS = ['Title', 'Type', 'My Rating', 'My Notes', 'IMDB Rating', 'Rotten Tomatoes', 'Genre', 'Plot', 'Date Added', 'Poster URL']

// Find or create the Movie Tracker spreadsheet in the user's Drive.
// drive.file scope limits the search to files this app created.
export async function getOrCreateSpreadsheet(accessToken: string): Promise<string> {
  const auth = getGoogleAuthClient(accessToken)
  const drive = google.drive({ version: 'v3', auth })

  const res = await drive.files.list({
    q: `name='${SPREADSHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  })

  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id!
  }

  // Not found — create it
  const sheets = google.sheets({ version: 'v4', auth })
  const created = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: SPREADSHEET_NAME },
      sheets: [
        {
          properties: { title: 'Default' },
          data: [{ rowData: [{ values: HEADERS.map(h => ({ userEnteredValue: { stringValue: h } })) }] }],
        },
      ],
    },
  })

  return created.data.spreadsheetId!
}

// List all profile names (sheet tabs)
export async function listProfiles(accessToken: string, spreadsheetId: string): Promise<string[]> {
  const auth = getGoogleAuthClient(accessToken)
  const sheets = google.sheets({ version: 'v4', auth })

  const res = await sheets.spreadsheets.get({ spreadsheetId })
  return (res.data.sheets || []).map(s => s.properties?.title || '').filter(Boolean)
}

// Create a new profile (sheet tab)
export async function createProfile(accessToken: string, spreadsheetId: string, profileName: string): Promise<void> {
  const auth = getGoogleAuthClient(accessToken)
  const sheets = google.sheets({ version: 'v4', auth })

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title: profileName } } }],
    },
  })

  // Add headers to new sheet
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${profileName}'!A1:J1`,
    valueInputOption: 'RAW',
    requestBody: { values: [HEADERS] },
  })
}

// Rename a profile (sheet tab)
export async function renameProfile(accessToken: string, spreadsheetId: string, oldName: string, newName: string): Promise<void> {
  const auth = getGoogleAuthClient(accessToken)
  const sheets = google.sheets({ version: 'v4', auth })

  const meta = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = meta.data.sheets?.find(s => s.properties?.title === oldName)
  if (!sheet?.properties?.sheetId) throw new Error('Profile not found')

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ updateSheetProperties: { properties: { sheetId: sheet.properties.sheetId, title: newName }, fields: 'title' } }],
    },
  })
}

// Delete a profile (sheet tab)
export async function deleteProfile(accessToken: string, spreadsheetId: string, profileName: string): Promise<void> {
  const auth = getGoogleAuthClient(accessToken)
  const sheets = google.sheets({ version: 'v4', auth })

  const meta = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = meta.data.sheets?.find(s => s.properties?.title === profileName)
  if (!sheet?.properties?.sheetId) throw new Error('Profile not found')

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ deleteSheet: { sheetId: sheet.properties.sheetId } }],
    },
  })
}

// Get all movies for a profile
export async function getMovies(accessToken: string, spreadsheetId: string, profile: string): Promise<Movie[]> {
  const auth = getGoogleAuthClient(accessToken)
  const sheets = google.sheets({ version: 'v4', auth })

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${profile}'!A2:J`,
  })

  const rows = res.data.values || []
  return rows
    .filter(row => row[0])
    .map(row => ({
      title: row[0] || '',
      type: (row[1] || 'feature') as Movie['type'],
      myRating: Number(row[2]) || 0,
      myNotes: row[3] || '',
      imdbRating: row[4] || 'N/A',
      rottenTomatoes: row[5] || '',
      genre: row[6] || '',
      plot: row[7] || '',
      dateAdded: row[8] || '',
      posterUrl: row[9] || '',
    }))
}

// Append a movie to a profile
export async function addMovie(accessToken: string, spreadsheetId: string, profile: string, movie: Movie): Promise<void> {
  const auth = getGoogleAuthClient(accessToken)
  const sheets = google.sheets({ version: 'v4', auth })

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `'${profile}'!A:J`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        movie.title,
        movie.type,
        movie.myRating,
        movie.myNotes,
        movie.imdbRating,
        movie.rottenTomatoes,
        movie.genre,
        movie.plot,
        movie.dateAdded,
        movie.posterUrl,
      ]],
    },
  })
}
