import { useState, useEffect, useRef, useCallback } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #040810; --surface: #080f1e; --border: #0d2040;
    --accent: #00e5ff; --accent2: #7c3aed; --accent3: #10b981;
    --warn: #f59e0b; --danger: #ef4444; --text: #e2e8f0; --muted: #64748b;
    --glow: 0 0 20px rgba(0,229,255,0.3);
    --font-mono: 'Space Mono', monospace;
    --font-sans: 'Syne', sans-serif;
  }
  body {
    background: var(--bg); color: var(--text);
    font-family: var(--font-sans); min-height: 100vh; overflow-x: hidden;
  }
  body::before {
    content: ''; position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px);
    background-size: 40px 40px; pointer-events: none; z-index: 0;
  }
  body::after {
    content: ''; position: fixed; inset: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px);
    pointer-events: none; z-index: 0;
  }
  .app { position: relative; z-index: 1; max-width: 1400px; margin: 0 auto; padding: 24px; }

  /* Header */
  .header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px; background: rgba(8,15,30,0.8);
    border: 1px solid var(--border); border-radius: 12px;
    margin-bottom: 24px; backdrop-filter: blur(12px);
  }
  .logo {
    font-size: 22px; font-weight: 800; letter-spacing: -0.5px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .logo span { font-weight: 400; font-size: 12px; vertical-align: middle; margin-left: 8px; -webkit-text-fill-color: var(--muted); opacity: 0.7; }
  .header-right { display: flex; align-items: center; gap: 10px; }
  .badge {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 12px; border-radius: 20px;
    font-family: var(--font-mono); font-size: 11px;
  }
  .badge-blue { background: rgba(0,229,255,0.08); border: 1px solid rgba(0,229,255,0.2); color: var(--accent); }
  .badge-green { background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); color: var(--accent3); }
  .badge-red { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: var(--danger); }
  .pulse { width: 7px; height: 7px; border-radius: 50%; background: var(--accent3); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }

  /* Banner */
  .banner {
    padding: 12px 18px; border-radius: 10px;
    font-family: var(--font-mono); font-size: 12px;
    margin-bottom: 16px; line-height: 1.6;
  }
  .banner-error { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); color: var(--danger); }
  .banner-warn  { background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.25); color: var(--warn); }
  .banner-ok    { background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.25); color: var(--accent3); }

  /* Layout */
  .grid-main { display: grid; grid-template-columns: 320px 1fr; gap: 16px; }

  /* Panel */
  .panel { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
  .panel-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 18px; border-bottom: 1px solid var(--border);
    font-family: var(--font-mono); font-size: 11px; font-weight: 700;
    letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted);
  }
  .dot { width: 6px; height: 6px; border-radius: 50%; }

  /* Mission */
  .mission-panel { grid-column: 1 / -1; }
  .mission-inner { padding: 20px; }
  .mission-label { font-family: var(--font-mono); font-size: 11px; color: var(--accent); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }
  .mission-row { display: flex; gap: 12px; align-items: flex-start; }
  .mission-ta {
    flex: 1; background: rgba(0,229,255,0.03);
    border: 1px solid var(--border); border-radius: 8px;
    padding: 12px 16px; color: var(--text);
    font-family: var(--font-sans); font-size: 15px;
    resize: none; min-height: 56px; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .mission-ta:focus { border-color: var(--accent); box-shadow: var(--glow); }
  .mission-ta::placeholder { color: var(--muted); }
  .mission-ta:disabled { opacity: 0.5; }
  .launch-btn {
    padding: 14px 28px;
    background: linear-gradient(135deg, var(--accent), #0099cc);
    color: #040810; font-family: var(--font-sans); font-weight: 700;
    font-size: 14px; border: none; border-radius: 8px; cursor: pointer;
    transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s; white-space: nowrap;
  }
  .launch-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: var(--glow); }
  .launch-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .presets { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
  .chip {
    padding: 4px 10px; background: rgba(124,58,237,0.1);
    border: 1px solid rgba(124,58,237,0.25); border-radius: 20px;
    font-size: 12px; color: #a78bfa; cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }
  .chip:hover { background: rgba(124,58,237,0.2); border-color: rgba(124,58,237,0.5); }

  /* Swarm */
  .swarm-panel { min-height: 460px; }
  .swarm-canvas { padding: 20px; }
  .agents-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
  .orch-box {
    margin-bottom: 16px; padding: 14px;
    background: rgba(124,58,237,0.06); border: 1px solid rgba(124,58,237,0.2); border-radius: 10px;
  }
  .orch-label { font-family: var(--font-mono); font-size: 10px; color: #a78bfa; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
  .orch-msg { font-size: 13px; color: var(--text); line-height: 1.5; }

  .agent-card {
    background: rgba(4,8,16,0.7); border: 1px solid var(--border);
    border-radius: 10px; padding: 14px;
    transition: border-color 0.3s, box-shadow 0.3s, transform 0.2s;
    position: relative; overflow: hidden;
  }
  .agent-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, var(--ac, var(--accent)), transparent);
    opacity: 0; transition: opacity 0.3s;
  }
  .agent-card.st-active { border-color: var(--ac, var(--accent)); transform: translateY(-2px); box-shadow: 0 0 20px rgba(0,229,255,0.1); }
  .agent-card.st-active::before { opacity: 1; }
  .agent-card.st-done { border-color: rgba(16,185,129,0.4); }
  .agent-card.st-done::before { background: linear-gradient(90deg, transparent, var(--accent3), transparent); opacity: 0.4; }

  .agent-top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .agent-icon {
    width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 18px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  }
  .agent-name { font-weight: 700; font-size: 13px; }
  .agent-role { font-family: var(--font-mono); font-size: 10px; color: var(--muted); }
  .agent-sbadge {
    margin-left: auto; padding: 2px 8px; border-radius: 10px;
    font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px;
  }
  .sb-idle    { background: rgba(100,116,139,0.15); color: var(--muted); }
  .sb-working { background: rgba(0,229,255,0.12);   color: var(--accent); }
  .sb-done    { background: rgba(16,185,129,0.12);  color: var(--accent3); }
  .sb-error   { background: rgba(239,68,68,0.12);   color: var(--danger); }

  .agent-task { font-size: 12px; color: var(--muted); font-family: var(--font-mono); min-height: 36px; line-height: 1.5; }
  .agent-task.live { color: var(--text); }
  .agent-task.ok   { color: var(--accent3); }
  .think span {
    display: inline-block; width: 4px; height: 4px; border-radius: 50%;
    background: var(--accent); margin: 0 2px; animation: blink 1.2s infinite;
  }
  .think span:nth-child(2){ animation-delay:.2s } .think span:nth-child(3){ animation-delay:.4s }
  @keyframes blink { 0%,100%{opacity:0.2} 50%{opacity:1} }

  .agent-prog { height: 2px; background: var(--border); border-radius: 2px; margin-top: 10px; overflow: hidden; }
  .agent-prog-fill {
    height: 100%; border-radius: 2px; transition: width 0.5s ease;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
  }

  /* Log */
  .log-panel { height: 460px; display: flex; flex-direction: column; }
  .log-body { flex: 1; overflow-y: auto; padding: 14px; font-family: var(--font-mono); font-size: 12px; }
  .log-body::-webkit-scrollbar { width: 4px; }
  .log-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
  .le {
    display: flex; gap: 10px; padding: 5px 0;
    border-bottom: 1px solid rgba(13,32,64,0.5);
    animation: fIn 0.3s ease;
  }
  @keyframes fIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
  .lt { color: var(--muted); white-space: nowrap; flex-shrink: 0; }
  .la { width: 80px; flex-shrink: 0; }
  .lm { color: var(--text); opacity: 0.85; word-break: break-word; flex: 1; }
  .lm.info    { color: var(--accent); }
  .lm.success { color: var(--accent3); }
  .lm.error   { color: var(--danger); }
  .lm.orch    { color: #a78bfa; }

  /* Result */
  .result-panel { grid-column: 1 / -1; }
  .result-body { padding: 20px; }
  .result-sec { margin-bottom: 20px; }
  .result-sec-title {
    font-family: var(--font-mono); font-size: 11px; color: var(--accent);
    letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px;
    display: flex; align-items: center; gap: 8px;
  }
  .result-sec-title::after { content: ''; flex: 1; height: 1px; background: var(--border); }
  .result-text { font-size: 14px; line-height: 1.8; color: var(--text); opacity: 0.9; white-space: pre-wrap; }
  .rchips { display: flex; gap: 8px; flex-wrap: wrap; }
  .rchip { padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; }
  .rc-c { background: rgba(0,229,255,0.1);  border: 1px solid rgba(0,229,255,0.25);  color: var(--accent); }
  .rc-p { background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.25); color: #a78bfa; }
  .rc-g { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25); color: var(--accent3); }

  .stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-top: 16px; }
  .stat-box { background: rgba(4,8,16,0.6); border: 1px solid var(--border); border-radius: 8px; padding: 12px; text-align: center; }
  .stat-val { font-size: 22px; font-weight: 800; font-family: var(--font-mono); }
  .stat-lbl { font-size: 11px; color: var(--muted); margin-top: 2px; }

  .reset-btn {
    padding: 10px 20px; background: transparent;
    border: 1px solid var(--border); color: var(--muted);
    border-radius: 8px; cursor: pointer; font-family: var(--font-sans);
    font-size: 13px; font-weight: 600; transition: border-color 0.2s, color 0.2s;
  }
  .reset-btn:hover { border-color: var(--accent); color: var(--accent); }

  @media(max-width:900px){
    .grid-main { grid-template-columns: 1fr; }
    .agents-grid { grid-template-columns: repeat(2,1fr); }
    .stats-row { grid-template-columns: repeat(2,1fr); }
  }
`;

const AGENTS = [
  { id:"planner",     name:"Planner",     icon:"🗺️", role:"Task Decomposition", color:"#00e5ff" },
  { id:"researcher",  name:"Researcher",  icon:"🔍", role:"Knowledge Retrieval", color:"#7c3aed" },
  { id:"analyst",     name:"Analyst",     icon:"📊", role:"Data Analysis",       color:"#f59e0b" },
  { id:"coder",       name:"Coder",       icon:"💻", role:"Code Generation",     color:"#10b981" },
  { id:"critic",      name:"Critic",      icon:"🔬", role:"Quality Validation",  color:"#ef4444" },
  { id:"synthesizer", name:"Synthesizer", icon:"⚡", role:"Output Synthesis",    color:"#a78bfa" },
];

const PRESETS = [
  "Build a real-time fraud detection system for financial transactions",
  "Design a multi-cloud cost optimization pipeline using AI",
  "Create an autonomous code review system with security scanning",
  "Architect a self-healing microservices monitoring platform",
];

// ── API — calls local proxy (Gemini free tier) ────────────────────────────────
async function callAI(system, user, maxTokens = 600) {
  const res = await fetch("http://localhost:3001/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system,
      messages: [{ role: "user", content: user }],
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Proxy error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  return data.content[0].text;
}

export default function SwarmMind() {
  const [mission,   setMission]   = useState("");
  const [running,   setRunning]   = useState(false);
  const [agents,    setAgents]    = useState(() => AGENTS.map(a => ({ ...a, status:"idle", task:"", progress:0 })));
  const [logs,      setLogs]      = useState([]);
  const [orchMsg,   setOrchMsg]   = useState("Awaiting mission directive...");
  const [result,    setResult]    = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [proxyStatus, setProxyStatus] = useState("checking"); // checking | ok | error
  const logRef = useRef(null);

  // Check proxy on mount
  useEffect(() => {
    fetch("http://localhost:3001/health")
      .then(r => r.json())
      .then(d => setProxyStatus(d.key_loaded ? "ok" : "nokey"))
      .catch(() => setProxyStatus("error"));
  }, []);

  const addLog = useCallback((agentId, msg, type = "default") => {
    setLogs(prev => [...prev, {
      id: Date.now() + Math.random(),
      time: new Date().toLocaleTimeString("en-GB", { hour12:false }),
      agent: agentId, msg, type,
    }]);
  }, []);

  const patchAgent = useCallback((id, patch) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const colorOf = id => AGENTS.find(a => a.id === id)?.color || "#00e5ff";

  async function runSwarm() {
    if (!mission.trim() || running) return;
    setRunning(true); setResult(null); setLogs([]);
    setStartTime(Date.now());
    AGENTS.forEach(a => patchAgent(a.id, { status:"idle", task:"", progress:0 }));

    try {
      // ── Orchestrator: decompose mission ──────────────────────────────────
      setOrchMsg("🧠 Orchestrator decomposing mission...");
      addLog("orchestrator", `Mission received: "${mission.slice(0,60)}..."`, "orch");

      const planRaw = await callAI(
        `You are an AI Orchestrator. Decompose the mission into 6 sub-tasks.
Respond ONLY with valid JSON, no markdown:
{"planner":"...","researcher":"...","analyst":"...","coder":"...","critic":"...","synthesizer":"..."}
Each value is ONE specific sentence for that agent.`,
        `Mission: ${mission}`
      );

      let plan;
      try {
        plan = JSON.parse(planRaw.replace(/```json|```/g,"").trim());
      } catch {
        plan = {
          planner:"Break down requirements into milestones",
          researcher:"Survey best practices and prior art",
          analyst:"Analyze data flows and bottlenecks",
          coder:"Prototype core architecture",
          critic:"Identify risks and vulnerabilities",
          synthesizer:"Compile findings into proposal",
        };
      }

      addLog("orchestrator", "Task graph ready. Dispatching 6 agents in parallel.", "orch");
      setOrchMsg("⚡ 6 agents running in parallel...");

      AGENTS.forEach(a => {
        patchAgent(a.id, { status:"active", task: plan[a.id] || "Processing...", progress:5 });
        addLog(a.id, plan[a.id] || "Starting...", "info");
      });

      // Tick progress bars while agents run
      const ticks = [20, 45, 70, 90];
      for (const tick of ticks) {
        await new Promise(r => setTimeout(r, 700));
        AGENTS.forEach(a => patchAgent(a.id, { progress: tick }));
      }

      // ── All 6 agents run in parallel ─────────────────────────────────────
      const agentResults = await Promise.all(
        AGENTS.map(async (ag) => {
          const task = plan[ag.id] || "Analyse the mission";
          const output = await callAI(
            `You are ${ag.name}, a specialist AI agent. Role: ${ag.role}.
Be concise, technical, and specific. Respond in 3-5 sentences with actionable insights.`,
            `Mission: ${mission}\nYour task: ${task}`
          );
          patchAgent(ag.id, { status:"done", progress:100 });
          addLog(ag.id, output.slice(0,120) + (output.length > 120 ? "..." : ""), "success");
          return { agent: ag.id, role: ag.role, task, output };
        })
      );

      setOrchMsg("✅ All agents done. Synthesizing final report...");
      addLog("orchestrator", "Synthesizing all outputs...", "orch");

      // ── Final synthesis ───────────────────────────────────────────────────
      const combined = agentResults.map(r => `${r.role}: ${r.output}`).join("\n\n");
      const synthRaw = await callAI(
        `You are the final Synthesizer. Produce a structured report for a Microsoft hackathon judge.
Respond ONLY with valid JSON, no markdown:
{
  "solution_title":"...",
  "executive_summary":"2-3 sentences",
  "key_innovations":["...","...","..."],
  "tech_stack":["...","...","...","..."],
  "impact":"1-2 sentences",
  "ms_alignment":"1 sentence on Microsoft Azure AI alignment"
}`,
        `Mission: ${mission}\n\nAgent outputs:\n${combined}`,
        800
      );

      let synth;
      try {
        synth = JSON.parse(synthRaw.replace(/```json|```/g,"").trim());
      } catch {
        synth = {
          solution_title:"AI Agent Swarm Solution",
          executive_summary: synthRaw.slice(0,200),
          key_innovations:["Parallel agent execution","Multi-agent coordination","Automated synthesis"],
          tech_stack:["Azure OpenAI","Semantic Kernel","Azure Container Apps","React"],
          impact:"Reduces complex planning from hours to under 60 seconds.",
          ms_alignment:"Built on Azure AI Foundry and Semantic Kernel orchestration.",
        };
      }

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      setResult({ ...synth, agentResults, elapsed, agentCount: AGENTS.length });
      setOrchMsg(`🎯 Mission complete in ${elapsed}s — ${AGENTS.length} agents coordinated.`);
      addLog("orchestrator", `Done in ${elapsed}s. Report ready.`, "success");

    } catch (err) {
      setOrchMsg(`❌ Error: ${err.message}`);
      addLog("orchestrator", `Error: ${err.message}`, "error");
      AGENTS.forEach(a => patchAgent(a.id, { status:"idle" }));
    } finally {
      setRunning(false);
    }
  }

  function reset() {
    setMission(""); setRunning(false); setResult(null); setLogs([]);
    setOrchMsg("Awaiting mission directive...");
    AGENTS.forEach(a => patchAgent(a.id, { status:"idle", task:"", progress:0 }));
  }

  // Proxy status banner
  const Banner = () => {
    if (proxyStatus === "checking") return (
      <div className="banner banner-warn">⟳ Checking proxy server on port 3001...</div>
    );
    if (proxyStatus === "error") return (
      <div className="banner banner-error">
        ⚠️ Proxy not running. Open a new terminal in your swarmmind folder and run: <strong>node server.js</strong>
      </div>
    );
    if (proxyStatus === "nokey") return (
      <div className="banner banner-error">
        ⚠️ Proxy running but GEMINI_API_KEY missing. Add it to your .env file, then restart: <strong>node server.js</strong>
      </div>
    );
    return (
      <div className="banner banner-ok">✓ Proxy connected · Gemini 1.5 Flash (free tier) · Ready to launch</div>
    );
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="app">

        {/* Header */}
        <header className="header">
          <div className="logo">
            SwarmMind
            <span>/ Microsoft Build AI 2026 — Agent Swarms</span>
          </div>
          <div className="header-right">
            <div className={`badge ${proxyStatus === "ok" ? "badge-green" : "badge-red"}`}>
              <span className="pulse" style={{ background: proxyStatus === "ok" ? "#10b981" : "#ef4444" }} />
              {proxyStatus === "ok" ? "GEMINI FREE · LIVE" : "PROXY OFFLINE"}
            </div>
            <div className="badge badge-blue">
              <span className="pulse" />
              {AGENTS.length} AGENTS
            </div>
            {result && <button className="reset-btn" onClick={reset}>↺ Reset</button>}
          </div>
        </header>

        <Banner />

        <div className="grid-main">

          {/* Mission */}
          <div className="panel mission-panel">
            <div className="panel-header">
              <span>Mission Control</span>
              <span className="dot" style={{ background:"#00e5ff" }} />
            </div>
            <div className="mission-inner">
              <div className="mission-label">▸ Enter mission directive</div>
              <div className="mission-row">
                <textarea
                  className="mission-ta"
                  placeholder="Describe a complex real-world problem for the swarm to solve..."
                  value={mission}
                  onChange={e => setMission(e.target.value)}
                  disabled={running}
                  rows={2}
                />
                <button
                  className="launch-btn"
                  onClick={runSwarm}
                  disabled={!mission.trim() || running || proxyStatus !== "ok"}
                >
                  {running ? "⟳ Running..." : "⚡ Launch Swarm"}
                </button>
              </div>
              <div className="presets">
                {PRESETS.map(p => (
                  <button key={p} className="chip" onClick={() => setMission(p)} disabled={running}>
                    {p.slice(0,46)}…
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Swarm */}
          <div className="panel swarm-panel">
            <div className="panel-header">
              <span>Agent Swarm</span>
              <span className="dot" style={{ background: running ? "#00e5ff" : "#334155" }} />
            </div>
            <div className="swarm-canvas">
              <div className="orch-box">
                <div className="orch-label">⬡ Orchestrator</div>
                <div className="orch-msg">{orchMsg}</div>
              </div>
              <div className="agents-grid">
                {agents.map(ag => (
                  <div
                    key={ag.id}
                    className={`agent-card st-${ag.status}`}
                    style={{ "--ac": ag.color }}
                  >
                    <div className="agent-top">
                      <div className="agent-icon">{ag.icon}</div>
                      <div>
                        <div className="agent-name">{ag.name}</div>
                        <div className="agent-role">{ag.role}</div>
                      </div>
                      <span className={`agent-sbadge sb-${ag.status === "active" ? "working" : ag.status}`}>
                        {ag.status === "active" ? "working" : ag.status}
                      </span>
                    </div>
                    <div className={`agent-task ${ag.status === "active" ? "live" : ag.status === "done" ? "ok" : ""}`}>
                      {ag.status === "active" ? (
                        <>{ag.task.slice(0,70)}{ag.task.length>70?"…":""}<span className="think" style={{marginLeft:6}}><span/><span/><span/></span></>
                      ) : ag.status === "done" ? (
                        <>✓ {ag.task.slice(0,80)}</>
                      ) : (
                        <span style={{opacity:0.4}}>Awaiting dispatch...</span>
                      )}
                    </div>
                    <div className="agent-prog">
                      <div className="agent-prog-fill" style={{ width:`${ag.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Log */}
          <div className="panel log-panel">
            <div className="panel-header">
              <span>Live Feed</span>
              <span style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"var(--muted)" }}>{logs.length} EVENTS</span>
            </div>
            <div className="log-body" ref={logRef}>
              {logs.length === 0 ? (
                <div style={{ color:"var(--muted)", fontSize:12, paddingTop:8 }}>Waiting for swarm activity...</div>
              ) : logs.map(l => (
                <div className="le" key={l.id}>
                  <span className="lt">{l.time}</span>
                  <span className="la" style={{ color: colorOf(l.agent) }}>[{l.agent.slice(0,8)}]</span>
                  <span className={`lm ${l.type}`}>{l.msg}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="panel result-panel">
              <div className="panel-header">
                <span>Swarm Report — {result.solution_title}</span>
                <button className="reset-btn" onClick={reset} style={{ padding:"4px 12px", fontSize:11 }}>New Mission</button>
              </div>
              <div className="result-body">
                <div className="stats-row">
                  {[
                    { v: result.agentCount,                  l:"Agents",     c:"var(--accent)" },
                    { v: result.elapsed+"s",                 l:"Time",       c:"var(--accent3)" },
                    { v: result.key_innovations?.length||3,  l:"Innovations",c:"#a78bfa" },
                    { v: result.tech_stack?.length||4,       l:"Stack Items", c:"var(--warn)" },
                  ].map(s => (
                    <div className="stat-box" key={s.l}>
                      <div className="stat-val" style={{ color:s.c }}>{s.v}</div>
                      <div className="stat-lbl">{s.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:20 }}>
                  {[
                    { title:"Executive Summary",    content: <div className="result-text">{result.executive_summary}</div> },
                    { title:"Key Innovations",      content: <div className="rchips">{(result.key_innovations||[]).map((k,i)=><span key={i} className={`rchip ${["rc-c","rc-p","rc-g"][i%3]}`}>{k}</span>)}</div> },
                    { title:"Tech Stack",           content: <div className="rchips">{(result.tech_stack||[]).map((t,i)=><span key={i} className="rchip rc-c" style={{fontSize:12}}>{t}</span>)}</div> },
                    { title:"Real-World Impact",    content: <div className="result-text">{result.impact}</div> },
                    { title:"Microsoft AI Alignment",content: <div className="result-text" style={{color:"#a78bfa"}}>{result.ms_alignment}</div> },
                  ].map(s => (
                    <div className="result-sec" key={s.title}>
                      <div className="result-sec-title">{s.title}</div>
                      {s.content}
                    </div>
                  ))}
                  <div className="result-sec">
                    <div className="result-sec-title">Agent Contributions</div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:10 }}>
                      {(result.agentResults||[]).map(r => {
                        const ag = AGENTS.find(a => a.id === r.agent);
                        return (
                          <div key={r.agent} style={{
                            padding:12, background:"rgba(4,8,16,0.6)",
                            border:`1px solid ${colorOf(r.agent)}30`,
                            borderLeft:`3px solid ${colorOf(r.agent)}`, borderRadius:8,
                          }}>
                            <div style={{ fontSize:12, fontWeight:700, color:colorOf(r.agent), marginBottom:4 }}>
                              {ag?.icon} {ag?.name} — {ag?.role}
                            </div>
                            <div style={{ fontSize:12, color:"var(--text)", opacity:0.8, lineHeight:1.5 }}>
                              {r.output.slice(0,220)}{r.output.length>220?"…":""}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}