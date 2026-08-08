import re
from typing import Any, Dict, Set

from app.services.llm_service import evaluate_answer_with_llm


STOPWORDS = {
    "this", "that", "with", "from", "into", "your", "their", "about", "would",
    "could", "should", "there", "which", "while", "using", "where", "when",
    "have", "has", "been", "were", "what", "why", "them", "then", "than",
    "also", "only", "very", "more", "some", "such", "real", "production",
    "system", "systems", "explain", "build", "create", "understand"
}


def _tokenize(text: str) -> Set[str]:
    tokens = re.findall(r"[a-zA-Z0-9\-\+]+", text.lower())
    return {
        token for token in tokens
        if len(token) > 3 and token not in STOPWORDS
    }


def _expected_keywords(topic: Dict[str, Any]) -> Set[str]:
    keywords = set()

    keywords.update(_tokenize(topic.get("title", "")))

    for tool in topic.get("tools", [])[:3]:
        keywords.update(_tokenize(tool))

    for objective in topic.get("objectives", [])[:2]:
        keywords.update(_tokenize(objective))

    return keywords


def _heuristic_dimension_scores(quality: str) -> tuple[int, int, int]:
    if quality == "strong":
        return 5, 4, 4
    if quality == "medium":
        return 3, 3, 3
    return 2, 2, 2


def evaluate_answer(answer: str, topic: Dict[str, Any], question_kind: str) -> Dict[str, Any]:
    llm_result = evaluate_answer_with_llm(answer, topic, question_kind)
    if llm_result is not None:
        return llm_result

    answer_text = answer.strip()
    answer_tokens = _tokenize(answer_text)
    expected = _expected_keywords(topic)

    keyword_hits = len(answer_tokens & expected)
    word_count = len(answer_text.split())

    if keyword_hits >= 4 and word_count >= 35:
        quality = "strong"
        score = 0.85
    elif keyword_hits >= 2 or word_count >= 18:
        quality = "medium"
        score = 0.65
    else:
        quality = "weak"
        score = 0.40

    technical_score, communication_score, reasoning_score = _heuristic_dimension_scores(quality)

    evidence = []
    if keyword_hits > 0:
        evidence.append(f"Referenced {keyword_hits} topic-relevant keywords.")
    if word_count >= 18:
        evidence.append("Provided more than a one-line answer.")

    return {
        "quality": quality,
        "score": score,
        "keyword_hits": keyword_hits,
        "word_count": word_count,
        "technical_score": technical_score,
        "communication_score": communication_score,
        "reasoning_score": reasoning_score,
        "evidence": evidence[:3],
        "gap": "",
    }