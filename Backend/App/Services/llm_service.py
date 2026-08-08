import json
import logging
import re
from typing import Any, Dict, Optional

from app.core.config import get_settings
from app.models.schemas import CandidateProfile, Feedback
from app.services.prompt_builder import (
    build_evaluation_messages,
    build_feedback_polish_messages,
    build_follow_up_messages,
    build_primary_question_messages,
)

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


logger = logging.getLogger(__name__)
_client = None


def is_llm_enabled() -> bool:
    settings = get_settings()
    return settings.llm_enabled and OpenAI is not None


def _get_client():
    global _client

    if _client is not None:
        return _client

    settings = get_settings()

    if OpenAI is None or not settings.llm_enabled:
        return None

    _client = OpenAI(
        api_key=settings.api_key,
        base_url=settings.base_url,
        default_headers={
            "HTTP-Referer": settings.site_url,
            "X-Title": settings.site_name,
        } if settings.llm_provider == "openrouter" else {},
    )
    return _client


def _extract_json(text: str) -> Optional[Dict[str, Any]]:
    text = text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        return None

    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return None


def _call_json(messages: list[dict[str, str]], temperature: float = 0.3) -> Optional[Dict[str, Any]]:
    if not is_llm_enabled():
        return None

    client = _get_client()
    settings = get_settings()

    if client is None:
        return None

    try:
        response = client.chat.completions.create(
            model=settings.model_name,
            messages=messages,
            temperature=temperature,
            max_tokens=350,
        )

        content = response.choices[0].message.content or ""
        return _extract_json(content)
    except Exception as exc:
        logger.warning("LLM call failed, falling back to deterministic logic: %s", exc)
        return None


def generate_primary_question(
    candidate: CandidateProfile,
    topic: Dict[str, Any],
    question_number: int,
) -> Optional[str]:
    result = _call_json(
        build_primary_question_messages(candidate, topic, question_number),
        temperature=0.5,
    )
    if not result:
        return None

    question = result.get("question")
    if isinstance(question, str) and question.strip():
        return f"Question {question_number}/8. {question.strip()}"

    return None


def generate_follow_up_question(
    candidate: CandidateProfile,
    topic: Dict[str, Any],
    question_number: int,
    previous_answer: str,
    answer_quality: str,
) -> Optional[str]:
    result = _call_json(
        build_follow_up_messages(
            candidate,
            topic,
            question_number,
            previous_answer,
            answer_quality,
        ),
        temperature=0.4,
    )
    if not result:
        return None

    question = result.get("question")
    if isinstance(question, str) and question.strip():
        return f"Question {question_number}/8. {question.strip()}"

    return None


def evaluate_answer_with_llm(
    answer: str,
    topic: Dict[str, Any],
    question_kind: str,
) -> Optional[Dict[str, Any]]:
    result = _call_json(
        build_evaluation_messages(topic, answer, question_kind),
        temperature=0.2,
    )
    if not result:
        return None

    quality = str(result.get("quality", "medium")).lower().strip()
    if quality not in {"strong", "medium", "weak"}:
        quality = "medium"

    try:
        score = float(result.get("score", 0.65))
    except (TypeError, ValueError):
        score = 0.65

    score = max(0.0, min(score, 1.0))

    def clamp_1_to_5(value: Any, default: int) -> int:
        try:
            value = int(value)
            return max(1, min(value, 5))
        except (TypeError, ValueError):
            return default

    evidence = result.get("evidence", [])
    if not isinstance(evidence, list):
        evidence = []

    gap = result.get("gap", "")
    if not isinstance(gap, str):
        gap = ""

    return {
        "quality": quality,
        "score": score,
        "technical_score": clamp_1_to_5(result.get("technical_score"), 3),
        "communication_score": clamp_1_to_5(result.get("communication_score"), 3),
        "reasoning_score": clamp_1_to_5(result.get("reasoning_score"), 3),
        "evidence": [str(item) for item in evidence[:3]],
        "gap": gap.strip(),
    }


def polish_feedback(
    candidate: CandidateProfile,
    transcript: list[dict[str, Any]],
    feedback: Feedback,
) -> Feedback:
    result = _call_json(
        build_feedback_polish_messages(candidate, transcript, feedback),
        temperature=0.2,
    )
    if not result:
        return feedback

    summary = result.get("summary", feedback.summary)
    strengths = result.get("strengths", feedback.strengths)
    gaps = result.get("gaps", feedback.gaps)
    next_steps = result.get("next", feedback.next)

    if not isinstance(summary, str):
        summary = feedback.summary
    if not isinstance(strengths, list):
        strengths = feedback.strengths
    if not isinstance(gaps, list):
        gaps = feedback.gaps
    if not isinstance(next_steps, list):
        next_steps = feedback.next

    return Feedback(
        summary=summary.strip(),
        strengths=[str(item) for item in strengths[:3]],
        gaps=[str(item) for item in gaps[:3]],
        next=[str(item) for item in next_steps[:3]],
    )