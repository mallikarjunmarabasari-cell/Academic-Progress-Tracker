import type { NextApiRequest, NextApiResponse } from 'next'

type ProgressEntry = {
  title: string
  status?: string
  notes?: string | null
}

type SummaryPayload = {
  entries?: ProgressEntry[]
}

function createFallbackSummary(entries: ProgressEntry[]) {
  const planned = entries.filter((entry) => entry.status === 'planned').length
  const inProgress = entries.filter((entry) => entry.status === 'in-progress').length
  const done = entries.filter((entry) => entry.status === 'done').length

  const topItems = entries.slice(0, 3).map((entry) => `- ${entry.title}`).join('\n')

  return [
    `Progress snapshot: ${planned} planned, ${inProgress} in progress, and ${done} completed items.`,
    '',
    'Highlights:',
    topItems || '- No entries yet.',
  ].join('\n')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  const body = req.body as SummaryPayload
  const entries = body.entries ?? []

  if (!entries.length) {
    return res.status(400).json({ error: 'No progress entries provided.' })
  }

  const apiKey = process.env.OPENAI_API_KEY

  if (apiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You summarize department performance items into a short, useful executive summary for ADPAIS.',
            },
            {
              role: 'user',
              content: `Create a concise AI summary of these progress items:\n${entries
                .map((entry) => `- ${entry.title} [${entry.status}] ${entry.notes ? `Notes: ${entry.notes}` : ''}`)
                .join('\n')}`,
            },
          ],
          temperature: 0.4,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const summary = data?.choices?.[0]?.message?.content?.trim()

        if (summary) {
          return res.status(200).json({ summary, provider: 'openai' })
        }
      }
    } catch (error) {
      console.error('OpenAI summary failed:', error)
    }
  }

  return res.status(200).json({ summary: createFallbackSummary(entries), provider: 'fallback' })
}
