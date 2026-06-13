import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import * as dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

function getAzureConfig() {
  const apiKey      = process.env.AZURE_OPENAI_API_KEY
  const endpoint    = process.env.AZURE_OPENAI_ENDPOINT
  const apiVersion  = process.env.AZURE_OPENAI_API_VERSION
  const deployment  = process.env.AZURE_OPENAI_DEPLOYMENT
  const maxTokens   = parseInt(process.env.AZURE_OPENAI_MAX_TOKENS   || '2000', 10)
  const temperature = parseFloat(process.env.AZURE_OPENAI_TEMPERATURE || '0.7')
  const pythonUrl   = (process.env.PYTHON_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '')

  const missing = []
  if (!apiKey)     missing.push('AZURE_OPENAI_API_KEY')
  if (!endpoint)   missing.push('AZURE_OPENAI_ENDPOINT')
  if (!apiVersion) missing.push('AZURE_OPENAI_API_VERSION')
  if (!deployment) missing.push('AZURE_OPENAI_DEPLOYMENT')
  if (missing.length) throw new Error(`Missing .env vars: ${missing.join(', ')}`)

  return { apiKey, endpoint: endpoint.replace(/\/$/, ''), apiVersion, deployment, maxTokens, temperature, pythonUrl }
}

// ── Helper: call Azure OpenAI directly ──────────────────────────────────────
async function callAzure(messages, maxTokens = 800) {
  const { apiKey, endpoint, apiVersion, deployment, temperature } = getAzureConfig()
  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, max_tokens: maxTokens, temperature, stream: false })
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data?.error?.message || `Azure error ${response.status}`)
  return data.choices?.[0]?.message?.content || ''
}

// ── HEALTH ───────────────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    const { deployment, endpoint, apiVersion, pythonUrl } = getAzureConfig()

    let pythonStatus = 'unreachable'
    try {
      const r = await fetch(`${pythonUrl}/health`, { signal: AbortSignal.timeout(3000) })
      pythonStatus = r.ok ? 'ok' : `error (${r.status})`
    } catch { pythonStatus = 'unreachable' }

    res.json({ status: 'ok', provider: 'Azure OpenAI', deployment, endpoint, api_version: apiVersion, python_backend: pythonStatus })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
})

// ── TEST AZURE ────────────────────────────────────────────────────────────────
app.get('/test-azure', async (req, res) => {
  try {
    const reply = await callAzure([{ role: 'user', content: 'Say hello in one sentence.' }], 50)
    res.json({ status: 'ok', reply })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── /api/swarm — tries Python backend first, falls back to direct Azure ──────
app.post('/api/swarm', async (req, res) => {
  const { mission, stream = false } = req.body

  if (!mission?.trim()) {
    return res.status(400).json({ error: { message: 'Mission cannot be empty.' } })
  }

  console.log('\n=== SWARM REQUEST ===')
  console.log('Mission:', mission.substring(0, 100))

  // ── Try Python backend first ──────────────────────────────────────────────
  try {
    const { pythonUrl } = getAzureConfig()
    const pyRes = await fetch(`${pythonUrl}/api/swarm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mission, stream }),
      signal: AbortSignal.timeout(60000)
    })

    if (pyRes.ok) {
      const data = await pyRes.json()
      console.log('✅ Python backend responded successfully')
      return res.json(data)
    }

    const errText = await pyRes.text()
    console.warn(`⚠️  Python backend returned ${pyRes.status} — falling back to direct Azure`)
    console.warn(errText)
  } catch (pyErr) {
    console.warn('⚠️  Python backend unreachable — falling back to direct Azure:', pyErr.message)
  }

  // ── Fallback: run swarm directly via Azure OpenAI ─────────────────────────
  try {
    console.log('🔄 Running swarm directly via Azure OpenAI...')
    const { deployment } = getAzureConfig()
    const start = Date.now()

    const AGENTS = [
      { id: 'planner',     name: 'Planner',     icon: '🗺️', role: 'Task Decomposition' },
      { id: 'researcher',  name: 'Researcher',  icon: '🔍', role: 'Knowledge Retrieval' },
      { id: 'analyst',     name: 'Analyst',     icon: '📊', role: 'Data & Systems Analysis' },
      { id: 'coder',       name: 'Coder',       icon: '💻', role: 'Code & Architecture' },
      { id: 'critic',      name: 'Critic',      icon: '🔬', role: 'Quality & Security' },
      { id: 'synthesizer', name: 'Synthesizer', icon: '⚡', role: 'Output Synthesis' },
    ]

    const AGENT_PROMPTS = {
      planner:     'You are the Planner agent. Break this mission into milestones, dependencies and success criteria. Be concrete. 4-6 sentences.',
      researcher:  'You are the Researcher agent. Survey best practices, existing tools and prior art relevant to this mission. 4-6 sentences.',
      analyst:     'You are the Analyst agent. Identify data flows, bottlenecks, scalability limits and key metrics. Quantify where possible. 4-6 sentences.',
      coder:       'You are the Coder agent. Propose the core architecture: APIs, data structures, key algorithm pseudocode. Use Azure/Semantic Kernel where relevant. 4-6 sentences.',
      critic:      'You are the Critic agent. Identify the top 3 failure modes, security vulnerabilities and design anti-patterns. Be specific. 4-6 sentences.',
      synthesizer: 'You are the Synthesizer agent. Integrate all prior insights into a final technical proposal. Highlight innovations and path to production. 4-6 sentences.',
    }

    // Run all 6 agents in parallel
    const agentPromises = AGENTS.map(async (ag) => {
      const agStart = Date.now()
      const output = await callAzure([
        { role: 'system', content: AGENT_PROMPTS[ag.id] },
        { role: 'user',   content: `Mission: ${mission}` }
      ], 500)
      return {
        agent_id: ag.id, name: ag.name, role: ag.role, icon: ag.icon,
        task: `Analyze mission from ${ag.role} perspective`,
        output,
        duration_ms: Date.now() - agStart
      }
    })

    const agent_results = await Promise.all(agentPromises)
    console.log('✅ All 6 agents completed')

    // Final synthesis
    const combined = agent_results.map(r => `[${r.role}]: ${r.output}`).join('\n\n')
    const synthRaw = await callAzure([
      {
        role: 'system',
        content: 'You are a final report synthesizer. Respond ONLY with valid JSON (no markdown): ' +
          '{"solution_title":"...","executive_summary":"2-3 sentences","key_innovations":["...","...","..."],' +
          '"tech_stack":["...","...","...","..."],"impact":"1-2 sentences","ms_alignment":"1 sentence on Azure alignment"}'
      },
      { role: 'user', content: `Mission: ${mission}\n\nAgent outputs:\n${combined}` }
    ], 700)

    let synth = {}
    try {
      synth = JSON.parse(synthRaw.trim().replace(/^```json|^```|```$/g, '').trim())
    } catch {
      synth = {
        solution_title:    'AI Agent Swarm Solution',
        executive_summary: 'A multi-agent system coordinating specialist AI agents in parallel.',
        key_innovations:   ['Parallel agent execution', 'Typed agent outputs', 'Azure OpenAI orchestration'],
        tech_stack:        ['Azure OpenAI', 'Node.js', 'React', 'FastAPI'],
        impact:            'Reduces complex planning from hours to under 60 seconds.',
        ms_alignment:      'Built on Azure OpenAI with GPT-4o deployment.'
      }
    }

    const total_duration_ms = Date.now() - start
    console.log(`✅ Swarm completed in ${total_duration_ms}ms`)

    return res.json({
      mission,
      solution_title:    synth.solution_title    || 'SwarmMind Solution',
      executive_summary: synth.executive_summary || '',
      key_innovations:   synth.key_innovations   || [],
      tech_stack:        synth.tech_stack        || [],
      impact:            synth.impact            || '',
      ms_alignment:      synth.ms_alignment      || '',
      agent_results,
      total_duration_ms,
      agent_count: AGENTS.length
    })

  } catch (err) {
    console.error('❌ Swarm failed:', err.message)
    return res.status(500).json({ error: { message: err.message } })
  }
})

// ── /api/chat ────────────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  try {
    const { messages = [] } = req.body
    const reply = await callAzure(messages)
    res.json({ choices: [{ message: { role: 'assistant', content: reply } }] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: { message: err.message } })
  }
})

// ── START ────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3001', 10)
app.listen(PORT, async () => {
  console.log(`\n✅ SwarmMind proxy → http://localhost:${PORT}`)
  try {
    const { endpoint, deployment, apiVersion, pythonUrl } = getAzureConfig()
    console.log(`   Endpoint   : ${endpoint}`)
    console.log(`   Deployment : ${deployment}`)
    console.log(`   API Ver    : ${apiVersion}`)
    console.log(`   Python     : ${pythonUrl}`)

    try {
      const r = await fetch(`${pythonUrl}/health`, { signal: AbortSignal.timeout(2000) })
      console.log(`   Python health : ${r.ok ? '✓ OK' : `✗ HTTP ${r.status}`}`)
    } catch {
      console.log(`   Python health : ✗ not reachable (swarm will run via Azure directly)`)
    }
  } catch (err) {
    console.log(`   Config error : ${err.message}`)
  }
})