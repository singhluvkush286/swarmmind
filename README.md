# 🧠 SwarmMind — Autonomous Multi-Agent Orchestration Platform

> **Microsoft Build AI Hackathon 2026 — Agent Swarms Track**

[![Azure OpenAI](https://img.shields.io/badge/Azure%20OpenAI-GPT--4o-blue?logo=microsoft-azure)](https://azure.microsoft.com/en-us/products/ai-services/openai-service)
[![Semantic Kernel](https://img.shields.io/badge/Semantic%20Kernel-1.x-purple?logo=microsoft)](https://github.com/microsoft/semantic-kernel)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🚀 What is SwarmMind?

SwarmMind is an **autonomous multi-agent orchestration platform** that deploys specialized AI agents — Planner, Researcher, Executor, Critic, and Coordinator — to collaboratively solve complex tasks that no single AI agent could handle alone.

You give SwarmMind a high-level mission. It breaks it down, assigns agents, runs them in parallel on Azure infrastructure, and delivers a structured result — all without hand-holding.

**Think of it as a digital team that self-organizes, collaborates via shared memory, and adapts in real time.**

---

## 🎯 Problem Statement

Modern knowledge workers waste hours on tasks that require multi-step research, planning, writing, and validation. Existing AI tools are single-agent copilots that wait for instructions at every step. SwarmMind removes that bottleneck by deploying an **autonomous swarm** that plans and executes end-to-end.

---

## ✨ Key Features

- **🤖 5 Specialized Agents** — Planner, Researcher, Executor, Critic, Coordinator each with distinct roles
- **⚡ Parallel Execution** — Agents run concurrently on Azure, reducing task time by up to 70%
- **🧠 Shared Stigmergy Layer** — Agents communicate via a shared vector memory (Azure AI Search), not direct messaging
- **🔄 Conflict Resolution Node (CRN)** — Prevents agents from getting stuck in polite loops — forces binding decisions after 3 iterations
- **📊 Real-Time Dashboard** — Live agent activity, task progress, and swarm telemetry
- **🔒 Secure by Design** — No credentials in code, Azure Key Vault integration, all secrets via env vars

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        SwarmMind                            │
│                                                             │
│  ┌──────────┐    ┌──────────────────────────────────────┐  │
│  │ React UI │───▶│         Node.js API Gateway          │  │
│  │ (Vite)   │    │            (server.js)               │  │
│  └──────────┘    └─────────────────┬────────────────────┘  │
│                                    │                        │
│                    ┌───────────────▼──────────────────┐    │
│                    │      FastAPI Orchestrator         │    │
│                    │       (Python / backend/)         │    │
│                    └───┬───────────────────────────┬──┘    │
│                        │                           │        │
│          ┌─────────────▼──────────┐   ┌──────────▼──────┐ │
│          │   Azure OpenAI GPT-4o  │   │  Azure AI Search │ │
│          │  (Agent LLM backbone)  │   │  (Shared Memory) │ │
│          └────────────────────────┘   └─────────────────┘ │
│                                                             │
│   Agent Swarm:  [Planner] [Researcher] [Executor]          │
│                 [Critic]  [Coordinator]                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Microsoft AI Stack

| Component | Technology | Purpose |
|---|---|---|
| LLM Backbone | Azure OpenAI (GPT-4o) | Powers all 5 agents |
| Orchestration | Semantic Kernel (Python SDK) | Agent chaining & memory |
| Vector Memory | Azure AI Search | Shared stigmergy layer between agents |
| Infrastructure | Azure App Service | Backend deployment |
| Frontend Hosting | Azure Static Web Apps | React UI deployment |
| Secrets Management | Azure Key Vault (via env) | Secure credential storage |
| Monitoring | Azure Monitor / App Insights | Swarm telemetry & logging |

---

## 📁 Project Structure

```
swarmmind/
├── src/                        # React frontend (Vite)
│   ├── App.jsx                 # Root component
│   ├── components/
│   │   ├── AgentCard.jsx       # Individual agent status display
│   │   ├── SwarmDashboard.jsx  # Live swarm telemetry
│   │   ├── TaskInput.jsx       # Mission input form
│   │   └── ResultPanel.jsx     # Output display
│   └── main.jsx
├── backend/                    # Python FastAPI backend
│   ├── main.py                 # FastAPI app entry point
│   ├── orchestrator.py         # Swarm orchestration logic
│   ├── agents/
│   │   ├── planner_agent.py    # Breaks mission into subtasks
│   │   ├── researcher_agent.py # Web & knowledge retrieval
│   │   ├── executor_agent.py   # Task execution
│   │   ├── critic_agent.py     # Validates & critiques output
│   │   └── coordinator_agent.py# Resolves conflicts (CRN)
│   ├── memory/
│   │   └── stigmergy.py        # Azure AI Search shared memory
│   └── requirements.txt
├── server.js                   # Node.js API gateway / proxy
├── infra/                      # Azure deployment configs
│   └── azure-deploy.sh         # One-command Azure setup
├── docs/
│   ├── architecture.md         # Detailed architecture doc
│   └── demo-walkthrough.md     # Step-by-step demo guide
├── .env.example                # Required environment variables
├── package.json                # Node/React dependencies
├── vite.config.js              # Vite config
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js 18+
- Python 3.10+
- Azure account with OpenAI access
- Azure AI Search instance

### 1. Clone the repo

```bash
git clone https://github.com/singhluvkush286/swarmmind.git
cd swarmmind
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Fill in your Azure credentials in .env
```

### 3. Install & run backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 4. Install & run frontend

```bash
# In root directory
npm install
npm run dev
```

### 5. Start the API gateway

```bash
node server.js
```

### 6. Open the app

Navigate to `http://localhost:5173` and enter your mission.

### One-command start (recommended)

```bash
chmod +x infra/azure-deploy.sh
./infra/azure-deploy.sh
```

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your_api_key_here
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_SEARCH_ENDPOINT=https://your-search.search.windows.net
AZURE_SEARCH_KEY=your_search_key_here
AZURE_SEARCH_INDEX=swarmmind-memory
PORT=3001
```

> ⚠️ Never commit your `.env` file. It is in `.gitignore`.

---

## 🎬 How It Works — Demo

1. **Enter a mission** — e.g., *"Research the top 5 AI agent frameworks and write a comparison report"*
2. **SwarmMind deploys agents** — Planner breaks it into subtasks, assigns to Researcher, Executor, Critic
3. **Agents run in parallel** — each works on their subtask, storing results in shared Azure AI Search memory
4. **Critic reviews output** — flags issues; Conflict Resolution Node forces acceptance after 3 rounds
5. **Coordinator assembles** — final structured output delivered in the UI

📽️ **Full demo walkthrough**: [docs/demo-walkthrough.md](docs/demo-walkthrough.md)

---

## 📊 Evaluation Alignment

| Criterion | How SwarmMind Delivers |
|---|---|
| **Innovation** | Novel stigmergy layer + CRN for multi-agent conflict resolution |
| **Microsoft Stack** | Azure OpenAI, Semantic Kernel, Azure AI Search, Azure App Service |
| **Technical Depth** | 5 specialized agents, parallel execution, shared vector memory |
| **Real-World Impact** | Reduces multi-step knowledge work from hours to minutes |
| **Working Prototype** | Fully functional end-to-end demo (see walkthrough) |

---

## 🤖 AI Tools Disclosure

As required by hackathon guidelines, the following AI tools were used during development:

| Tool | Usage |
|---|---|
| GitHub Copilot | Code completion for boilerplate agent scaffolding |
| Azure OpenAI GPT-4o | Core LLM powering all agents at runtime |
| Claude (Anthropic) | README drafting and architecture documentation |

All core architecture decisions, agent design patterns, the stigmergy layer, and the Conflict Resolution Node were designed and implemented by the developer.

---

## 👤 Team

| Name | Role | GitHub |
|---|---|---|
| Luvkush Singh | Solo Developer — Full Stack + AI | [@singhluvkush286](https://github.com/singhluvkush286) |

**Professional Background:** Software Development Engineer at Verizon

---

## 🔒 Data Privacy & Security

- No user data is stored beyond the current session
- All API keys stored as environment variables — never hardcoded
- Azure Key Vault recommended for production deployments
- No PII collected or transmitted
- All agent outputs are ephemeral unless explicitly saved by the user

---

## 📄 License

MIT License — see [LICENSE](LICENSE)

---

## 🙏 Acknowledgements

- [Microsoft Semantic Kernel](https://github.com/microsoft/semantic-kernel)
- [Azure OpenAI Service](https://azure.microsoft.com/en-us/products/ai-services/openai-service)
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)

---

*Built for Microsoft Build AI Hackathon 2026 — Agent Swarms Track*
*Prototype Phase: May 5 – June 14, 2026*