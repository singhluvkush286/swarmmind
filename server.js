import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import * as dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const GROQ_API_KEY = process.env.GROQ_API_KEY

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', key_loaded: !!GROQ_API_KEY, provider: 'Groq (free)' })
})

// Proxy — forwards to Groq API (free, fast, no credit card)
app.post('/api/chat', async (req, res) => {
  if (!GROQ_API_KEY) {
    return res.status(500).json({
      error: { message: 'GROQ_API_KEY not set in .env — get free key at https://console.groq.com' }
    })
  }

  try {
    const { system, messages, max_tokens } = req.body
    const userMsg = messages?.[0]?.content || ''

    const groqMessages = []
    if (system) groqMessages.push({ role: 'system', content: system })
    groqMessages.push({ role: 'user', content: userMsg })

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',   // best free model on Groq
        messages: groqMessages,
        max_tokens: max_tokens || 600,
        temperature: 0.7
      })
    })

    const data = await response.json()

    if (!response.ok || data.error) {
      const msg = data?.error?.message || 'Groq API error'
      console.error('Groq error:', msg)
      return res.status(response.status).json({ error: { message: msg } })
    }

    const text = data?.choices?.[0]?.message?.content || ''
    console.log(`  ✓ Groq llama-3.3-70b responded (${text.length} chars)`)

    // Return in Anthropic-style so App.jsx works unchanged
    res.json({ content: [{ type: 'text', text }] })

  } catch (err) {
    console.error('Proxy error:', err.message)
    res.status(500).json({ error: { message: err.message } })
  }
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`\n✅ SwarmMind proxy → http://localhost:${PORT}`)
  console.log(`   Provider : Groq (free tier)`)
  console.log(`   Model    : llama-3.3-70b-versatile`)
  console.log(`   API key  : ${GROQ_API_KEY ? 'LOADED ✓' : 'MISSING ✗ — add GROQ_API_KEY to .env'}\n`)
})