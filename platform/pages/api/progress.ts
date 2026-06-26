import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

type ProgressBody = {
  title: string
  status?: string
  notes?: string
  createdById?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const entries = await prisma.progressEntry.findMany({
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { id: true, email: true, name: true, role: true } } },
    })
    return res.status(200).json(entries)
  }

  if (req.method === 'POST') {
    const body = req.body as ProgressBody

    if (!body?.title) {
      return res.status(400).json({ error: 'Missing required field: title' })
    }

    const createdEntry = await prisma.progressEntry.create({
      data: {
        title: body.title,
        status: body.status ?? 'planned',
        notes: body.notes ?? null,
        createdBy: body.createdById ? { connect: { id: body.createdById } } : undefined,
      },
      include: { createdBy: { select: { id: true, email: true, name: true, role: true } } },
    })

    return res.status(201).json(createdEntry)
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).json({ error: `Method ${req.method} not allowed` })
}
