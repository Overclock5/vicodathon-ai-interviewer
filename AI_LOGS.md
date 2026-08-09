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

**Prompt given to Arena AI:**  
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


## Session 3 - LLM integration with OpenRouter and safe fallback

**Goal:**  
Upgrade the working interview backend with more natural question generation, smarter follow-ups, and better answer evaluation using an LLM layer.

**Prompt given to  Arena AI:**  
Enhance the existing deterministic interview engine using OpenRouter. Keep the official API contract unchanged, but improve question phrasing, follow-up quality, answer evaluation, and final feedback. Ensure the system still works if the LLM is unavailable.

**AI response summary:**  
The AI recommended:
- using an OpenAI-compatible client with OpenRouter
- adding environment-based config for model, base URL, and API key
- separating prompts into a `prompt_builder` service
- generating primary and follow-up questions through the LLM
- evaluating answers with a structured JSON rubric
- polishing final feedback with the LLM
- keeping deterministic fallback logic for reliability

**Implementation outcome:**  
Integrated OpenRouter-compatible LLM support into the backend while preserving the same `/api/interview` contract. The system now supports smarter interview behavior while safely falling back to deterministic logic if the model call fails.

**Files changed:**  
- backend/requirements.txt
- backend/app/core/config.py
- backend/app/services/prompt_builder.py
- backend/app/services/llm_service.py
- backend/app/services/evaluator.py
- backend/app/services/recommendation.py
- backend/app/routers/interview.py
- backend/.env.example

**Notes / decisions:**  
Chose a hybrid architecture: deterministic planning for coverage/control, and LLM generation for realism and adaptability.



## Session 4 - Modular OpenRouter integration with secure server-side configuration

**Goal:**  
Add LLM intelligence to the interview engine using OpenRouter as the initial provider, while keeping the integration modular and secure.

**Prompt given to Arena AI:**  
Use OpenRouter as the initial LLM provider. Keep the integration modular so the model can be changed through environment variables. Use the LLM for adaptive interview questions, follow-ups, answer evaluation, final feedback, and the planned features. Keep API keys server-side and never expose them to the frontend. Use `OPENROUTER_API_KEY` instead of hard-coding secrets.

**AI response summary:**  
The AI recommended:
- provider-based backend configuration using environment variables
- `LLM_PROVIDER=openrouter`
- `OPENROUTER_API_KEY` and `OPENROUTER_BASE_URL`
- server-side LLM calls through FastAPI only
- modular `config.py` and `llm_service.py`
- deterministic fallback behavior if the LLM is unavailable

**Implementation outcome:**  
Adjusted the LLM architecture to use OpenRouter securely through backend environment variables, while preserving the ability to switch providers or models later.

**Files changed:**  
- backend/app/core/config.py
- backend/app/services/llm_service.py
- backend/.env.example
- backend/.env
- .gitignore

**Notes / decisions:**  
Avoided exposing any secret to the frontend. Standardized on `OPENROUTER_API_KEY` for the initial provider setup.

## Session 5 - Frontend and backend integration for live interview flow

**Goal:**  
Connect the deployed frontend structure to the working FastAPI backend so a user can select a candidate, complete an interview, and view the final report from the UI.

**Prompt given to Arena AI:**  
Build the next step of the hackathon project: add a candidate selection UI, chat-based interview flow, report page, and required backend support endpoint for candidates. Keep the frontend simple, stable, and commit-friendly.

**AI response summary:**  
The AI recommended:
- adding a backend `GET /api/candidates` endpoint
- allowing CORS for browser-based frontend calls
- using a frontend environment variable for backend API base URL
- creating TypeScript types and API helper functions
- building three frontend screens: home, interview, and report
- storing the selected candidate and final report in browser storage for flow continuity

**Implementation outcome:**  
Integrated the frontend with the backend locally. The UI now supports candidate selection, chat interview progression, and final feedback rendering.

**Files changed:**  
- Backend/app/routers/candidates.py
- Backend/app/main.py
- Frontend/lib/types.ts
- Frontend/lib/api.ts
- Frontend/app/page.tsx
- Frontend/app/interview/page.tsx
- Frontend/app/report/page.tsx
- Frontend/.env.local.example
- .gitignore

**Notes / decisions:**  
Used a local frontend env variable (`NEXT_PUBLIC_API_BASE_URL`) so the same frontend can later be connected to a deployed backend without code changes.

## Session 5A - Backend deployed publicly on Render

**Goal:**  
Host the FastAPI backend publicly so the Vercel frontend can call it in the live demo.

**Prompt given to AI:**  
Help deploy the backend publicly and connect it to the frontend using environment variables.

**AI response summary:**  
The AI recommended deploying FastAPI on Render, testing the live backend endpoints, and configuring Vercel with `NEXT_PUBLIC_API_BASE_URL` pointing to the Render backend URL.

**Implementation outcome:**  
Successfully deployed the backend on Render at a public URL and prepared the frontend for live API integration.

**Notes / decisions:**  
Used Render Web Service instead of Blueprint. Fixed Linux case-sensitivity issues in backend folder names during deployment.

## Session 6 - Judge-facing polish with live competency map and enhanced report

**Goal:**  
Make the product’s three signature features visible in the UI: Dynamic Interview Path, Interview Mind Map, and Hiring Recommendation.

**Prompt given to Arena AI:**  
Design the next polish step for the AI Interview Agent. Keep the API contract intact, but expose useful interview metadata so the frontend can show live progress, competency tracking, and a stronger final report.

**AI response summary:**  
The AI recommended:
- extending the response model with optional metadata
- returning current question, covered days, competency map, recommendation label, and score breakdown
- rendering a live competency panel during the interview
- upgrading the final report with score cards, recommendation badge, curriculum coverage, and transcript snapshot

**Implementation outcome:**  
Added live metadata to the interview flow and upgraded the UI to make the system’s adaptive behavior and final evaluation visibly stronger for judges.

**Files changed:**  
- Backend/app/models/schemas.py
- Backend/app/routers/interview.py
- Frontend/lib/types.ts
- Frontend/app/interview/page.tsx
- Frontend/app/report/page.tsx

**Notes / decisions:**  
Used optional metadata so the original hackathon API contract remains compatible while allowing a richer frontend experience.

## Session 9C - Final UI freeze before submission

**Goal:**  
Lock the frontend into a polished, submission-ready state without introducing risky late-stage changes.

**Prompt given to AI:**  
Review the polished UI direction, apply only safe micro-improvements, and then freeze the interface for final submission.

**AI response summary:**  
The AI recommended:
- preserving the polished premium dark UI direction
- avoiding further structural redesign
- applying only low-risk refinements such as:
  - better metric layout density
  - clearer chat role labels
  - slightly improved chat readability
  - softer recommendation wording
  - improved interview microcopy
- freezing the UI afterward to reduce regression risk before submission

**Implementation outcome:**  
Finalized the polished UI across the home page, interview workspace, and report page. The interface now reflects the premium visual direction chosen for the hackathon demo and has been frozen for final submission stability.

**Files changed:**  
- Frontend/app/globals.css
- Frontend/app/interview/page.tsx
- Frontend/app/report/page.tsx

**Notes / decisions:**  
Chose stability over further experimentation. From this point onward, only final QA and submission actions should be performed unless a critical bug appears.