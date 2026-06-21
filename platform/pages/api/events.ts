import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

type EventBody = {
  title: string
  description?: string
  startTime: string
  createdById?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const events = await prisma.event.findMany({
      orderBy: { startTime: 'asc' },
      include: { createdBy: { select: { id: true, email: true, name: true, role: true } } },
    })
    return res.status(200).json(events)
  }

  if (req.method === 'POST') {
    const body = req.body as EventBody

    if (!body?.title || !body?.startTime) {
      return res.status(400).json({ error: 'Missing required fields: title, startTime' })
    }

    const createdEvent = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description ?? null,
        startTime: new Date(body.startTime),
        createdBy: body.createdById ? { connect: { id: body.createdById } } : undefined,
      },
      include: { createdBy: { select: { id: true, email: true, name: true, role: true } } },
    })

    return res.status(201).json(createdEvent)
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).json({ error: `Method ${req.method} not allowed` })
}
