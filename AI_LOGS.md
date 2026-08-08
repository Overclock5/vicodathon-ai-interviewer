# AI Usage Log

**Project:** AI Interview Platform  
**Hackathon:** ViCodathon 2026 – AB Talks on AI  
**Repository:** vicodathon-ai-interviewer

---

# Session 1 – Project Planning

**Date:** 07 Aug 2026

**AI Tool:** ChatGPT (Grace)

## Objective

Plan the project and understand the hackathon requirements before development.

### Prompt 1

**User Prompt**

> I have joined the ViCodathon hackathon as a solo participant. Guide me throughout the hackathon and help me build the project.

**Implementation**

- Planned the overall development workflow.
- Decided the AI-assisted development strategy.

---

### Prompt 2

**User Prompt**

> Analyze the complete ViCodathon kickoff transcript and extract all important rules, judging criteria and submission requirements.

**Implementation**

- Understood GitHub requirements.
- Understood AI log requirements.
- Planned commit strategy according to hackathon rules.

---

## Decisions Taken

- Selected **AI Interview Platform** as the project.
- Finalized repository name: **vicodathon-ai-interviewer**.
- Decided to use:
  - **ChatGPT** for planning, architecture, debugging and documentation.
  - **Arena AI** for implementation and UI development.
- Planned to maintain `AI_LOGS.md` throughout the hackathon.

**Status:** Planning Completed ✅

## Session 2 — Project Architecture Redesign with Arena AI

**AI used:** Arena AI

**Goal:**
Redesign the initial project structure into a practical, implementation-ready architecture for the 48-hour hackathon while keeping the system adaptive, explainable, and scalable.

**Prompt given to Arena AI:**
Design a practical, judge-impressive architecture for an adaptive AI technical interview agent built in a 48-hour hackathon using Next.js + FastAPI. Refine the project architecture with a clean frontend/backend split, adaptive interview flow, explainable scoring, and support for frequent development commits.

**AI response / guidance:**
Arena AI recommended:

* A monorepo structure with separate `frontend` and `backend`
* **Next.js** for the frontend
* **FastAPI** as the core interview engine
* A deterministic interview planner combined with LLM support
* A competency map as the initial knowledge-graph representation
* A scoring engine for evaluating candidate responses
* A final recommendation engine for hiring recommendations
* Keeping the three main signature features:

  1. Dynamic Interview Path
  2. Interview Mind Map
  3. Hiring Recommendation

**Implementation:**
Redesigned the project structure based on the AI recommendations and created the initial frontend/backend scaffold and architecture documentation.

**Files created/updated:**

* `.gitignore`
* `backend/requirements.txt`
* `backend/app/main.py`
* `backend/app/routers/health.py`
* `backend/.env.example`
* `frontend/app/page.tsx`
* `frontend/app/interview/page.tsx`
* `frontend/app/report/page.tsx`
* `docs/ARCHITECTURE.md`
* `PROMPTS.md`
* `ai_log.md`

**Key decision:**
Selected **Next.js + FastAPI** as the core stack. The interview engine will combine deterministic logic with LLM reasoning instead of allowing the LLM to control the entire interview flow. Final interview API endpoints were deferred until the official hackathon technical specification and provided datasets are reviewed.

**Result:**
The project moved from an initial concept into a structured implementation-ready architecture, with the frontend, backend, interview engine, scoring system, and signature AI features clearly separated.


## Step 2A - Python package initialization fix

**Goal:**  
Resolve backend startup import error.

**Prompt given to AI:**  
The backend failed to start and showed `NameError: name 'undefined' is not defined` inside `backend/app/__init__.py`.

**AI response summary:**  
The AI identified that `__init__.py` should be empty and that accidental text `undefined` was being executed as Python code.

**Implementation outcome:**  
Cleaned `backend/app/__init__.py` and verified package initialization files should remain empty unless intentionally used.

**Files changed:**  
- backend/app/__init__.py

**Notes / decisions:**  
Kept package init files empty for a clean FastAPI project structure.

## Session 3 - API contract, session flow, and deterministic interview engine

**Goal:**  
Implement the official hackathon API contract and create a working backend interview flow before adding LLM-based intelligence.

**Prompt given to AI:**  
Read the technical specification, curriculum JSON, and candidates JSON. Design the correct backend structure for `/api/interview` with session-based interview state, adaptive follow-ups, and final structured feedback.

**AI response summary:**  
The AI analyzed the official spec and recommended building:
- a single `POST /api/interview` endpoint
- Pydantic schemas matching candidate/request/response structure
- curriculum and candidate data loaders
- an in-memory session store using `sessionId`
- a deterministic interview planner selecting 4 topics and 8 questions
- adaptive follow-up generation based on answer quality
- structured final feedback with `summary`, `strengths`, `gaps`, and `next`

**Implementation outcome:**  
Built the real backend interview contract with:
- request/response schemas
- curriculum and candidates data ingestion
- topic queue planning from candidate missions
- answer evaluation heuristics
- session-based interview progression
- final feedback generation

**Files changed:**  
- backend/app/models/schemas.py
- backend/app/services/curriculum_loader.py
- backend/app/services/candidate_loader.py
- backend/app/services/interview_planner.py
- backend/app/services/evaluator.py
- backend/app/services/session_store.py
- backend/app/services/recommendation.py
- backend/app/routers/interview.py
- backend/app/main.py
- backend/app/data/curriculum.json
- backend/app/data/candidates.json

**Notes / decisions:**  
Used a deterministic planner first to guarantee API stability and testability. Deferred LLM-based natural phrasing and richer evaluation to the next step.