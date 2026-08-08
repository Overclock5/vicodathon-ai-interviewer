import re
from typing import Any, Dict, Set


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


def evaluate_answer(answer: str, topic: Dict[str, Any]) -> Dict[str, Any]:
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

    return {
        "quality": quality,
        "score": score,
        "keyword_hits": keyword_hits,
        "word_count": word_count
    }