# AI Interview Agent - Architecture

## Objective
Build an adaptive AI interviewer that:
- personalizes questions using curriculum and candidate progress
- asks at least 8 questions across 4+ curriculum days
- generates follow-up questions
- maintains session context
- produces structured interview feedback

## Core System

### Frontend
- Next.js UI for candidate selection, chat interview, and report

### Backend
- FastAPI engine for planning, prompting, evaluation, and reporting

## Core Services
1. Curriculum Loader
2. Candidate Loader
3. Session Store
4. Interview Planner
5. Prompt Builder
6. LLM Service
7. Evaluator
8. Competency Map Updater
9. Recommendation Engine

## Signature Features
### 1. Dynamic Interview Path
Adaptive topic selection, follow-up questions, and difficulty scaling

### 2. Interview Mind Map
Tracks strong, medium, and weak concepts during the interview

### 3. Final Recommendation
Generates structured scoring and actionable feedback

## Session State
Each interview session will store:
- candidate id
- covered curriculum days
- asked questions
- transcript
- competency map
- current difficulty
- scores
- final recommendation