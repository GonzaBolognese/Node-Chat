import express from 'express'
import logger from 'morgan'
import path from 'path'
import dotenv from 'dotenv'
import { createClient } from '@libsql/client'

import { Server } from 'socket.io'
import { createServer } from 'node:http'

dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  connectionStateRecovery: {
    maxDisconnectionDuration: {}
  }
})

const db = createClient({
  url: 'libsql://proper-silver-surfer-gonzabolognese.turso.io',
  authToken: process.env.DB_TOKEN
})

await db.execute(`
  CREATE TABLE IF NOT EXISTS messages(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT
  )
`)

io.on('connection', (socket) => {
  console.log('a user has connected!')

  socket.on('disconnect', () => {
    console.log('an user has disconnected!')
  })

  socket.on('chat message', async (msg) => {
    let result
    try {
      result = await db.execute({
        sql: 'INSERT INTO messages (content) VALUES (:msg)',
        args: { msg }
      })
    } catch (e) {
      console.error(e)
      return
    }
    io.emit('chat message', msg)
  })
})

app.use(logger('dev'))

const port = process.env.PORT ?? 3000

app.use(express.static(path.join(process.cwd(), 'client')))

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'client', 'index.html'))
})

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})
