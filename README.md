# 🤖 Smart Meeting Assistant

> **Agentic AI-powered Smart Meeting Workflow Orchestrator**

[![Team](https://img.shields.io/badge/Team-Victors-blue)](/)
[![Event](https://img.shields.io/badge/Event-IBM%20Hackathon-purple)](/)
[![License](https://img.shields.io/badge/License-ISC-green)](/)

## 📋 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Agent Descriptions](#-agent-descriptions)
- [Demo Scenario](#-demo-scenario)
- [Team](#-team)

---

## 🎯 Overview

The **Smart Meeting Assistant** is a multi-agent AI orchestrator that autonomously processes meeting transcripts, extracts insights, coordinates action items, and manages post-meeting workflows. Multiple AI agents collaborate to generate summaries, tasks, follow-ups, and answer questions about meeting content.

### Key Capabilities

- 🧠 **Intelligent Understanding** - Cleans and structures transcripts, detects decisions, risks, and unresolved topics
- ✅ **Action Extraction** - Identifies tasks, assigns owners, flags missing assignments
- 🔄 **Follow-Up Orchestration** - Suggests next meetings, escalates pending decisions
- 💬 **Q&A Interface** - Answer targeted questions about meeting content

---

## 🚨 Problem Statement

Remote and hybrid teams struggle to:
- Track decisions made during meetings
- Assign and follow up on action items effectively
- Manage post-meeting workflows efficiently

**Manual meeting management is time-consuming and error-prone.** This system automates understanding, task assignment, and workflow orchestration—increasing productivity and reducing overhead.

### Global Impact

- ✨ Streamlines enterprise workflows
- 🌍 Improves meeting efficiency worldwide
- 📈 Demonstrates scalable AI orchestration
- 🏢 Applicable to enterprises, project management, and consulting

---

## ✨ Features

### Must-Have Features

| Feature | Description |
|---------|-------------|
| **Transcript Processing** | Paste transcript → receive structured summary |
| **Action Items** | Extract tasks with owners, deadlines, and missing owner flags |
| **Follow-Up Suggestions** | Next steps, escalation of pending issues |
| **Q&A Functionality** | Ask questions about meeting content |

### Optional / Bonus Features (Future)

- 📅 Calendar integration
- 📧 Email notifications

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│                    (React / HTML + CSS + JS)                            │
│         Transcript Input | Output Display | Q&A Interface               │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              BACKEND                                     │
│                      (Node.js + Express)                                │
│              API Routes | Agent Orchestration | Data Aggregation        │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
┌───────────────────┐ ┌─────────────────┐ ┌─────────────────────┐
│   Understanding   │ │  Action/Owner   │ │   Follow-Up         │
│      Agent        │ │     Agent       │ │   Orchestration     │
│                   │ │                 │ │      Agent          │
│ • Clean transcript│ │ • Extract tasks │ │ • Suggest meetings  │
│ • Detect decisions│ │ • Assign owners │ │ • Escalate issues   │
│ • Identify risks  │ │ • Flag missing  │ │ • Recommend actions │
└───────────────────┘ └─────────────────┘ └─────────────────────┘
                                │
                                ▼
                    ┌─────────────────────┐
                    │   Knowledge/Q&A     │
                    │       Agent         │
                    │                     │
                    │ • Answer questions  │
                    │ • Search context    │
                    └─────────────────────┘
```

### Data Flow

1. **User** pastes transcript → Backend routes to **Understanding Agent**
2. Structured transcript flows → **Action & Ownership Agent**
3. Follow-up suggestions generated by **Follow-Up Orchestration Agent**
4. Outputs aggregated and displayed on frontend
5. Q&A queries → routed to **Knowledge / Q&A Agent**

---

## 🛠 Tech Stack

| Layer | Technology | Responsibilities |
|-------|------------|------------------|
| **Frontend** | React / HTML+CSS+JS | Transcript input, display outputs, Q&A interface |
| **Backend** | Node.js + Express | API routing, agent orchestration, data aggregation |
| **AI Agents** | IBM watsonx.ai (LLM API) | Role-specific prompts, reasoning, collaboration |
| **Storage** | In-memory / JSON | Intermediate outputs, session data |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- IBM watsonx.ai API credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/smart-meeting-assistant.git
   cd smart-meeting-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your credentials:
   ```env
   PORT=5000
   WATSONX_API_KEY=your_api_key_here
   WATSONX_PROJECT_ID=your_project_id_here
   WATSONX_URL=https://us-south.ml.cloud.ibm.com
   ```

4. **Start the backend server**
   ```bash
   npm start
   ```

5. **Start the frontend** (in a separate terminal)
   ```bash
   cd frontend
   npm install
   npm start
   ```

### Health Check

Verify the backend is running:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{ "status": "OK", "message": "Backend is running 🚀" }
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Process Transcript
```http
POST /api/meeting/process
Content-Type: application/json

{
  "transcript": "Your meeting transcript text here..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": { ... },
    "actionItems": [ ... ],
    "followUps": [ ... ]
  }
}
```

#### Get Summary Only
```http
POST /api/meeting/summary
Content-Type: application/json

{
  "transcript": "Your meeting transcript text here..."
}
```

#### Get Action Items
```http
POST /api/meeting/actions
Content-Type: application/json

{
  "transcript": "Your meeting transcript text here..."
}
```

#### Get Follow-Up Suggestions
```http
POST /api/meeting/followups
Content-Type: application/json

{
  "transcript": "Your meeting transcript text here...",
  "actionItems": [ ... ]
}
```

#### Q&A Query
```http
POST /api/meeting/qa
Content-Type: application/json

{
  "transcript": "Your meeting transcript text here...",
  "question": "What did David agree to?"
}
```

---

## 🤖 Agent Descriptions

### 1. Meeting Understanding Agent
| Attribute | Description |
|-----------|-------------|
| **Role** | Cleans & structures transcript; detects decisions, risks, unresolved topics |
| **Input** | Raw transcript |
| **Output** | Structured transcript with key points, decisions, risks |

### 2. Action & Ownership Agent
| Attribute | Description |
|-----------|-------------|
| **Role** | Extracts tasks, assigns owners if mentioned, flags missing owners |
| **Input** | Structured transcript |
| **Output** | JSON array of tasks with owners, deadlines, status |

### 3. Follow-Up Orchestration Agent
| Attribute | Description |
|-----------|-------------|
| **Role** | Suggests next meetings, follow-ups, escalates pending decisions |
| **Input** | Action items + structured transcript |
| **Output** | Follow-up recommendations and escalations |

### 4. Knowledge / Q&A Agent
| Attribute | Description |
|-----------|-------------|
| **Role** | Answers targeted questions about meeting content |
| **Input** | User queries + structured transcript |
| **Output** | Text answers |

---

## 🎬 Demo Scenario

### Meeting Context
Team meeting with **John**, **Sarah**, and **David**. **Mike** misses the meeting.

### Sample Transcript
```
John: Let's discuss the project timeline. We need the backend ready by Friday.
Sarah: I can have the UI mockups done by Wednesday.
David: I'll coordinate with John on the backend updates.
John: What about the budget allocation? We still need approval.
Sarah: That's still pending. We should escalate to the manager.
John: Agreed. Let's schedule a follow-up meeting next week.
```

### Expected Output

**📝 Summary:**
- Project timelines discussed
- New UI design approved
- Pending decision: budget allocation

**✅ Action Items:**
| Task | Owner | Deadline | Status |
|------|-------|----------|--------|
| Backend completion | John | Friday | Assigned |
| UI mockups | Sarah | Wednesday | Assigned |
| Budget follow-up | ⚠️ Unassigned | - | Flagged |

**🔄 Follow-Up:**
- Suggest next meeting to confirm budget allocation
- Escalate pending decisions to manager

**💬 Q&A Examples:**
- *"What did David agree to?"* → "David agreed to coordinate with John on the backend updates"
- *"Which decisions are still pending?"* → "Budget allocation is unresolved, follow up with manager"

---

## 📁 Project Structure

```
smart-meeting-assistant/
├── backend/
│   ├── index.js                 # Entry point & Express server
│   └── src/
│       ├── config/
│       │   └── watsonx.js       # IBM watsonx.ai configuration
│       ├── agents/
│       │   ├── understandingAgent.js  # Structures transcripts
│       │   ├── actionAgent.js         # Extracts action items
│       │   ├── followUpAgent.js       # Generates follow-ups
│       │   └── qaAgent.js             # Answers questions
│       ├── routes/
│       │   └── meetingRoutes.js       # API endpoints
│       ├── services/
│       │   └── orchestrator.js        # Agent coordination
│       └── utils/
│           └── prompts.js             # AI prompt templates
├── frontend/
│   ├── index.html               # Landing page
│   ├── input.html               # Transcript input page
│   ├── results.html             # Results display page
│   ├── demo.html                # Demo/flow visualization
│   └── assets/
│       ├── css/
│       │   ├── base.css         # Shared styles
│       │   └── styles.css       # Landing page styles
│       └── js/
│           ├── api.js           # API client
│           ├── input.js         # Input page logic
│           └── results.js       # Results page logic
├── .env.example                 # Environment template
├── package.json
└── README.md
```

---

## 👥 Team

**Team Victors** - IBM Hackathon 1-Day AI Challenge

---

## 📄 License

This project is licensed under the ISC License.

---

<p align="center">
  Made with ❤️ for the IBM Hackathon
</p>
