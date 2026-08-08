from statistics import mean

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    CompetencyNode,
    InterviewMeta,
    InterviewRequest,
    InterviewResponse,
    ScoreBreakdown,
)
from app.services.evaluator import evaluate_answer
from app.services.interview_planner import (
    build_follow_up_question as build_follow_up_question_fallback,
)
from app.services.interview_planner import (
    build_primary_question as build_primary_question_fallback,
    build_topic_queue,
)
from app.services.llm_service import (
    generate_follow_up_question,
    generate_primary_question,
    polish_feedback,
)
from app.services.recommendation import build_feedback
from app.services.session_store import create_session, get_session


router = APIRouter(prefix="/api", tags=["Interview"])


def _update_competency(session, topic_title: str, score: float) -> None:
    existing = session.competency_map.get(topic_title)
    if existing is None:
        session.competency_map[topic_title] = round(score, 2)
    else:
        session.competency_map[topic_title] = round((existing + score) / 2, 2)


def _score_level(score: float) -> str:
    if score >= 0.75:
        return "strong"
    if score >= 0.55:
        return "average"
    return "weak"


def _recommendation_label(session) -> str | None:
    if not session.transcript:
        return None

    avg_score = mean([turn["score"] for turn in session.transcript])

    if avg_score >= 0.78:
        return "Interview Ready"
    if avg_score >= 0.62:
        return "Promising, Needs More Depth"
    return "Needs Revision"


def _build_meta(session) -> InterviewMeta:
    competency_nodes = [
        CompetencyNode(
            topic=topic,
            score=round(score * 100, 1),
            level=_score_level(score),
        )
        for topic, score in sorted(
            session.competency_map.items(),
            key=lambda item: item[1],
            reverse=True,
        )
    ]

    score_breakdown = None
    if session.transcript:
        technical_avg = round(
            mean([turn.get("technical_score", 3) for turn in session.transcript]),
            1,
        )
        communication_avg = round(
            mean([turn.get("communication_score", 3) for turn in session.transcript]),
            1,
        )
        reasoning_avg = round(
            mean([turn.get("reasoning_score", 3) for turn in session.transcript]),
            1,
        )

        score_breakdown = ScoreBreakdown(
            technical=technical_avg,
            communication=communication_avg,
            reasoning=reasoning_avg,
        )

    return InterviewMeta(
        sessionId=session.session_id,
        currentQuestion=min(max(session.questions_asked, 1), 8),
        totalQuestions=8,
        coveredDays=sorted(session.covered_days),
        competencyMap=competency_nodes[:8],
        recommendation=_recommendation_label(session),
        scoreBreakdown=score_breakdown,
    )


@router.post("/interview", response_model=InterviewResponse)
def interview(request: InterviewRequest):
    # START INTERVIEW
    if request.candidate is not None:
        topic_queue = build_topic_queue(request.candidate)

        if len(topic_queue) < 4:
            raise HTTPException(
                status_code=400,
                detail="Candidate does not have enough mission data to build a 4-topic interview.",
            )

        session = create_session(
            session_id=request.sessionId,
            candidate=request.candidate,
            topic_queue=topic_queue,
        )

        first_topic = session.topic_queue[0]
        first_question = generate_primary_question(request.candidate, first_topic, 1)
        if not first_question:
            first_question = build_primary_question_fallback(first_topic, 1)

        session.last_question = {
            "day": first_topic["day"],
            "title": first_topic["title"],
            "kind": "primary",
            "prompt": first_question,
        }
        session.questions_asked = 1

        return InterviewResponse(
            reply=(
                f"Hi {request.candidate.member.name}, welcome. "
                f"I’ll tailor this interview to your cohort journey and ask follow-up questions as we go.\n\n"
                f"{first_question}"
            ),
            done=False,
            meta=_build_meta(session),
        )

    # CONTINUE INTERVIEW
    message = (request.message or "").strip()
    if not message:
        raise HTTPException(
            status_code=400,
            detail="Send `candidate` to start the interview, or send a non-empty `message` to continue it.",
        )

    session = get_session(request.sessionId)
    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Unknown sessionId. Start the interview first with a candidate payload.",
        )

    if session.last_question is None:
        raise HTTPException(
            status_code=500,
            detail="Session exists but last question state is missing.",
        )

    current_topic = session.topic_queue[session.current_topic_index]
    evaluation = evaluate_answer(message, current_topic, session.last_question["kind"])

    session.transcript.append(
        {
            "day": current_topic["day"],
            "title": current_topic["title"],
            "module": current_topic["module"],
            "question_kind": session.last_question["kind"],
            "question": session.last_question["prompt"],
            "answer": message,
            "quality": evaluation["quality"],
            "score": evaluation["score"],
            "technical_score": evaluation.get("technical_score", 3),
            "communication_score": evaluation.get("communication_score", 3),
            "reasoning_score": evaluation.get("reasoning_score", 3),
            "evidence": evaluation.get("evidence", []),
            "gap": evaluation.get("gap", ""),
            "keyword_hits": evaluation.get("keyword_hits", 0),
            "word_count": evaluation.get("word_count", len(message.split())),
        }
    )

    _update_competency(session, current_topic["title"], evaluation["score"])

    # AFTER PRIMARY -> ASK FOLLOW-UP
    if session.last_question["kind"] == "primary":
        next_question_number = session.questions_asked + 1

        follow_up = generate_follow_up_question(
            session.candidate,
            current_topic,
            next_question_number,
            message,
            evaluation["quality"],
        )
        if not follow_up:
            follow_up = build_follow_up_question_fallback(
                current_topic,
                evaluation["quality"],
                next_question_number,
            )

        session.last_question = {
            "day": current_topic["day"],
            "title": current_topic["title"],
            "kind": "follow_up",
            "prompt": follow_up,
        }
        session.questions_asked = next_question_number

        return InterviewResponse(
            reply=f"Thanks, that's helpful.\n\n{follow_up}",
            done=False,
            meta=_build_meta(session),
        )

    # AFTER FOLLOW-UP -> MOVE TO NEXT TOPIC OR FINISH
    if current_topic["day"] not in session.covered_days:
        session.covered_days.append(current_topic["day"])

    session.current_topic_index += 1

    if session.current_topic_index >= len(session.topic_queue):
        feedback = build_feedback(session)
        feedback = polish_feedback(session.candidate, session.transcript, feedback)

        return InterviewResponse(
            reply="Interview completed.",
            done=True,
            feedback=feedback,
            meta=_build_meta(session),
        )

    next_topic = session.topic_queue[session.current_topic_index]
    next_question_number = session.questions_asked + 1

    next_question = generate_primary_question(
        session.candidate,
        next_topic,
        next_question_number,
    )
    if not next_question:
        next_question = build_primary_question_fallback(next_topic, next_question_number)

    session.last_question = {
        "day": next_topic["day"],
        "title": next_topic["title"],
        "kind": "primary",
        "prompt": next_question,
    }
    session.questions_asked = next_question_number

    return InterviewResponse(
        reply=f"Got it. Let's move to another part of your cohort journey.\n\n{next_question}",
        done=False,
        meta=_build_meta(session),
    )