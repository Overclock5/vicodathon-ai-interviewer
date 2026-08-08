from collections import defaultdict
from statistics import mean

from app.models.schemas import Feedback
from app.services.curriculum_loader import get_day_map


def build_feedback(session) -> Feedback:
    day_map = get_day_map()

    scores_by_day = defaultdict(list)
    for turn in session.transcript:
        scores_by_day[turn["day"]].append(turn["score"])

    if not scores_by_day:
        return Feedback(
            summary="Interview ended before enough answers were collected.",
            strengths=["Interview session was initialized successfully."],
            gaps=["Not enough response data to evaluate technical depth."],
            next=["Complete the full interview to receive actionable feedback."]
        )

    average_scores = {
        day: round(mean(scores), 2)
        for day, scores in scores_by_day.items()
    }

    sorted_high = sorted(average_scores.items(), key=lambda item: item[1], reverse=True)
    sorted_low = sorted(average_scores.items(), key=lambda item: item[1])

    strengths = []
    for day, score in sorted_high:
        if score >= 0.75 and len(strengths) < 3:
            title = day_map[day]["title"]
            strengths.append(
                f"Strong performance on Day {day} ({title}); your answers showed good technical grounding and explanation clarity."
            )

    if not strengths:
        best_day, _ = sorted_high[0]
        strengths.append(
            f"Best relative performance came from Day {best_day} ({day_map[best_day]['title']})."
        )

    gaps = []
    next_steps = []

    for day, score in sorted_low:
        title = day_map[day]["title"]
        objective = day_map[day]["objectives"][0]

        if score < 0.60 and len(gaps) < 3:
            gaps.append(
                f"Needs deeper understanding of Day {day} ({title}), especially around implementation detail and engineering trade-offs."
            )
            next_steps.append(
                f"Review Day {day} and practice explaining how {objective.lower()} in a production scenario."
            )

    if not gaps:
        lowest_day, _ = sorted_low[0]
        title = day_map[lowest_day]["title"]
        gaps.append(
            f"Overall foundation is solid; the next improvement area is deeper trade-off discussion in Day {lowest_day} ({title})."
        )
        next_steps.append(
            "Practice answering with a clear structure: concept, implementation, trade-off, and production risk."
        )

    if len(next_steps) < 3:
        next_steps.append(
            "Rehearse short, structured interview answers instead of only concept definitions."
        )
    if len(next_steps) < 3:
        next_steps.append(
            "Prepare one end-to-end explanation connecting retrieval, prompting, agents, and deployment."
        )

    avg_score = mean(average_scores.values())
    if avg_score >= 0.78:
        readiness = "interview-ready with strong fundamentals"
    elif avg_score >= 0.62:
        readiness = "showing a solid foundation but needing more depth"
    else:
        readiness = "still developing interview readiness on core technical explanations"

    summary = (
        f"{session.candidate.member.name} completed an 8-question interview across "
        f"{len(scores_by_day)} curriculum days. Overall, the candidate is {readiness}. "
        f"The strongest signals came from covered cohort topics where explanations were clearer and more specific."
    )

    return Feedback(
        summary=summary,
        strengths=strengths[:3],
        gaps=gaps[:3],
        next=next_steps[:3]
    )