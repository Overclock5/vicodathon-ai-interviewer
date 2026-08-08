from typing import List, Optional
from pydantic import BaseModel


class Member(BaseModel):
    id: str
    name: str
    jobRole: str
    yearsExperience: int
    education: str
    status: str


class Mission(BaseModel):
    day: int
    title: str
    passed: Optional[bool] = None
    attempts: Optional[int] = None
    skipped: Optional[bool] = None


class Signals(BaseModel):
    commitDays: int
    missionsCompleted: int
    missionsFirstTry: int


class CandidateProfile(BaseModel):
    member: Member
    missions: List[Mission]
    signals: Signals


class InterviewRequest(BaseModel):
    sessionId: str
    candidate: Optional[CandidateProfile] = None
    message: Optional[str] = None


class Feedback(BaseModel):
    summary: str
    strengths: List[str]
    gaps: List[str]
    next: List[str]


class CompetencyNode(BaseModel):
    topic: str
    score: float
    level: str


class ScoreBreakdown(BaseModel):
    technical: float
    communication: float
    reasoning: float


class InterviewMeta(BaseModel):
    sessionId: str
    currentQuestion: int
    totalQuestions: int
    coveredDays: List[int]
    competencyMap: List[CompetencyNode]
    recommendation: Optional[str] = None
    scoreBreakdown: Optional[ScoreBreakdown] = None


class InterviewResponse(BaseModel):
    reply: str
    done: bool
    feedback: Optional[Feedback] = None
    meta: Optional[InterviewMeta] = None