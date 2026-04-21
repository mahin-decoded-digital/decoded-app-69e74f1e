import { Router } from 'express'
import { randomUUID, createHash } from 'crypto'
import { db } from '../lib/db.js'

const router = Router()

type UserDoc = {
  _id: string
  email: string
  name: string
  passwordHash: string
  createdAt: string
  token: string | null
}

const sanitizeUser = (user: UserDoc) => ({
  id: user._id,
  email: user.email,
  name: user.name,
  createdAt: user.createdAt,
})

const hashPassword = (password: string): string => {
  return createHash('sha256').update(password).digest('hex')
}

router.get('/me', async (req, res) => {
  const token = typeof req.headers.authorization === 'string'
    ? req.headers.authorization.replace(/^Bearer\s+/i, '').trim()
    : ''

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const users = await db.collection('users').find({ token })
  const user = users[0] as UserDoc | undefined

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  res.json({ user: sanitizeUser(user), token })
})

router.post('/signup', async (req, res) => {
  const body = req.body as { name?: string; email?: string; password?: string }
  const name = String(body.name ?? '').trim()
  const email = String(body.email ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')

  if (name.length < 2 || !email.includes('@') || password.length < 8) {
    res.status(400).json({ error: 'Please provide a name, valid email, and password with at least 8 characters.' })
    return
  }

  const existingUsers = await db.collection('users').find({ email })
  if (existingUsers[0]) {
    res.status(409).json({ error: 'An account with that email already exists.' })
    return
  }

  const now = new Date().toISOString()
  const token = randomUUID()
  const id = await db.collection('users').insertOne({
    email,
    name,
    passwordHash: hashPassword(password),
    createdAt: now,
    token,
  })

  const created = await db.collection('users').findById(id)
  if (!created) {
    res.status(500).json({ error: 'Failed to create account.' })
    return
  }

  res.status(201).json({ user: sanitizeUser(created as UserDoc), token })
})

router.post('/login', async (req, res) => {
  const body = req.body as { email?: string; password?: string }
  const email = String(body.email ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' })
    return
  }

  const users = await db.collection('users').find({ email })
  const user = users[0] as UserDoc | undefined

  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: 'Incorrect email or password.' })
    return
  }

  const token = randomUUID()
  await db.collection('users').updateOne(user._id, { token })
  const updated = await db.collection('users').findById(user._id)

  if (!updated) {
    res.status(500).json({ error: 'Failed to sign in.' })
    return
  }

  res.json({ user: sanitizeUser(updated as UserDoc), token })
})

router.post('/logout', async (req, res) => {
  const token = typeof req.headers.authorization === 'string'
    ? req.headers.authorization.replace(/^Bearer\s+/i, '').trim()
    : ''

  if (!token) {
    res.json({ success: true })
    return
  }

  const users = await db.collection('users').find({ token })
  const user = users[0] as UserDoc | undefined

  if (user) {
    await db.collection('users').updateOne(user._id, { token: null })
  }

  res.json({ success: true })
})

export default router