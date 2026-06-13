import { useState, useEffect, useRef, useCallback } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Outfit:wght@300;400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #040810; --s0: #080f1e; --border: #0d2040; --border2: #1a3060;
    --cyan: #00e5ff; --violet: #7c3aed; --emerald: #10b981;
    --amber: #f59e0b; --rose: #ef4444; --sky: #38bdf8;
    --text: #e2e8f0; --muted: #64748b;
    --mono: 'JetBrains Mono', monospace;
    --sans: 'Outfit', sans-serif;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--sans); min-height: 100vh; overflow-x: hidden; }
  body::before {
    content: ''; position: fixed; inset: 0; z-index: 0;
    background-image: linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px);
    background-size: 40px 40px; pointer-events: none;
  }
  body::after {
    content: ''; position: fixed; inset: 0; z-index: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.07) 0%, transparent 70%);
    pointer-events: none;
  }
  .app { position: relative; z-index: 1; max-width: 1400px; margin: 0 auto; padding: 24px; }

  /* Header */
  .hdr {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 22px; background: rgba(8,15,30,0.85);
    border: 1px solid var(--border); border-radius: 12px;
    margin-bottom: 20px; backdrop-filter: blur(16px);
  }
  .logo-wrap { display: flex; align-items: center; gap: 12px; }
  .logo-icon {
    width: 36px; height: 36px; border-radius: 9px;
    background: linear-gradient(135deg, var(--violet), var(--cyan));
    display: flex; align-items: center; justify-content: center; font-size: 18px;
    box-shadow: 0 0 24px rgba(0,229,255,0.25);
    animation: logo-glow 4s ease-in-out infinite;
  }
  @keyframes logo-glow {
    0%, 100% { box-shadow: 0 0 18px rgba(0,229,255,0.2); }
    50% { box-shadow: 0 0 28px rgba(124,58,237,0.35); }
  }
  .logo-text { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: var(--text); }
  .logo-sub  { font-family: var(--mono); font-size: 10px; color: var(--muted); margin-top: 1px; letter-spacing: 1px; }
  .hdr-right { display: flex; align-items: center; gap: 10px; }

  .pill {
    display: flex; align-items: center; gap: 6px; padding: 5px 11px; border-radius: 20px;
    font-family: var(--mono); font-size: 10px; font-weight: 600; letter-spacing: 0.5px;
    transition: all .25s ease;
  }
  .pill-cyan   { background: rgba(0,229,255,0.08);  border: 1px solid rgba(0,229,255,0.2);   color: var(--cyan); }
  .pill-green  { background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2);  color: var(--emerald); }
  .pill-violet { background: rgba(124,58,237,0.09); border: 1px solid rgba(124,58,237,0.25); color: #a78bfa; }
  .pill-red    { background: rgba(239,68,68,0.09);  border: 1px solid rgba(239,68,68,0.25);  color: var(--rose); }
  .dot { width: 7px; height: 7px; border-radius: 50%; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
  .dot-live   { background: var(--emerald); animation: blink 2s infinite; }
  .dot-violet { background: #a78bfa; animation: blink 1.5s infinite; }
  .dot-red    { background: var(--rose); }
  .dot-cyan   { background: var(--cyan); }

  /* Swarm progress meter */
  .swarm-meter { display: flex; align-items: center; gap: 8px; padding: 4px 10px 4px 6px; border-radius: 20px; border: 1px solid var(--border); background: rgba(13,29,56,0.35); }
  .swarm-meter svg { display: block; }
  .swarm-meter-ring-bg { stroke: var(--border2); fill: none; }
  .swarm-meter-ring-fg { fill: none; stroke-linecap: round; transition: stroke-dashoffset .6s ease, stroke .3s ease; }
  .swarm-meter-label { font-family: var(--mono); font-size: 11px; font-weight: 700; color: var(--text); letter-spacing: 0.5px; min-width: 32px; }

  /* Banner */
  .banner {
    padding: 10px 16px; border-radius: 10px; margin-bottom: 16px;
    font-family: var(--mono); font-size: 11px; line-height: 1.6;
    display: flex; align-items: flex-start; gap: 10px;
  }
  .banner-ok     { background: rgba(16,185,129,0.07); border: 1px solid rgba(16,185,129,0.2); color: var(--emerald); }
  .banner-err    { background: rgba(239,68,68,0.07);  border: 1px solid rgba(239,68,68,0.2);  color: var(--rose); }
  .banner-warn   { background: rgba(245,158,11,0.07); border: 1px solid rgba(245,158,11,0.2); color: var(--amber); }
  .banner-violet { background: rgba(124,58,237,0.07); border: 1px solid rgba(124,58,237,0.2); color: #c4b5fd; }

/* Layout */
.grid-main {
  display: grid;
  grid-template-columns: 2.1fr 1fr;
  gap: 20px;
  align-items: start;
}
.mission-panel, .result-panel { grid-column: 1 / -1; }
.swarm-panel { grid-column: 1; }
.log-panel   { grid-column: 2; }

/* Panel shell */
.panel {
  background: rgba(8,15,30,0.7);
  border: 1px solid var(--border);
  border-radius: 14px;
  backdrop-filter: blur(16px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color .3s ease;
}
.panel-hdr {
  display: flex; align-items: center; justify-content: space-between;
  padding: 13px 20px; border-bottom: 1px solid var(--border);
  font-family: var(--mono); font-size: 11px; font-weight: 700;
  letter-spacing: 2px; text-transform: uppercase; color: var(--muted);
}
.mission-panel .panel-hdr { border-bottom-color: rgba(124,58,237,0.22); }
.swarm-panel   .panel-hdr { border-bottom-color: rgba(0,229,255,0.2); }
.log-panel     .panel-hdr { border-bottom-color: rgba(245,158,11,0.18); }
.result-panel  .panel-hdr { border-bottom-color: rgba(16,185,129,0.2); }

/* Mission panel */
.mission-inner { padding: 20px 22px; }
.mission-label {
  font-family: var(--mono); font-size: 10px; letter-spacing: 2.5px;
  text-transform: uppercase; color: var(--cyan); margin-bottom: 12px;
}
.mission-row { display: flex; gap: 12px; align-items: stretch; }
.mission-ta {
  flex: 1; resize: vertical; min-height: 58px; max-height: 180px;
  background: rgba(4,8,16,0.6); border: 1px solid var(--border);
  border-radius: 10px; color: var(--text); font-family: var(--sans);
  font-size: 14px; padding: 13px 16px; line-height: 1.55;
  transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
}
.mission-ta::placeholder { color: var(--muted); }
.mission-ta:focus {
  outline: none; border-color: var(--cyan); background: rgba(4,8,16,0.85);
  box-shadow: 0 0 0 3px rgba(0,229,255,0.1);
}
.mission-ta:disabled { opacity: 0.5; cursor: not-allowed; }

.launch-btn {
  flex-shrink: 0; min-width: 168px; padding: 0 24px; border-radius: 10px;
  border: 1px solid rgba(124,58,237,0.4); cursor: pointer;
  background: linear-gradient(135deg, rgba(124,58,237,0.28), rgba(0,229,255,0.14));
  color: var(--text); font-family: var(--mono); font-weight: 700;
  font-size: 13px; letter-spacing: 0.6px; position: relative; overflow: hidden;
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease, opacity .18s ease;
}
.launch-btn::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%);
  background-size: 250% 250%; background-position: 200% 0;
  transition: background-position .6s ease;
}
.launch-btn:hover:not(:disabled)::after { background-position: -50% 0; }
.launch-btn:hover:not(:disabled) {
  transform: translateY(-2px); border-color: var(--cyan);
  box-shadow: 0 10px 28px rgba(0,229,255,0.16), 0 6px 20px rgba(124,58,237,0.25);
}
.launch-btn:active:not(:disabled) { transform: translateY(0); }
.launch-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.presets { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.chip {
  font-family: var(--mono); font-size: 11px; padding: 7px 13px;
  border-radius: 20px; border: 1px solid var(--border);
  background: rgba(13,29,56,0.4); color: var(--muted); cursor: pointer;
  transition: all .15s ease;
}
.chip:hover:not(:disabled) {
  border-color: var(--cyan); color: var(--cyan);
  background: rgba(0,229,255,0.06); transform: translateY(-1px);
}
.chip:active:not(:disabled) { transform: translateY(0) scale(0.98); }
.chip:disabled { opacity: 0.4; cursor: not-allowed; }

.reset-btn {
  font-family: var(--mono); font-size: 11px; font-weight: 700;
  padding: 7px 15px; border-radius: 8px; border: 1px solid var(--border2);
  background: rgba(13,29,56,0.5); color: var(--text); cursor: pointer;
  letter-spacing: 0.5px; transition: all .15s ease;
}
.reset-btn:hover {
  border-color: var(--rose); color: var(--rose); background: rgba(239,68,68,0.08);
  transform: translateY(-1px);
}

/* Swarm panel */
.swarm-body { padding: 20px 22px; }
.orch-box {
  position: relative; overflow: hidden; margin-bottom: 18px;
  padding: 14px 18px; border-radius: 12px;
  background: linear-gradient(135deg, rgba(124,58,237,0.09), rgba(0,229,255,0.04));
  border: 1px solid rgba(124,58,237,0.22);
  transition: border-color .3s ease;
}
.orch-box.running { border-color: rgba(0,229,255,0.35); }
.orch-box.running::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(100deg, transparent 40%, rgba(0,229,255,0.14) 50%, transparent 60%);
  background-size: 220% 220%;
  animation: sweep 2.6s linear infinite;
}
@keyframes sweep {
  0% { background-position: 200% 0; }
  100% { background-position: -100% 0; }
}
.orch-lbl {
  position: relative; z-index: 1;
  font-family: var(--mono); font-size: 10px; letter-spacing: 2.5px;
  text-transform: uppercase; color: #a78bfa; margin-bottom: 6px;
}
.orch-msg {
  position: relative; z-index: 1; font-size: 14px; font-weight: 600; color: var(--text);
  transition: color .2s ease;
}
.orch-meta {
  position: relative; z-index: 1; font-family: var(--mono); font-size: 10px;
  color: var(--muted); margin-top: 6px; letter-spacing: 0.5px;
}

/* Agent grid */
.agents-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(280px, 1fr));
  gap: 18px;
  width: 100%;
}

.agent-card {
  background: rgba(4,8,16,0.75);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px;
  min-height: 180px;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.agent-card:hover {
  transform: translateY(-3px);
  border-color: var(--border2);
  box-shadow: 0 8px 28px rgba(0,0,0,0.35);
}

.agent-card.expandable { cursor: pointer; }
.agent-card.expandable:hover { border-color: var(--ac, var(--border2)); }

.agent-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, var(--ac, var(--cyan)), transparent);
  background-size: 200% 100%; opacity: 0; transition: opacity .3s ease;
}

.agent-card.st-active {
  border-color: var(--ac, var(--cyan));
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.45);
}

.agent-card.st-active::before {
  opacity: 1;
  animation: scan-bg 2s linear infinite;
}
@keyframes scan-bg {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.agent-card.st-done { border-color: rgba(16,185,129,0.3); }

/* Agent header */
.agent-top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.agent-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  transition: transform .25s ease, box-shadow .25s ease;
}

.agent-card.st-active .agent-icon {
  box-shadow: 0 0 0 4px rgba(255,255,255,0.04), 0 0 18px var(--ac, var(--cyan));
  animation: icon-pulse 1.8s ease-in-out infinite;
}
@keyframes icon-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}
.agent-card:hover .agent-icon { transform: rotate(-6deg) scale(1.06); }

.agent-name {
  font-weight: 700;
  font-size: 14px;
}

.agent-role {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--muted);
  margin-top: 2px;
}

.agent-model {
  font-family: var(--mono);
  font-size: 10px;
  color: #a78bfa;
  margin-top: 4px;
}

/* Agent status badge */
.agent-sbadge {
  margin-left: auto;
  padding: 4px 8px;
  border-radius: 12px;
  font-family: var(--mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  flex-shrink: 0;
  transition: all .2s ease;
}
.sb-idle {
  background: rgba(100,116,139,0.08); border: 1px solid rgba(100,116,139,0.22); color: var(--muted);
}
.sb-working {
  background: rgba(124,58,237,0.14); border: 1px solid rgba(124,58,237,0.4); color: #a78bfa;
  animation: blink 1.4s infinite;
}
.sb-done {
  background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.32); color: var(--emerald);
}

/* Agent task text */
.agent-task {
  font-size: 12px;
  color: var(--muted);
  font-family: var(--mono);
  min-height: 70px;
  line-height: 1.7;
  overflow: hidden;
  word-break: break-word;
}

.agent-task.live {
  color: var(--text);
}

.agent-task.ok {
  color: var(--emerald);
}

.expand-chevron {
  color: var(--cyan); font-size: 10px; font-weight: 700; margin-left: 4px; white-space: nowrap;
}

.think { display: inline-flex; gap: 3px; vertical-align: middle; }
.think span {
  width: 4px; height: 4px; border-radius: 50%; background: var(--cyan);
  animation: think-bounce 1.2s infinite ease-in-out;
}
.think span:nth-child(2) { animation-delay: .15s; }
.think span:nth-child(3) { animation-delay: .3s; }
@keyframes think-bounce {
  0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
  40% { opacity: 1; transform: translateY(-3px); }
}

/* Progress bar */
.agent-prog {
  height: 4px;
  background: var(--border2);
  border-radius: 4px;
  margin-top: 14px;
  overflow: hidden;
}

.agent-prog-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
  background: linear-gradient(
    90deg,
    var(--violet),
    var(--cyan)
  );
  position: relative;
  overflow: hidden;
}
.agent-card.st-active .agent-prog-fill::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
  animation: shimmer 1.4s linear infinite;
}
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Log panel */
.log-panel { max-height: 600px; }
.log-body {
  flex: 1; overflow-y: auto; padding: 14px 18px;
  display: flex; flex-direction: column; gap: 7px;
  font-family: var(--mono); font-size: 11px; min-height: 200px;
}
.log-body::-webkit-scrollbar { width: 6px; }
.log-body::-webkit-scrollbar-track { background: transparent; }
.log-body::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

.le {
  display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px;
  padding: 7px 10px; border-radius: 6px; background: rgba(255,255,255,0.025);
  border-left: 2px solid var(--border2);
  animation: log-in .25s ease;
}
@keyframes log-in {
  from { opacity: 0; transform: translateX(-6px); }
  to { opacity: 1; transform: translateX(0); }
}
.lt { color: var(--muted); font-size: 10px; flex-shrink: 0; }
.la { font-weight: 700; font-size: 10px; flex-shrink: 0; }
.lm { color: var(--text); flex: 1 1 100%; line-height: 1.5; }
.lm.success { color: var(--emerald); }
.lm.error   { color: var(--rose); }
.lm.orch    { color: #a78bfa; }
.le:has(.lm.success) { border-left-color: var(--emerald); }
.le:has(.lm.error)   { border-left-color: var(--rose); }
.le:has(.lm.orch)    { border-left-color: #a78bfa; }

.run-bar {
  display: flex; gap: 18px; flex-wrap: wrap; padding: 11px 18px;
  border-top: 1px solid var(--border); font-family: var(--mono);
  font-size: 10px; color: var(--muted); letter-spacing: 0.6px;
}
.run-bar span { color: var(--cyan); font-weight: 700; }

/* Result panel */
.result-panel { animation: rise-in .45s ease; }
@keyframes rise-in {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}
.result-body { padding: 20px 22px; display: flex; flex-direction: column; gap: 18px; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.stat-box {
  padding: 16px; border-radius: 12px; background: rgba(4,8,16,0.6);
  border: 1px solid var(--border); text-align: center;
  transition: transform .2s ease, border-color .2s ease;
}
.stat-box:hover { transform: translateY(-3px); border-color: var(--border2); }
.stat-val { font-family: var(--mono); font-size: 26px; font-weight: 800; }
.stat-lbl {
  font-family: var(--mono); font-size: 10px; color: var(--muted);
  margin-top: 4px; letter-spacing: 1.5px; text-transform: uppercase;
}

/* Result grid */
.res-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.res-sec-full { grid-column: 1 / -1; }
.res-sec {
  background: rgba(4,8,16,0.5); border: 1px solid var(--border);
  border-radius: 12px; padding: 16px; transition: border-color .2s ease;
}
.res-sec:hover { border-color: var(--border2); }
.sec-title {
  font-family: var(--mono); font-size: 10px; letter-spacing: 2.5px;
  text-transform: uppercase; color: var(--cyan); margin-bottom: 10px;
}
.res-text { font-size: 13px; line-height: 1.75; color: var(--text); }

.rchips { display: flex; flex-wrap: wrap; gap: 8px; }
.rchip {
  font-family: var(--mono); font-size: 11px; padding: 6px 12px;
  border-radius: 8px; border: 1px solid; transition: transform .15s ease, box-shadow .15s ease;
}
.rchip:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 6px 16px rgba(0,0,0,0.35); }
.rc-c { color: var(--cyan); border-color: rgba(0,229,255,0.3); background: rgba(0,229,255,0.06); }
.rc-p { color: #a78bfa; border-color: rgba(124,58,237,0.3); background: rgba(124,58,237,0.06); }
.rc-g { color: var(--emerald); border-color: rgba(16,185,129,0.3); background: rgba(16,185,129,0.06); }

/* Agent Results */
.ar-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 8px;
}

.ar-card {
  background: rgba(4,8,16,0.75);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  border-top-width: 3px;
  transition: transform .2s ease, box-shadow .2s ease;
}
.ar-card:hover { transform: translateY(-3px); box-shadow: 0 10px 26px rgba(0,0,0,0.35); }
.ar-name { font-weight: 700; font-size: 13px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
.ar-body { font-size: 12px; color: var(--muted); line-height: 1.6; }

/* Accessibility */
button:focus-visible, textarea:focus-visible, .agent-card:focus-visible {
  outline: 2px solid var(--cyan); outline-offset: 2px;
}

/* Responsive */
@media (max-width: 1200px) {
  .agents-grid,
  .ar-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .grid-main {
    grid-template-columns: 1fr;
  }

  .mission-panel, .swarm-panel, .log-panel, .result-panel {
    grid-column: 1;
  }

  .log-panel {
    max-height: 420px;
  }

  .agents-grid,
  .ar-grid {
    grid-template-columns: 1fr;
  }

  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .res-grid {
    grid-template-columns: 1fr;
  }

  .mission-row {
    flex-direction: column;
  }

  .launch-btn {
    width: 100%;
  }

  .swarm-meter-label { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
`;

/* ── Constants — UNCHANGED from original ── */
const AGENTS = [
  { id:"planner",     name:"Planner",     icon:"🗺️", role:"Task Decomposition", color:"#00e5ff", model:"gpt-4o" },
  { id:"researcher",  name:"Researcher",  icon:"🔍", role:"Knowledge Retrieval", color:"#7c3aed", model:"gpt-4o" },
  { id:"analyst",     name:"Analyst",     icon:"📊", role:"Data Analysis",       color:"#f59e0b", model:"o3-mini" },
  { id:"coder",       name:"Coder",       icon:"💻", role:"Code Generation",     color:"#10b981", model:"gpt-4o" },
  { id:"critic",      name:"Critic",      icon:"🔬", role:"Quality Validation",  color:"#ef4444", model:"claude-sonnet-4-5" },
  { id:"synthesizer", name:"Synthesizer", icon:"⚡", role:"Output Synthesis",    color:"#a78bfa", model:"gpt-4o" },
];

const AVAILABLE_MODELS = ["gpt-4o", "o3-mini", "claude-sonnet-4-5", "gpt-4o-mini"];

const PRESETS = [
  "Build a real-time fraud detection system for financial transactions",
  "Design a multi-cloud cost optimization pipeline using AI",
  "Create an autonomous code review system with security scanning",
  "Architect a self-healing microservices monitoring platform",
];

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

/* Progress ring geometry */
const RING_R = 15;
const RING_C = 2 * Math.PI * RING_R;

/* ── callAI — EXACTLY as original, routes to /api/swarm proxy ── */
async function callAI(mission, model = "gpt-4o") {
  const endpoint = `${API_BASE}/api/swarm`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mission, stream: false }),
  });

  if (!res.ok) {
    const text = await res.text();
    let errMsg = `Proxy error ${res.status}`;
    try { errMsg = JSON.parse(text)?.error?.message || errMsg; } catch {}
    throw new Error(errMsg);
  }

  const data = await res.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  return data;
}

export default function SwarmMind() {
  const [mission,     setMission]     = useState("");
  const [running,     setRunning]     = useState(false);
  const [agents,      setAgents]      = useState(() => AGENTS.map(a => ({ ...a, status:"idle", task:"", progress:0 })));
  const [logs,        setLogs]        = useState([]);
  const [orchMsg,     setOrchMsg]     = useState("Awaiting mission directive...");
  const [result,      setResult]      = useState(null);
  const [startTime,   setStartTime]   = useState(null);
  const [orchModel,   setOrchModel]   = useState("gpt-4o");
  const [proxyStatus, setProxyStatus] = useState("checking");
  const [proxyInfo,   setProxyInfo]   = useState(null);
  const [elapsed,     setElapsed]     = useState(0);
  const [expanded,    setExpanded]    = useState({});
  const logRef   = useRef(null);
  const timerRef = useRef(null);

  /* Health check on mount — UNCHANGED */
  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then(r => r.json())
      .then(d => {
        setProxyInfo(d);
        setProxyStatus(d.status === "ok" ? "ok" : "error");
      })
      .catch(() => setProxyStatus("error"));
  }, []);

  const addLog = useCallback((agentId, msg, type = "default") => {
    setLogs(prev => [...prev, {
      id: Date.now() + Math.random(),
      time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
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

  /* Toggle full task text on an agent card — display only, no logic change */
  const toggleExpand = useCallback((id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  /* Derived overall swarm progress for the header meter */
  const avgProgress = Math.round(agents.reduce((sum, a) => sum + a.progress, 0) / agents.length);
  const meterColor = running ? "var(--cyan)" : result ? "var(--emerald)" : "var(--border2)";

  /* ── runSwarm — logic UNCHANGED, only UI feedback enhanced ── */
  async function runSwarm() {
    if (!mission.trim() || running) return;
    setRunning(true); setResult(null); setLogs([]);
    setStartTime(Date.now()); setElapsed(0);
    setExpanded({});
    AGENTS.forEach(a => patchAgent(a.id, { status:"idle", task:"", progress:0 }));

    timerRef.current = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);

    try {
      setOrchMsg("🧠 Orchestrator coordinating task assignment via FastAPI Swarm...");
      addLog("orchestrator", `Mission: "${mission.slice(0, 60)}..."`, "orch");

      AGENTS.forEach(a => patchAgent(a.id, { status:"active", task:"Analyzing mission context...", progress:20 }));

      const responseData = await callAI(mission, orchModel);

      addLog("orchestrator", "FastAPI pipeline returned valid swarm result.", "orch");
      setOrchMsg("⚡ Distributing results across agent dashboard...");

      AGENTS.forEach(a => patchAgent(a.id, { task:"Compiling structural design matrices...", progress:80 }));
      await new Promise(r => setTimeout(r, 600));
      AGENTS.forEach(a => patchAgent(a.id, { status:"done", task:"Insights computed.", progress:100 }));

      clearInterval(timerRef.current);
      const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      setOrchMsg("✅ Multi-agent compilation finalized successfully.");

      const modelsUsed = [...new Set(AGENTS.map(a => a.model))];

      setResult({
        solution_title:    responseData.solution_title    || "AI Agent Swarm Solution",
        executive_summary: responseData.executive_summary || "System operations ran successfully.",
        key_innovations:   responseData.key_innovations   || ["Parallel Architecture Execution"],
        tech_stack:        responseData.tech_stack        || ["FastAPI", "Azure OpenAI"],
        impact:            responseData.impact            || "Infrastructure deployment time optimized.",
        ms_alignment:      responseData.ms_alignment      || "Aligned with Azure AI Foundry.",
        agentResults:      responseData.agent_results     || [],
        elapsed:           totalElapsed,
        agentCount:        AGENTS.length,
        modelsUsed,
      });

      setOrchMsg(`🎯 Completed in ${totalElapsed}s — Swarm mission finished.`);
      addLog("orchestrator", `Pipeline completed in ${totalElapsed}s.`, "success");

    } catch (err) {
      clearInterval(timerRef.current);
      setOrchMsg(`❌ Error: ${err.message}`);
      addLog("orchestrator", `Error: ${err.message}`, "error");
      AGENTS.forEach(a => patchAgent(a.id, { status:"idle" }));
    } finally {
      clearInterval(timerRef.current);
      setRunning(false);
    }
  }

  function reset() {
    clearInterval(timerRef.current);
    setMission(""); setRunning(false); setResult(null); setLogs([]);
    setElapsed(0); setExpanded({});
    setOrchMsg("Awaiting mission directive...");
    AGENTS.forEach(a => patchAgent(a.id, { status:"idle", task:"", progress:0 }));
  }

  const isReady = proxyStatus === "ok";

  const Banner = () => {
    if (proxyStatus === "checking") return (
      <div className="banner banner-warn">⟳ Connecting to proxy on port 3001...</div>
    );
    if (proxyStatus === "error") return (
      <div className="banner banner-err">
        <span>⚠️</span>
        <span>Proxy unreachable. Run <strong>node server.js</strong> then <strong>python -m uvicorn main:app --port 8000</strong> in /backend.</span>
      </div>
    );
    return (
      <div className="banner banner-ok">
        <span>✓</span>
        <span>
          Azure OpenAI connected · Deployment: <strong>{proxyInfo?.deployment || "gpt-4o"}</strong> · Python backend: <strong>{proxyInfo?.python_backend || "ok"}</strong> · Ready.
        </span>
      </div>
    );
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="app">

        {/* Header */}
        <header className="hdr">
          <div className="logo-wrap">
            <div className="logo-icon">⬡</div>
            <div>
              <div className="logo-text">SwarmMind</div>
              <div className="logo-sub">AGENT SWARM DASHBOARD · AZURE OPENAI</div>
            </div>
          </div>
          <div className="hdr-right">
            <div className="swarm-meter" title={`Overall swarm progress: ${avgProgress}%`}>
              <svg width="34" height="34" viewBox="0 0 36 36">
                <circle className="swarm-meter-ring-bg" cx="18" cy="18" r={RING_R} strokeWidth="3" />
                <circle
                  className="swarm-meter-ring-fg"
                  cx="18" cy="18" r={RING_R} strokeWidth="3"
                  strokeDasharray={RING_C}
                  strokeDashoffset={RING_C * (1 - avgProgress / 100)}
                  transform="rotate(-90 18 18)"
                  style={{ stroke: meterColor }}
                />
              </svg>
              <span className="swarm-meter-label">{avgProgress}%</span>
            </div>
            <div className={`pill ${isReady ? "pill-violet" : "pill-red"}`}>
              <span className={`dot ${isReady ? "dot-violet" : "dot-red"}`} />
              {isReady ? "AZURE · LIVE" : "PROXY DISCONNECTED"}
            </div>
            <div className={`pill ${running ? "pill-violet" : "pill-green"}`}>
              <span className={`dot ${running ? "dot-violet" : "dot-live"}`} />
              {running ? `RUNNING · ${elapsed}s` : `${AGENTS.length} SPECIALISTS`}
            </div>
            {result && <button className="reset-btn" onClick={reset}>↺ Reset</button>}
          </div>
        </header>

        <Banner />

        <div className="grid-main">

          {/* Mission Panel */}
          <div className="panel mission-panel">
            <div className="panel-hdr">
              <span>Mission Control</span>
              <span className="dot" style={{ background:"#a78bfa" }} />
            </div>
            <div className="mission-inner">
              <div className="mission-label">▸ Enter Mission Directive</div>
              <div className="mission-row">
                <textarea
                  className="mission-ta"
                  placeholder="Describe a complex real-world problem for the agent swarm to solve..."
                  value={mission}
                  onChange={e => setMission(e.target.value)}
                  disabled={running}
                  rows={2}
                />
                <button
                  className="launch-btn"
                  onClick={runSwarm}
                  disabled={!mission.trim() || running || !isReady}
                >
                  {running ? "⟳ Running..." : "⚡ Launch Swarm"}
                </button>
              </div>
              <div className="presets">
                {PRESETS.map(p => (
                  <button key={p} className="chip" onClick={() => setMission(p)} disabled={running}>
                    {p.slice(0, 46)}…
                  </button>
                ))}
              </div>

              {/* Model selector — UNCHANGED */}
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:14, alignItems:"center" }}>
                <span style={{ fontFamily:"var(--mono)", fontSize:10, color:"var(--muted)", letterSpacing:1, textTransform:"uppercase" }}>Model:</span>
                {AVAILABLE_MODELS.map(m => (
                  <button
                    key={m}
                    onClick={() => !running && setOrchModel(m)}
                    disabled={running}
                    style={{
                      padding:"4px 10px", borderRadius:6,
                      fontSize:11, fontFamily:"var(--mono)", cursor:"pointer",
                      transition:"all 0.15s",
                      background: orchModel===m ? "rgba(124,58,237,0.18)" : "rgba(13,29,56,0.5)",
                      border: orchModel===m ? "1px solid rgba(124,58,237,0.45)" : "1px solid var(--border)",
                      color: orchModel===m ? "#c4b5fd" : "var(--muted)",
                    }}
                  >{m}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Swarm Panel */}
          <div className="panel swarm-panel">
            <div className="panel-hdr">
              <span>GitHub Copilot Agent Swarm</span>
              <span className="dot" style={{ background: running ? "#a78bfa" : "#1a3060" }} />
            </div>
            <div className="swarm-body">
              <div className={`orch-box ${running ? "running" : ""}`}>
                <div className="orch-lbl">⬡ Orchestrator · GitHub Copilot</div>
                <div className="orch-msg">{orchMsg}</div>
                <div className="orch-meta">Model: {orchModel} · Endpoint: api.githubcopilot.com</div>
              </div>
              <div className="agents-grid">
                {agents.map(ag => {
                  const longTask = ag.status === "active" && ag.task.length > 70;
                  return (
                    <div
                      key={ag.id}
                      className={`agent-card st-${ag.status} ${longTask ? "expandable" : ""}`}
                      style={{ "--ac": ag.color }}
                      {...(longTask ? {
                        role: "button",
                        tabIndex: 0,
                        "aria-expanded": !!expanded[ag.id],
                        onClick: () => toggleExpand(ag.id),
                        onKeyDown: (e) => {
                          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleExpand(ag.id); }
                        },
                      } : {})}
                    >
                      <div className="agent-top">
                        <div className="agent-icon">{ag.icon}</div>
                        <div>
                          <div className="agent-name">{ag.name}</div>
                          <div className="agent-role">{ag.role}</div>
                          <div className="agent-model">{ag.model}</div>
                        </div>
                        <span className={`agent-sbadge sb-${ag.status === "active" ? "working" : ag.status}`}>
                          {ag.status === "active" ? "working" : ag.status}
                        </span>
                      </div>
                      <div className={`agent-task ${ag.status==="active"?"live":ag.status==="done"?"ok":""}`}>
                        {ag.status === "active" ? (
                          <>
                            {expanded[ag.id] ? ag.task : ag.task.slice(0,70)}
                            {longTask && (
                              <span className="expand-chevron">{expanded[ag.id] ? " ▴ less" : " ▾ more"}</span>
                            )}
                            <span className="think" style={{marginLeft:6}}><span/><span/><span/></span>
                          </>
                        ) : ag.status === "done" ? (
                          <>✓ Insights computed.</>
                        ) : (
                          <span style={{opacity:0.35}}>Awaiting mission directive...</span>
                        )}
                      </div>
                      <div className="agent-prog">
                        <div className="agent-prog-fill" style={{ width:`${ag.progress}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Log Panel */}
          <div className="panel log-panel">
            <div className="panel-hdr">
              <span>Live Feed</span>
              <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)"}}>{logs.length} EVENTS</span>
            </div>
            <div className="log-body" ref={logRef}>
              {logs.length === 0 ? (
                <div style={{color:"var(--muted)",fontSize:11,paddingTop:8,lineHeight:1.8}}>
                  Waiting for swarm activity...<br/>
                  Launch a mission to see<br/>real-time agent logs here.
                </div>
              ) : logs.map(l => (
                <div className="le" key={l.id}>
                  <span className="lt">{l.time}</span>
                  <span className="la" style={{color:colorOf(l.agent)}}>[{l.agent.slice(0,8)}]</span>
                  <span className={`lm ${l.type}`}>{l.msg}</span>
                </div>
              ))}
            </div>
            {running && (
              <div className="run-bar">
                Elapsed: <span>{elapsed}s</span>
                Active agents: <span>{agents.filter(a=>a.status==="active").length}</span>
                Done: <span>{agents.filter(a=>a.status==="done").length}/{AGENTS.length}</span>
              </div>
            )}
          </div>

          {/* Result Panel */}
          {result && (
            <div className="panel result-panel">
              <div className="panel-hdr">
                <span>Swarm Result — {result.solution_title}</span>
                <button className="reset-btn" onClick={reset} style={{padding:"4px 12px",fontSize:11}}>↺ Reset</button>
              </div>
              <div className="result-body">
                <div className="stats-row">
                  {[
                    { v: result.agentCount,               l:"Agents Active",   c:"var(--cyan)" },
                    { v: result.elapsed+"s",              l:"Total Time",      c:"var(--emerald)" },
                    { v: result.key_innovations?.length,  l:"Key Innovations", c:"var(--amber)" },
                    { v: result.tech_stack?.length,       l:"Tech Stack Items",c:"#a78bfa" },
                  ].map(s => (
                    <div className="stat-box" key={s.l}>
                      <div className="stat-val" style={{color:s.c}}>{s.v}</div>
                      <div className="stat-lbl">{s.l}</div>
                    </div>
                  ))}
                </div>

                <div className="res-grid">
                  <div className="res-sec res-sec-full">
                    <div className="sec-title">Executive Summary</div>
                    <div className="res-text">{result.executive_summary}</div>
                  </div>
                  <div className="res-sec">
                    <div className="sec-title">Key Innovations</div>
                    <div className="rchips">
                      {(result.key_innovations||[]).map((k,i) => (
                        <span key={i} className={`rchip ${["rc-c","rc-p","rc-g"][i%3]}`}>{k}</span>
                      ))}
                    </div>
                  </div>
                  <div className="res-sec">
                    <div className="sec-title">Tech Stack</div>
                    <div className="rchips">
                      {(result.tech_stack||[]).map((t,i) => (
                        <span key={i} className="rchip rc-p" style={{fontSize:12}}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="res-sec">
                    <div className="sec-title">Impact</div>
                    <div className="res-text">{result.impact}</div>
                  </div>
                  <div className="res-sec">
                    <div className="sec-title">Azure Alignment</div>
                    <div className="res-text" style={{color:"#a78bfa"}}>{result.ms_alignment}</div>
                  </div>

                  {result.agentResults?.length > 0 && (
                    <div className="res-sec res-sec-full">
                      <div className="sec-title">Agent Contributions</div>
                      <div className="ar-grid">
                        {result.agentResults.map((ar, i) => {
                          const agMeta = AGENTS.find(a => a.id === ar.agent_id || a.name === ar.name);
                          return (
                            <div className="ar-card" key={i} style={{ borderTopColor: agMeta?.color || "#a78bfa" }}>
                              <div className="ar-name" style={{ color: agMeta?.color || "#a78bfa" }}>
                                {agMeta?.icon || "🤖"} {ar.name || agMeta?.name || `Agent ${i+1}`}
                              </div>
                              <div className="ar-body">
                                {(ar.output || ar.summary || ar.result || "").slice(0, 160)}
                                {(ar.output || ar.summary || ar.result || "").length > 160 ? "…" : ""}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}