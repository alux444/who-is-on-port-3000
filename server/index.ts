import express from 'express'
import cors from 'cors'
import { dockerRouter } from './routes/docker.js'
import { portsRouter } from './routes/ports.js'
import { processesRouter } from './routes/processes.js'
import { gitRouter } from './routes/git.js'
import { SERVER_PORT, FRONTEND_URL } from './config.js'

const app = express()

app.use(cors({ origin: FRONTEND_URL }))
app.use(express.json())

app.use('/api/docker', dockerRouter)
app.use('/api/ports', portsRouter)
app.use('/api/processes', processesRouter)
app.use('/api/git', gitRouter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(SERVER_PORT, () => {
  console.log(`Server running on http://localhost:${SERVER_PORT}`)
})
