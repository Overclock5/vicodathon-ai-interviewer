from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from app.models.schemas import CandidateProfile


@dataclass
class SessionState:
    session_id: str
    candidate: CandidateProfile
    topic_queue: List[Dict[str, Any]]
    current_topic_index: int = 0
    questions_asked: int = 0
    last_question: Optional[Dict[str, Any]] = None
    transcript: List[Dict[str, Any]] = field(default_factory=list)
    competency_map: Dict[str, float] = field(default_factory=dict)
    covered_days: List[int] = field(default_factory=list)


_SESSIONS: Dict[str, SessionState] = {}


def create_session(session_id: str, candidate: CandidateProfile, topic_queue: List[Dict[str, Any]]) -> SessionState:
    initial_competency_map: Dict[str, float] = {}

    for topic in topic_queue:
        seed_score = {
            "strong": 0.70,
            "medium": 0.55,
            "weak": 0.35
        }.get(topic["candidate_status"], 0.50)

        initial_competency_map[topic["title"]] = seed_score

    session = SessionState(
        session_id=session_id,
        candidate=candidate,
        topic_queue=topic_queue,
        competency_map=initial_competency_map
    )

    _SESSIONS[session_id] = session
    return session


def get_session(session_id: str) -> Optional[SessionState]:
    return _SESSIONS.get(session_id)


def delete_session(session_id: str) -> None:
    _SESSIONS.pop(session_id, None)