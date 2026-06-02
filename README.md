# 🌐 SwarmMind — Autonomous AI Agent Orchestration Platform

> **Microsoft Build AI Hackathon 2026** | Track: **Agent Swarms**  
> Built during: May 5 – Jun 7, 2026

[![Azure AI Foundry](https://img.shields.io/badge/Azure%20AI%20Foundry-0078D4?style=flat&logo=microsoftazure&logoColor=white)](https://ai.azure.com)
[![Semantic Kernel](https://img.shields.io/badge/Semantic%20Kernel-5C2D91?style=flat&logo=microsoft&logoColor=white)](https://github.com/microsoft/semantic-kernel)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 What is SwarmMind?

SwarmMind is a **production-grade AI agent swarm orchestration platform** that deploys multiple specialist AI agents in parallel to solve complex, multi-dimensional engineering problems. Instead of relying on a single monolithic LLM call, SwarmMind breaks down any mission into concurrent sub-tasks handled by purpose-built agents — each with a distinct role, system prompt, and output schema.

**Core insight**: Real-world problems are too complex for one agent. SwarmMind mimics how expert teams work — a planner, researcher, analyst, coder, critic, and synthesizer all running in parallel, with an orchestrator coordinating their outputs into a coherent final report.

---

## 🎯 Problem Statement

Enterprise engineering teams waste hundreds of hours per week on:
- Manually decomposing complex technical problems
- Gathering research across fragmented knowledge sources  
- Writing, reviewing, and validating architectural proposals
- Synthesizing multi-stakeholder inputs into actionable documents

**SwarmMind automates this entire workflow** in under 60 seconds using a coordinated swarm of AI agents.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SwarmMind Platform                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   USER MISSION INPUT                                             │
│         │                                                        │
│         ▼                                                        │
│   ┌─────────────┐                                               │
│   │ ORCHESTRATOR│  ← Azure AI Foundry (GPT-4o)                 │
│   │  LAYER      │    Semantic Kernel Planner                    │
│   └──────┬──────┘                                               │
│          │  Decomposes into 6 parallel sub-tasks                │
│          │                                                       │
│    ┌─────┼──────────────────────────────────────┐              │
│    ▼     ▼       ▼        ▼        ▼       ▼    │              │
│  🗺️     🔍      📊       💻       🔬      ⚡    │              │
│ Planner Researcher Analyst  Coder  Critic Synth  │              │
│    │     │        │         │       │       │    │              │
│    └─────┴────────┴─────────┴───────┴───────┘    │              │
│                         │                         │              │
│                         ▼                         │              │
│                ┌─────────────────┐                │              │
│                │ SYNTHESIS LAYER │                │              │
│                │ Final Report    │                │              │
│                └─────────────────┘                │              │
│                                                   │              │
│  AZURE SERVICES USED:                             │              │
│  • Azure AI Foundry — Model hosting & inference   │              │
│  • Azure OpenAI — GPT-4o for all agent calls      │              │
│  • Semantic Kernel — Agent orchestration          │              │
│  • Azure Container Apps — Production deployment   │              │
│  • Azure Key Vault — API key management           │              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🤖 Agent Roster

| Agent | Role | Specialization |
|---|---|---|
| 🗺️ **Planner** | Task Decomposition | Breaks mission into milestones, success criteria, dependencies |
| 🔍 **Researcher** | Knowledge Retrieval | Surveys prior art, best practices, academic & industry sources |
| 📊 **Analyst** | Data Analysis | Identifies patterns, bottlenecks, performance metrics, tradeoffs |
| 💻 **Coder** | Code Generation | Prototypes core algorithms, architecture diagrams, pseudocode |
| 🔬 **Critic** | Quality Validation | Flags risks, edge cases, security vulnerabilities, anti-patterns |
| ⚡ **Synthesizer** | Output Synthesis | Compiles all outputs into structured, judge-ready technical report |

---

## 🛠️ Microsoft AI Stack

SwarmMind is built **ground-up on the Microsoft AI ecosystem**:

| Service | Usage |
|---|---|
| **Azure AI Foundry** | Unified platform for model deployment, monitoring, and fine-tuning |
| **Azure OpenAI (GPT-4o)** | Powers all 6 specialist agents and the orchestrator |
| **Semantic Kernel (Python SDK)** | Agent planning, function calling, and memory management |
| **Azure Container Apps** | Serverless deployment of the backend orchestration service |
| **Azure Key Vault** | Secure storage of API keys and secrets |
| **Azure Monitor + App Insights** | Observability for agent runs, latency, and errors |
| **GitHub Copilot** | Used during development for boilerplate and code suggestions |

---

## 📁 Project Structure

```
swarmmind/
├── frontend/                    # React 18 + Vite UI
│   ├── src/
│   │   ├── App.jsx              # Main SwarmMind component
│   │   ├── agents/              # Agent card components
│   │   ├── api/                 # Azure OpenAI client wrapper
│   │   └── styles/              # CSS variables & theme
│   ├── package.json
│   └── vite.config.js
│
├── backend/                     # Python orchestration service
│   ├── orchestrator.py          # Semantic Kernel planner
│   ├── agents/
│   │   ├── planner_agent.py
│   │   ├── researcher_agent.py
│   │   ├── analyst_agent.py
│   │   ├── coder_agent.py
│   │   ├── critic_agent.py
│   │   └── synthesizer_agent.py
│   ├── requirements.txt
│   └── main.py                  # FastAPI entrypoint
│
├── infra/                       # Azure Bicep / ARM templates
│   ├── main.bicep               # Full IaC for all Azure services
│   └── parameters.json
│
├── docs/
│   ├── architecture.md          # Detailed architecture docs
│   ├── demo-walkthrough.md      # Judge walkthrough guide
│   └── api-reference.md
│
├── .env.example                 # ⚠️ Template — never commit real secrets
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🚀 Setup & Installation

### Prerequisites

- Node.js 20+
- Python 3.11+
- Azure subscription with:
  - Azure OpenAI resource (GPT-4o deployment)
  - Azure AI Foundry project
- Git

### 1. Clone the repository

```bash
git clone https://github.com/<your-team>/swarmmind.git
cd swarmmind
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your Azure credentials:

```env
# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://<your-resource>.openai.azure.com/
AZURE_OPENAI_API_KEY=<your-key>
AZURE_OPENAI_DEPLOYMENT=gpt-4o

# Azure AI Foundry
AZURE_AI_PROJECT_CONNECTION_STRING=<your-connection-string>

# App config
VITE_API_BASE_URL=http://localhost:8000
```

> ⚠️ **Never commit `.env` to source control.** The `.gitignore` excludes it. Use Azure Key Vault in production.

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

### 4. Backend setup (optional — UI works standalone with Azure OpenAI direct)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 5. Production deployment on Azure Container Apps

```bash
# Login to Azure
az login

# Deploy infrastructure
az deployment group create \
  --resource-group swarmmind-rg \
  --template-file infra/main.bicep \
  --parameters @infra/parameters.json

# Build and push container
az acr build --registry <your-acr> --image swarmmind-backend:latest ./backend
```

---

## 🔐 Data Privacy & Security

This project fully complies with the hackathon's Data Privacy requirements:

- **No real user data**: All agent runs operate on text missions entered by the user. No PII is collected, stored, or logged.
- **No secrets in source control**: All API keys use environment variables. `.env` is gitignored. Azure Key Vault is used in production.
- **Data flow**: Mission text → Azure OpenAI API (subject to Azure's data processing terms) → UI display. No persistence layer by default.
- **Synthetic data only**: All demo missions use synthetic/hypothetical scenarios. No real proprietary or employer data is used.
- **Agent outputs**: Stored only in browser memory (React state). No server-side persistence in the demo build.

---

## 🧠 AI Tools Disclosure

Per hackathon rules, we disclose all AI tools used:

| Tool | Usage |
|---|---|
| **GitHub Copilot** | Code completion for boilerplate, component scaffolding, and utility functions |
| **Azure OpenAI GPT-4o** | Core agent intelligence — all reasoning, planning, and synthesis |
| **Claude (Anthropic)** | Prototyping architecture and exploring agent prompt design patterns |

All final engineering decisions, architecture design, agent prompt engineering, and system integration were made by human team members.

---

## 📊 Evaluation Alignment

| Criterion | How SwarmMind Addresses It |
|---|---|
| **Innovation** | Novel multi-agent orchestration pattern — parallel specialist agents with typed outputs |
| **Technical Execution** | Working prototype: Azure OpenAI integration, real parallel agent calls, live UI |
| **Microsoft AI Stack** | Azure AI Foundry + Azure OpenAI + Semantic Kernel — all core services |
| **Real-World Impact** | Reduces enterprise technical planning time from hours to seconds |
| **Code Quality** | Typed Python backend, React 18 with hooks, IaC via Bicep, env-secured secrets |
| **Demo-ability** | Single-click launch, 4 preset missions, real-time agent logs, structured report output |

---

## 👥 Team

| Name | Role | GitHub |
|---|---|---|
| [Your Name] | Lead Engineer & AI Architecture | [@handle] |
| [Teammate 2] | Frontend & UX | [@handle] |
| [Teammate 3] | Azure Infrastructure & DevOps | [@handle] |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Credits & Open-Source Attribution

- [React](https://react.dev) — MIT License
- [Vite](https://vitejs.dev) — MIT License
- [Semantic Kernel](https://github.com/microsoft/semantic-kernel) — MIT License (Microsoft)
- [FastAPI](https://fastapi.tiangolo.com) — MIT License
- [Azure Bicep](https://github.com/Azure/bicep) — MIT License (Microsoft)
- [Syne font](https://fonts.google.com/specimen/Syne) — OFL License
- [Space Mono font](https://fonts.google.com/specimen/Space+Mono) — OFL License

---

*Built with ❤️ for the Microsoft Build AI Hackathon 2026*