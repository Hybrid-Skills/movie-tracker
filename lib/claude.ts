import Anthropic from '@anthropic-ai/sdk'
import type { Movie, ContentType, Recommendation } from '@/types'
import { CONTENT_TYPE_LABELS } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function getRecommendations(
  movies: Movie[],
  contentType: ContentType | 'any',
  genre: string
): Promise<Recommendation[]> {
  const movieList = movies
    .map(m => `- ${m.title} (${CONTENT_TYPE_LABELS[m.type]}) | My rating: ${m.myRating}/10 | IMDB: ${m.imdbRating} | Genre: ${m.genre}${m.myNotes ? ` | Notes: ${m.myNotes}` : ''}`)
    .join('\n')

  const typeFilter = contentType !== 'any' ? CONTENT_TYPE_LABELS[contentType] : 'any type'
  const genreFilter = genre || 'any genre'

  const prompt = `You are a movie and TV recommendation expert. Based on the user's watch history and ratings below, recommend 8 titles they would enjoy.

Filters requested:
- Content type: ${typeFilter}
- Genre: ${genreFilter}

User's watched list:
${movieList || 'No movies logged yet — recommend highly acclaimed titles.'}

Instructions:
- Recommend titles NOT already in the watched list
- Match the requested type and genre filters strictly
- Prioritize recommendations based on their highest-rated titles and notes
- Return ONLY a valid JSON array with exactly this shape, no other text:
[
  {
    "title": "Title",
    "year": "2023",
    "genre": "Drama, Thriller",
    "reason": "One sentence why they'd like it based on their taste",
    "imdbRating": "8.5"
  }
]`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  // Extract JSON from response
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('Invalid response from Claude')

  return JSON.parse(jsonMatch[0]) as Recommendation[]
}
