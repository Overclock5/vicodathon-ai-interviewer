# PROMPTS.md

## Prompt 1
**Goal:** Define hackathon architecture for the AI Interview Agent.

**Prompt:**
Design a practical, judge-impressive architecture for an adaptive AI technical interview agent built in a 48-hour hackathon using Next.js + FastAPI.

**AI Output Summary:**
Suggested a monorepo with:
- Next.js frontend
- FastAPI backend
- deterministic interview planner
- LLM prompt builder
- competency map
- scoring engine
- final recommendation engine

**Outcome Implemented:**
Created the base project structure and architecture documentation.

## Prompt 2
**Goal:** Build the backend foundation for the AI Interview Agent based on the hackathon specification.

**Prompt:**
Read the technical specification, curriculum JSON, and candidate profiles. Design a backend for an AI Interview Agent that exposes the required `POST /api/interview` endpoint, maintains session state using `sessionId`, asks at least 8 questions across 4+ curriculum days, generates follow-up questions, and returns structured final feedback.

**AI Output Summary:**
Suggested:
- a FastAPI backend with a single `POST /api/interview` route
- Pydantic schemas for candidate, request, response, and feedback
- in-memory session storage
- curriculum and candidate loaders
- a deterministic interview planner to ensure 8 questions and 4-topic coverage
- answer evaluation logic
- final feedback generation with `summary`, `strengths`, `gaps`, and `next`

**Outcome Implemented:**
Built and tested the backend interview engine. Verified through Swagger that:
- the interview starts correctly
- continuation requests work with the same `sessionId`
- the interview completes successfully
- structured feedback is returned in the required format


## Prompt 3
**Goal:** Upgrade the interview engine with LLM-based intelligence while keeping the API contract unchanged.

**Prompt:**
Use OpenRouter as the initial LLM provider. Keep the integration modular so the model can be changed through environment variables. Use the LLM for adaptive interview questions, follow-ups, answer evaluation, final feedback, and the three planned features: Dynamic Interview Path, Interview Mind Map, and Hiring Recommendation. Keep API keys server-side and never expose them to the frontend.

**AI Output Summary:**
Suggested:
- a modular `config.py` using environment variables
- `OPENROUTER_API_KEY` and provider-based configuration
- an LLM service layer using an OpenAI-compatible client with OpenRouter
- prompt builders for question generation, follow-up generation, answer evaluation, and feedback polishing
- deterministic fallback logic if the LLM is unavailable

**Outcome Implemented:**
Integrated OpenRouter-compatible LLM support into the backend. The system now:
- generates more natural interview questions
- creates better follow-up questions
- evaluates answers with stronger reasoning
- produces more polished final feedback
- safely falls back to deterministic logic if LLM calls fail

## Prompt 4
**Goal:** Fix the frontend structure so Vercel can recognize and deploy it as a valid Next.js application.

**Prompt:**
Explain what files are required for Vercel to recognize the frontend as a valid Next.js app, and help correct the project structure without changing the core idea of the project.

**AI Output Summary:**
Suggested:
- adding a valid `package.json`
- adding `tsconfig.json`
- adding `next-env.d.ts`
- adding `app/layout.tsx`
- using the correct Next.js App Router structure
- ensuring the route folder is named `app` in lowercase
- fixing route folder names like `report`
- updating Vercel Root Directory to match the actual frontend folder

**Outcome Implemented:**
Corrected the frontend into a valid Next.js structure and successfully resolved the Vercel deployment issues. The landing page now loads on the production Vercel URL.

## Prompt 5
**Goal:** Connect the frontend experience to the backend interview engine so the project feels like a real product.

**Prompt:**
Build the frontend flow for the AI Interview Agent: candidate selection, interview chat screen, and final report page. Keep it simple, stable, and suitable for a hackathon MVP. The frontend should call the backend API and preserve interview state across the flow.

**AI Output Summary:**
Suggested:
- a candidate selection page
- a chat-style interview page
- a final feedback/report page
- frontend API helper functions
- browser storage for selected candidate and final report payload
- a backend candidates endpoint for loading available profiles
- environment-based backend URL configuration

**Outcome Implemented:**
Built the main frontend flow for the product:
- candidate selection
- interview conversation UI
- final report screen
- backend integration using environment variables
This made the project transition from a backend prototype into a usable demo product.

## Prompt 6
**Goal:** Make the product more impressive for judges by exposing the interview intelligence visually.

**Prompt:**
Keep the backend contract compatible, but extend the AI Interview Agent so the frontend can display a live competency map, progress indicators, score breakdowns, and a stronger final report. Make the three signature features clearly visible.

**AI Output Summary:**
Suggested:
- adding optional response metadata for question progress, covered days, competency map, recommendation, and score breakdown
- rendering a live “Interview Mind Map” in the interview UI
- upgrading the final report with recommendation badges, dimension scores, competency bars, and transcript snapshot

**Outcome Implemented:**
Enhanced both backend responses and frontend presentation so the adaptive behavior of the interviewer is visible during the interview and in the final report.

## Prompt 8
**Goal:** Improve frontend responsiveness for the live demo.

**Prompt:**
Make the AI Interview Agent frontend responsive across different screen sizes, especially for the landing page, interview workspace, and final report. Keep the layout clean and simple for a hackathon MVP.

**AI Output Summary:**
Suggested:
- a lightweight responsive hook
- dynamic grid layouts for mobile/tablet/desktop
- stacked panels for smaller screens
- adjusted spacing, font sizes, and cards
- responsive treatment for candidate cards, interview sidebar, and report dashboard

**Outcome Implemented:**
Improved the responsiveness of the user-facing interface across the main product screens.