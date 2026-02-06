const express = require('express')
const { createServer } = require('express-zod-api')
const { z } = require('zod')
const cookieParser = require('cookie-parser')
const { PrismaClient } = require('@prisma/client')
const { randomUUID } = require('crypto')
const util = require('util')

const prisma = new PrismaClient()

const app = express()
app.use(express.json())
app.use(cookieParser())

// Fallback: mount a plain Express route for /login to avoid express-zod-api runtime issues
app.post('/login', async (req, res) => {
  try {
    const { email } = req.body || {}
    if (!email) return res.status(400).json({ error: 'missing email' })

    let user = await prisma.user.findFirst({ where: { email } })
    if (!user) {
      user = await prisma.user.create({ data: { uid: email, email, name: email.split('@')[0] } })
    }

    const token = randomUUID()
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    await prisma.session.create({ data: { sessionToken: token, userId: user.id, expires } })

    res.cookie('next-auth.session-token', token, { httpOnly: true, path: '/', expires })
    res.status(200).json({ ok: true })
  } catch (e) {
    console.error('/login error', e)
    res.status(500).json({ error: 'server error' })
  }
})

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`API listening on ${port}`))
