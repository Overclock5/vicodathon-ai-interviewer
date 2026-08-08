from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.health import router as health_router
from app.routers.interview import router as interview_router
from app.routers.candidates import router as candidates_router

app = FastAPI(
    title="AI Interview Agent API",
    version="0.4.0",
    description="Adaptive technical interview engine for the AI Cohort hackathon project."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(interview_router)
app.include_router(candidates_router)


@app.get("/")
def root():
    return {
        "message": "AI Interview Agent backend is running",
        "version": "0.4.0",
        "status": "ok"
    }