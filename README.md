# Adaptive AI Interview Agent

An adaptive technical interviewer built for **ViCodathon by ABTalksOnAI**.

This project solves **Problem Statement 2: The Interview Agent** by conducting personalized, multi-turn technical interviews based on a candidate’s AI Cohort journey.

---

## Problem We Solved

The **AI Cohort** covers enterprise AI engineering topics like:

- RAG
- Vector Databases
- Prompt Engineering
- Agentic AI
- Model Context Protocol (MCP)
- AI Deployment
- Production AI Systems

After completing the cohort, candidates still struggle with a key challenge:

> **explaining what they built and defending their engineering decisions in technical interviews**

Our solution is an **AI Interview Agent** that interviews the candidate, adapts to their knowledge level, asks follow-up questions, maintains context, and generates actionable feedback.

---

## What the Product Does

The system:

- reads the **candidate profile**
- understands completed, skipped, and retry-heavy cohort missions
- selects relevant curriculum topics
- conducts an **8-question multi-turn technical interview**
- asks **adaptive follow-up questions**
- maintains session context using `sessionId`
- returns structured feedback at the end

The experience is designed to feel closer to a **real technical interview** than a static Q&A bot.

---

## Signature Features

### 1. Dynamic Interview Path
The interview is not fixed.

It adapts using:
- candidate mission history
- strengths and weak signals
- prior answers
- follow-up evaluation

This helps the interviewer decide:
- when to go deeper
- when to simplify
- when to move to another topic

---

### 2. Interview Mind Map
The system tracks topic competency live during the interview.

It shows:
- strong topics
- average topics
- weak topics
- covered curriculum days

This makes the interview process more explainable and gives judges a visible view of the system’s adaptive intelligence.

---

### 3. Hiring Recommendation
At the end of the interview, the system generates:

- summary
- strengths
- gaps
- next steps
- technical score
- communication score
- reasoning score
- recommendation signal

This converts raw conversation into actionable interview feedback.

---

## Architecture

### Frontend
- **Next.js**
- Candidate selection UI
- Interview chat UI
- Report page
- Live competency view

### Backend
- **FastAPI**
- Session-based interview engine
- Curriculum and candidate loaders
- Deterministic interview planner
- LLM-powered question generation
- LLM-powered answer evaluation
- Final feedback generator

### LLM Layer
- **OpenRouter**
- configurable through environment variables
- used for:
  - adaptive question phrasing
  - follow-up generation
  - answer evaluation
  - feedback polishing

### Hosting
- **Frontend:** Vercel
- **Backend:** Render

---

## Hybrid Intelligence Design

We intentionally use a **hybrid architecture**.

### Deterministic components handle:
- curriculum coverage
- minimum 8-question flow
- 4+ day topic coverage
- session state
- safe fallbacks

### LLM components handle:
- natural question phrasing
- adaptive follow-up quality
- answer evaluation
- final feedback refinement

This gives us both:
- **control/reliability**
- **realistic interview behavior**

---

## API Contract

The backend exposes the required endpoint:

```http
POST /api/interview

## Demo Flow

1. Open the live frontend
2. Select a candidate profile
3. Start the adaptive interview
4. Answer multi-turn technical questions
5. Observe follow-up adaptation and progress
6. Complete the interview
7. Review final feedback, scores, and competency map