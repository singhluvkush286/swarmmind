import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import * as dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// ----------------------------------------------------
// Azure OpenAI config — all values from .env
// ----------------------------------------------------
function getAzureConfig() {
  const apiKey      = process.env.AZURE_OPENAI_API_KEY
  const endpoint    = process.env.AZURE_OPENAI_ENDPOINT
  const apiVersion  = process.env.AZURE_OPENAI_API_VERSION
  const deployment  = process.env.AZURE_OPENAI_DEPLOYMENT
  const maxTokens   = parseInt(process.env.AZURE_OPENAI_MAX_TOKENS   || '800',  10)
  const temperature = parseFloat(process.env.AZURE_OPENAI_TEMPERATURE || '0.7')
  const pythonUrl   = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000'

  const missing = []
  if (!apiKey)     missing.push('AZURE_OPENAI_API_KEY')
  if (!endpoint)   missing.push('AZURE_OPENAI_ENDPOINT')
  if (!apiVersion) missing.push('AZURE_OPENAI_API_VERSION')
  if (!deployment) missing.push('AZURE_OPENAI_DEPLOYMENT')
  if (missing.length) throw new Error(`Missing .env vars: ${missing.join(', ')}`)

  return {
    apiKey,
    endpoint: endpoint.replace(/\/$/, ''),
    apiVersion,
    deployment,
    maxTokens,
    temperature,
    pythonUrl,
  }
}

// ----------------------------------------------------
// Health — checks both config and Python backend
// ----------------------------------------------------
app.get('/health', async (req, res) => {
  try {
    const { endpoint, deployment, apiVersion, pythonUrl } = getAzureConfig()

    // Ping the FastAPI backend health endpoint
    let pythonStatus = 'unreachable'
    try {
      const r = await fetch(`${pythonUrl}/health`, { signal: AbortSignal.timeout(3000) })
      pythonStatus = r.ok ? 'ok' : `error (${r.status})`
    } catch {
      pythonStatus = 'unreachable'
    }

    res.json({
      status: 'ok',
      provider: 'Azure OpenAI',
      key_loaded: true,
      deployment,
      endpoint,
      api_version: apiVersion,
      python_backend: pythonStatus,
    })
  } catch (err) {
    res.status(500).json({ status: 'error', key_loaded: false, message: err.message })
  }
})

// ----------------------------------------------------
// POST /api/swarm  — proxy to Python FastAPI backend
// This is the main SwarmMind endpoint used by the frontend
// ----------------------------------------------------
app.post('/api/swarm', async (req, res) => {
  try {
    const { pythonUrl } = getAzureConfig()

    const { mission, stream = false } = req.body

    if (!mission || !mission.trim()) {
      return res.status(400).json({ error: { message: 'Mission cannot be empty.' } })
    }
    if (mission.length > 2000) {
      return res.status(400).json({ error: { message: 'Mission too long (max 2000 chars).' } })
    }

    console.log('\n=== SWARM REQUEST ===')
    console.log('Mission:', mission.substring(0, 120))

    const response = await fetch(`${pythonUrl}/api/swarm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mission, stream }),
    })

    const text = await response.text()

    console.log('STATUS:', response.status)
    console.log('BODY (preview):', text.substring(0, 300))
    console.log('====================\n')

    if (!response.ok) {
      let detail = `Python backend error ${response.status}`
      try { detail = JSON.parse(text)?.detail || detail } catch {}
      return res.status(response.status).json({ error: { message: detail } })
    }

    return res.json(JSON.parse(text))

  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: { message: err.message } })
  }
})

// ----------------------------------------------------
// POST /api/chat  — direct Azure OpenAI (simple chat,
// bypass Python backend — useful for quick tests)
// ----------------------------------------------------
app.post('/api/chat', async (req, res) => {
  try {
    const { apiKey, endpoint, apiVersion, deployment, maxTokens, temperature } = getAzureConfig()

    const {
      model      = deployment,
      messages   = [],
      system     = '',
      max_tokens = maxTokens,
    } = req.body

    const payloadMessages = []
    if (system) payloadMessages.push({ role: 'system', content: system })
    payloadMessages.push(...messages)

    const url = `${endpoint}/openai/deployments/${model}/chat/completions?api-version=${apiVersion}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ messages: payloadMessages, max_tokens, stream: false, temperature }),
    })

    const text = await response.text()

    console.log('\n=== CHAT RESPONSE ===')
    console.log('STATUS:', response.status)
    console.log('BODY:', text.substring(0, 500))
    console.log('=====================\n')

    const data = JSON.parse(text)

    if (!response.ok) {
      return res.status(response.status).json({
        error: { message: data?.error?.message || `Azure OpenAI error ${response.status}` },
      })
    }

    return res.json({
      content: [{ type: 'text', text: data?.choices?.[0]?.message?.content || '' }],
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: { message: err.message } })
  }
})

// ----------------------------------------------------
// Start
// ----------------------------------------------------
const PORT = parseInt(process.env.PORT || '3001', 10)

app.listen(PORT, async () => {
  console.log(`\n✅ SwarmMind Node proxy  → http://localhost:${PORT}`)
  console.log(`   /api/swarm  proxies  → Python FastAPI backend`)
  console.log(`   /api/chat   hits     → Azure OpenAI directly\n`)

  try {
    const { endpoint, deployment, apiVersion, pythonUrl } = getAzureConfig()
    console.log(`   Azure endpoint  : ${endpoint}`)
    console.log(`   Deployment      : ${deployment}`)
    console.log(`   API version     : ${apiVersion}`)
    console.log(`   Python backend  : ${pythonUrl}`)

    // Quick ping to Python backend on startup
    try {
      const r = await fetch(`${pythonUrl}/health`, { signal: AbortSignal.timeout(2000) })
      console.log(`   Python health   : ${r.ok ? '✓ OK' : `✗ HTTP ${r.status}`}`)
    } catch {
      console.log(`   Python health   : ✗ not reachable (start main.py first)`)
    }

    console.log(`   Azure config    : ✓ loaded\n`)
  } catch (err) {
    console.log(`   Config error    : ✗ ${err.message}\n`)
  }
})