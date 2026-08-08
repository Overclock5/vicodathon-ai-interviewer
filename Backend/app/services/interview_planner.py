from typing import Any, Dict, List

from app.models.schemas import CandidateProfile, Mission
from app.services.curriculum_loader import get_day_map


PRIORITY_DAYS = [
    10, 11, 12, 13, 16, 20, 21, 22, 23, 27, 28, 29, 30, 31,
    7, 8, 9, 18, 4, 3, 1
]

PRIORITY_INDEX = {day: index for index, day in enumerate(PRIORITY_DAYS)}


def classify_mission(mission: Mission) -> str:
    if mission.skipped:
        return "weak"

    if mission.passed is False:
        return "weak"

    attempts = mission.attempts or 0

    if mission.passed and attempts <= 2:
        return "strong"

    if mission.passed and attempts <= 4:
        return "medium"

    return "weak"


def _normalize_objective(text: str) -> str:
    text = text.strip().rstrip(".")
    if not text:
        return text
    return text[0].lower() + text[1:]


def _topic_from_mission(mission: Mission, day_map: Dict[int, Dict[str, Any]]) -> Dict[str, Any]:
    day_info = day_map[mission.day]
    return {
        "day": day_info["day"],
        "title": day_info["title"],
        "module": day_info["module"],
        "type": day_info["type"],
        "tools": day_info.get("tools", []),
        "objectives": day_info.get("objectives", []),
        "candidate_status": classify_mission(mission),
        "attempts": mission.attempts,
        "passed": mission.passed,
        "skipped": mission.skipped
    }


def build_topic_queue(candidate: CandidateProfile) -> List[Dict[str, Any]]:
    day_map = get_day_map()

    candidate_missions = [
        mission for mission in candidate.missions
        if mission.day in day_map
    ]

    topics = [_topic_from_mission(mission, day_map) for mission in candidate_missions]

    topics.sort(key=lambda item: PRIORITY_INDEX.get(item["day"], 999))

    weak = [topic for topic in topics if topic["candidate_status"] == "weak"]
    strong = [topic for topic in topics if topic["candidate_status"] == "strong"]
    medium = [topic for topic in topics if topic["candidate_status"] == "medium"]

    selected: List[Dict[str, Any]] = []
    selected_days = set()

    def add_topics(source: List[Dict[str, Any]], limit: int | None = None):
        count = 0
        for topic in source:
            if topic["day"] not in selected_days:
                selected.append(topic)
                selected_days.add(topic["day"])
                count += 1
                if limit is not None and count >= limit:
                    break

    add_topics(weak, 1)
    add_topics(strong, 2)
    add_topics(medium, 1)
    add_topics(topics)

    return selected[:4]


def build_primary_question(topic: Dict[str, Any], question_number: int) -> str:
    objective = topic["objectives"][0] if topic["objectives"] else f"the core ideas of {topic['title']}"
    return (
        f"Question {question_number}/8. "
        f"On Day {topic['day']} you worked on '{topic['title']}'. "
        f"Can you explain how you would {_normalize_objective(objective)} "
        f"and why it matters in a real production AI system?"
    )


def build_follow_up_question(topic: Dict[str, Any], quality: str, question_number: int) -> str:
    title = topic["title"]

    if quality == "strong":
        return (
            f"Question {question_number}/8. Good. Now go one level deeper on '{title}': "
            f"what engineering trade-offs, failure cases, or production concerns would you evaluate first?"
        )

    if quality == "medium":
        return (
            f"Question {question_number}/8. Thanks. Can you walk me through the concrete implementation steps "
            f"or components you would use for '{title}'?"
        )

    return (
        f"Question {question_number}/8. Let's simplify it. At a high level, "
        f"what problem does '{title}' solve in the overall system?"
    )