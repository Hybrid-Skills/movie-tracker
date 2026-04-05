import { google } from 'googleapis'
import { getGoogleAuthClient } from './google-auth'
import type { Movie } from '@/types'

const SPREADSHEET_NAME = 'Movie Tracker'
const HEADERS = [
  'Title', 'Type', 'My Rating', 'My Notes', 'Date Added',
  'IMDB ID', 'Year', 'Rated', 'Released', 'Runtime',
  'Genre', 'Director', 'Writer', 'Actors', 'Plot',
  'Language', 'Country', 'Awards', 'Poster URL',
  'IMDB Rating', 'Rotten Tomatoes', 'Metacritic', 'IMDB Votes', 'Box Office',
  'TMDB ID', 'TMDB Rating', 'TMDB Votes', 'Tagline',
]
const LAST_COL = 'AB'

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

  const sheets = google.sheets({ version: 'v4', auth })
  const created = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: SPREADSHEET_NAME },
      sheets: [{
        properties: { title: 'Default' },
        data: [{ rowData: [{ values: HEADERS.map(h => ({ userEnteredValue: { stringValue: h } })) }] }],
      }],
    },
  })

  return created.data.spreadsheetId!
}

export async function listProfiles(accessToken: string, spreadsheetId: string): Promise<string[]> {
  const auth = getGoogleAuthClient(accessToken)
  const sheets = google.sheets({ version: 'v4', auth })
  const res = await sheets.spreadsheets.get({ spreadsheetId })
  return (res.data.sheets || []).map(s => s.properties?.title || '').filter(Boolean)
}

export async function createProfile(accessToken: string, spreadsheetId: string, profileName: string): Promise<void> {
  const auth = getGoogleAuthClient(accessToken)
  const sheets = google.sheets({ version: 'v4', auth })

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: [{ addSheet: { properties: { title: profileName } } }] },
  })

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${profileName}'!A1:${LAST_COL}1`,
    valueInputOption: 'RAW',
    requestBody: { values: [HEADERS] },
  })
}

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

export async function deleteProfile(accessToken: string, spreadsheetId: string, profileName: string): Promise<void> {
  const auth = getGoogleAuthClient(accessToken)
  const sheets = google.sheets({ version: 'v4', auth })

  const meta = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = meta.data.sheets?.find(s => s.properties?.title === profileName)
  if (!sheet?.properties?.sheetId) throw new Error('Profile not found')

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: [{ deleteSheet: { sheetId: sheet.properties.sheetId } }] },
  })
}

export async function getMovies(accessToken: string, spreadsheetId: string, profile: string): Promise<Movie[]> {
  const auth = getGoogleAuthClient(accessToken)
  const sheets = google.sheets({ version: 'v4', auth })

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${profile}'!A2:${LAST_COL}`,
  })

  return (res.data.values || [])
    .filter(row => row[0])
    .map(row => ({
      title:          row[0]  || '',
      type:           (row[1] || 'feature') as Movie['type'],
      myRating:       Number(row[2]) || 0,
      myNotes:        row[3]  || '',
      dateAdded:      row[4]  || '',
      imdbId:         row[5]  || '',
      year:           row[6]  || '',
      rated:          row[7]  || '',
      released:       row[8]  || '',
      runtime:        row[9]  || '',
      genre:          row[10] || '',
      director:       row[11] || '',
      writer:         row[12] || '',
      actors:         row[13] || '',
      plot:           row[14] || '',
      language:       row[15] || '',
      country:        row[16] || '',
      awards:         row[17] || '',
      posterUrl:      row[18] || '',
      imdbRating:     row[19] || 'N/A',
      rottenTomatoes: row[20] || '',
      metacritic:     row[21] || '',
      imdbVotes:      row[22] || '',
      boxOffice:      row[23] || '',
      tmdbId:         row[24] || '',
      tmdbRating:     row[25] || '',
      tmdbVotes:      row[26] || '',
      tagline:        row[27] || '',
    }))
}

export async function addMovie(accessToken: string, spreadsheetId: string, profile: string, movie: Movie): Promise<void> {
  const auth = getGoogleAuthClient(accessToken)
  const sheets = google.sheets({ version: 'v4', auth })

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `'${profile}'!A:${LAST_COL}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        movie.title, movie.type, movie.myRating, movie.myNotes, movie.dateAdded,
        movie.imdbId, movie.year, movie.rated, movie.released, movie.runtime,
        movie.genre, movie.director, movie.writer, movie.actors, movie.plot,
        movie.language, movie.country, movie.awards, movie.posterUrl,
        movie.imdbRating, movie.rottenTomatoes, movie.metacritic, movie.imdbVotes, movie.boxOffice,
        movie.tmdbId, movie.tmdbRating, movie.tmdbVotes, movie.tagline,
      ]],
    },
  })
}

export async function deleteMovie(
  accessToken: string,
  spreadsheetId: string,
  profile: string,
  title: string,
  dateAdded: string
): Promise<void> {
  const auth = getGoogleAuthClient(accessToken)
  const sheets = google.sheets({ version: 'v4', auth })

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${profile}'!A2:E`,
  })

  const rows = res.data.values || []
  const rowIndex = rows.findIndex(row => row[0] === title && row[4] === dateAdded)
  if (rowIndex === -1) throw new Error('Movie not found')

  const meta = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = meta.data.sheets?.find(s => s.properties?.title === profile)
  if (!sheet?.properties?.sheetId) throw new Error('Profile not found')

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: sheet.properties.sheetId,
            dimension: 'ROWS',
            startIndex: rowIndex + 1, // skip header row (0-indexed)
            endIndex: rowIndex + 2,
          },
        },
      }],
    },
  })
}

export async function updateMovieRating(
  accessToken: string,
  spreadsheetId: string,
  profile: string,
  title: string,
  dateAdded: string,
  rating: number
): Promise<void> {
  const auth = getGoogleAuthClient(accessToken)
  const sheets = google.sheets({ version: 'v4', auth })

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${profile}'!A2:E`,
  })

  const rows = res.data.values || []
  const rowIndex = rows.findIndex(row => row[0] === title && row[4] === dateAdded)
  if (rowIndex === -1) throw new Error('Movie not found')

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${profile}'!C${rowIndex + 2}`, // 1-based, +1 for header, +1 for 1-based
    valueInputOption: 'RAW',
    requestBody: { values: [[rating]] },
  })
}
