from fastapi import APIRouter, HTTPException

from app.models.schemas import InterviewRequest, InterviewResponse
from app.services.evaluator import evaluate_answer
from app.services.interview_planner import (
    build_follow_up_question,
    build_primary_question,
    build_topic_queue,
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


@router.post("/interview", response_model=InterviewResponse)
def interview(request: InterviewRequest):
    # START INTERVIEW
    if request.candidate is not None:
        topic_queue = build_topic_queue(request.candidate)

        if len(topic_queue) < 4:
            raise HTTPException(
                status_code=400,
                detail="Candidate does not have enough mission data to build a 4-topic interview."
            )

        session = create_session(
            session_id=request.sessionId,
            candidate=request.candidate,
            topic_queue=topic_queue
        )

        first_topic = session.topic_queue[0]
        first_question = build_primary_question(first_topic, 1)

        session.last_question = {
            "day": first_topic["day"],
            "title": first_topic["title"],
            "kind": "primary",
            "prompt": first_question
        }
        session.questions_asked = 1

        return InterviewResponse(
            reply=(
                f"Hi {request.candidate.member.name}, welcome. "
                f"I’ll tailor this interview to your cohort journey and ask follow-up questions as we go.\n\n"
                f"{first_question}"
            ),
            done=False
        )

    # CONTINUE INTERVIEW
    message = (request.message or "").strip()
    if not message:
        raise HTTPException(
            status_code=400,
            detail="Send `candidate` to start the interview, or send a non-empty `message` to continue it."
        )

    session = get_session(request.sessionId)
    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Unknown sessionId. Start the interview first with a candidate payload."
        )

    if session.last_question is None:
        raise HTTPException(
            status_code=500,
            detail="Session exists but last question state is missing."
        )

    current_topic = session.topic_queue[session.current_topic_index]
    evaluation = evaluate_answer(message, current_topic)

    session.transcript.append({
        "day": current_topic["day"],
        "title": current_topic["title"],
        "module": current_topic["module"],
        "question_kind": session.last_question["kind"],
        "question": session.last_question["prompt"],
        "answer": message,
        "quality": evaluation["quality"],
        "score": evaluation["score"],
        "keyword_hits": evaluation["keyword_hits"],
        "word_count": evaluation["word_count"]
    })

    _update_competency(session, current_topic["title"], evaluation["score"])

    # AFTER PRIMARY -> ASK FOLLOW-UP
    if session.last_question["kind"] == "primary":
        next_question_number = session.questions_asked + 1
        follow_up = build_follow_up_question(
            current_topic,
            evaluation["quality"],
            next_question_number
        )

        session.last_question = {
            "day": current_topic["day"],
            "title": current_topic["title"],
            "kind": "follow_up",
            "prompt": follow_up
        }
        session.questions_asked = next_question_number

        return InterviewResponse(
            reply=f"Thanks, that's helpful.\n\n{follow_up}",
            done=False
        )

    # AFTER FOLLOW-UP -> MOVE TO NEXT TOPIC OR FINISH
    if current_topic["day"] not in session.covered_days:
        session.covered_days.append(current_topic["day"])

    session.current_topic_index += 1

    if session.current_topic_index >= len(session.topic_queue):
        feedback = build_feedback(session)
        return InterviewResponse(
            reply="Interview completed.",
            done=True,
            feedback=feedback
        )

    next_topic = session.topic_queue[session.current_topic_index]
    next_question_number = session.questions_asked + 1
    next_question = build_primary_question(next_topic, next_question_number)

    session.last_question = {
        "day": next_topic["day"],
        "title": next_topic["title"],
        "kind": "primary",
        "prompt": next_question
    }
    session.questions_asked = next_question_number

    return InterviewResponse(
        reply=f"Got it. Let's move to another part of your cohort journey.\n\n{next_question}",
        done=False
    )