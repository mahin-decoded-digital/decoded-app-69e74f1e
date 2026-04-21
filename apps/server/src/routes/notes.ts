import { Router } from 'express'
import { db } from '../lib/db.js'

const router = Router()

type UserDoc = {
  _id: string
  token: string | null
}

type NoteDoc = {
  _id: string
  userId: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

type SettingsDoc = {
  _id: string
  userId: string
  retentionDays: number
}

const DEFAULT_RETENTION_DAYS = 14

const getToken = (authorization: string | undefined): string => {
  if (typeof authorization !== 'string') return ''
  return authorization.replace(/^Bearer\s+/i, '').trim()
}

const getAuthedUserId = async (authorization: string | undefined): Promise<string | null> => {
  const token = getToken(authorization)
  if (!token) return null
  const users = await db.collection('users').find({ token })
  const user = users[0] as UserDoc | undefined
  return user?._id ?? null
}

const normalizeTags = (tags: unknown): string[] => {
  if (!Array.isArray(tags)) return []
  return tags
    .map((tag) => String(tag).trim().toLowerCase())
    .filter((tag) => tag.length > 0)
}

const serializeNote = (note: NoteDoc) => ({
  id: note._id,
  userId: note.userId,
  title: note.title,
  content: note.content,
  tags: note.tags,
  createdAt: note.createdAt,
  updatedAt: note.updatedAt,
  deletedAt: note.deletedAt,
})

router.get('/', async (req, res) => {
  const userId = await getAuthedUserId(req.headers.authorization)
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const notes = await db.collection('notes').find({ userId })
  res.json(notes.map((note) => serializeNote(note as NoteDoc)))
})

router.get('/settings', async (req, res) => {
  const userId = await getAuthedUserId(req.headers.authorization)
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const settings = await db.collection('noteSettings').find({ userId })
  const current = settings[0] as SettingsDoc | undefined
  res.json({ retentionDays: current?.retentionDays ?? DEFAULT_RETENTION_DAYS })
})

router.put('/settings', async (req, res) => {
  const userId = await getAuthedUserId(req.headers.authorization)
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const body = req.body as { retentionDays?: number | string }
  const retentionDays = Number(body.retentionDays)

  if (!Number.isInteger(retentionDays) || retentionDays < 1 || retentionDays > 90) {
    res.status(400).json({ error: 'Retention must be a whole number between 1 and 90 days.' })
    return
  }

  const settings = await db.collection('noteSettings').find({ userId })
  const existing = settings[0] as SettingsDoc | undefined

  if (existing) {
    await db.collection('noteSettings').updateOne(existing._id, { retentionDays })
    const updated = await db.collection('noteSettings').findById(existing._id)
    res.json({ retentionDays: Number((updated as SettingsDoc | null)?.retentionDays ?? retentionDays) })
    return
  }

  const id = await db.collection('noteSettings').insertOne({ userId, retentionDays })
  const created = await db.collection('noteSettings').findById(id)
  res.json({ retentionDays: Number((created as SettingsDoc | null)?.retentionDays ?? retentionDays) })
})

router.post('/cleanup-expired-trash', async (req, res) => {
  const userId = await getAuthedUserId(req.headers.authorization)
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const settings = await db.collection('noteSettings').find({ userId })
  const current = settings[0] as SettingsDoc | undefined
  const retentionDays = current?.retentionDays ?? DEFAULT_RETENTION_DAYS
  const notes = await db.collection('notes').find({ userId })

  let removed = 0
  for (const rawNote of notes) {
    const note = rawNote as NoteDoc
    if (!note.deletedAt) continue

    const deletedAtMs = new Date(String(note.deletedAt)).getTime()
    const expiryMs = deletedAtMs + retentionDays * 24 * 60 * 60 * 1000
    if (expiryMs <= Date.now()) {
      const ok = await db.collection('notes').deleteOne(note._id)
      if (ok) removed += 1
    }
  }

  const updatedNotes = await db.collection('notes').find({ userId })
  res.json({ removed, notes: updatedNotes.map((note) => serializeNote(note as NoteDoc)) })
})

router.post('/', async (req, res) => {
  const userId = await getAuthedUserId(req.headers.authorization)
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const body = req.body as { title?: string; content?: string; tags?: unknown }
  const now = new Date().toISOString()
  const id = await db.collection('notes').insertOne({
    userId,
    title: String(body.title ?? ''),
    content: String(body.content ?? ''),
    tags: normalizeTags(body.tags),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  })

  const note = await db.collection('notes').findById(id)
  if (!note) {
    res.status(500).json({ error: 'Failed to create note.' })
    return
  }

  res.status(201).json(serializeNote(note as NoteDoc))
})

router.get('/:id', async (req, res) => {
  const userId = await getAuthedUserId(req.headers.authorization)
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const note = await db.collection('notes').findById(String(req.params.id))
  if (!note || String((note as NoteDoc).userId) !== userId) {
    res.status(404).json({ error: 'Not found' })
    return
  }

  res.json(serializeNote(note as NoteDoc))
})

router.put('/:id', async (req, res) => {
  const userId = await getAuthedUserId(req.headers.authorization)
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const note = await db.collection('notes').findById(String(req.params.id))
  if (!note || String((note as NoteDoc).userId) !== userId) {
    res.status(404).json({ error: 'Not found' })
    return
  }

  const body = req.body as {
    title?: string
    content?: string
    tags?: unknown
    deletedAt?: string | null
  }

  const update: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  }

  if (body.title !== undefined) update.title = String(body.title)
  if (body.content !== undefined) update.content = String(body.content)
  if (body.tags !== undefined) update.tags = normalizeTags(body.tags)
  if (body.deletedAt !== undefined) update.deletedAt = body.deletedAt === null ? null : String(body.deletedAt)

  const ok = await db.collection('notes').updateOne(String(req.params.id), update)
  if (!ok) {
    res.status(404).json({ error: 'Not found' })
    return
  }

  const updated = await db.collection('notes').findById(String(req.params.id))
  if (!updated) {
    res.status(404).json({ error: 'Not found' })
    return
  }

  res.json(serializeNote(updated as NoteDoc))
})

router.delete('/:id', async (req, res) => {
  const userId = await getAuthedUserId(req.headers.authorization)
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const note = await db.collection('notes').findById(String(req.params.id))
  if (!note || String((note as NoteDoc).userId) !== userId) {
    res.status(404).json({ error: 'Not found' })
    return
  }

  const ok = await db.collection('notes').deleteOne(String(req.params.id))
  if (!ok) {
    res.status(404).json({ error: 'Not found' })
    return
  }

  res.json({ success: true })
})

router.delete('/trash/all', async (req, res) => {
  const userId = await getAuthedUserId(req.headers.authorization)
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const notes = await db.collection('notes').find({ userId })
  let removed = 0
  for (const rawNote of notes) {
    const note = rawNote as NoteDoc
    if (note.deletedAt === null) continue
    const ok = await db.collection('notes').deleteOne(note._id)
    if (ok) removed += 1
  }

  res.json({ success: true, removed })
})

export default router