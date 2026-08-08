from typing import Any, Dict, List

from app.models.schemas import CandidateProfile, Feedback


def _candidate_summary(candidate: CandidateProfile) -> str:
    completed = []
    skipped = []
    retry_heavy = []

    for mission in candidate.missions:
        if mission.skipped:
            skipped.append(str(mission.day))
        elif mission.passed:
            completed.append(str(mission.day))

        if mission.attempts and mission.attempts >= 4:
            retry_heavy.append(f"Day {mission.day} ({mission.attempts} attempts)")

    return (
        f"Candidate: {candidate.member.name}, role: {candidate.member.jobRole}, "
        f"experience: {candidate.member.yearsExperience} years, education: {candidate.member.education}. "
        f"Completed days: {', '.join(completed[:10]) if completed else 'none'}. "
        f"Skipped days: {', '.join(skipped[:6]) if skipped else 'none'}. "
        f"Retry-heavy missions: {', '.join(retry_heavy[:5]) if retry_heavy else 'none'}."
    )


def build_primary_question_messages(
    candidate: CandidateProfile,
    topic: Dict[str, Any],
    question_number: int,
) -> List[Dict[str, str]]:
    return [
        {
            "role": "system",
            "content": (
                "You are a senior enterprise AI interviewer. "
                "Ask exactly one realistic technical interview question. "
                "Be conversational, concise, and technically strong. "
                "Do not provide the answer. Do not use markdown bullets. "
                "Keep the question under 90 words."
            ),
        },
        {
            "role": "user",
            "content": f"""
{_candidate_summary(candidate)}

Current topic:
- Curriculum day: {topic['day']}
- Topic title: {topic['title']}
- Module: {topic['module']}
- Topic type: {topic['type']}
- Candidate status on topic: {topic['candidate_status']}
- Tools: {', '.join(topic.get('tools', []))}
- Objectives: {' | '.join(topic.get('objectives', [])[:3])}

Task:
Ask Question {question_number} of 8.
The question should test real understanding, not memorization.
Calibrate difficulty to the candidate profile and mission history.
Naturally reference the topic, but do not sound robotic.

Return strict JSON only:
{{
  "question": "..."
}}
""".strip(),
        },
    ]


def build_follow_up_messages(
    candidate: CandidateProfile,
    topic: Dict[str, Any],
    question_number: int,
    previous_answer: str,
    answer_quality: str,
) -> List[Dict[str, str]]:
    return [
        {
            "role": "system",
            "content": (
                "You are a senior enterprise AI interviewer. "
                "Ask exactly one follow-up question based on the candidate's previous answer. "
                "If the answer was strong, probe depth, trade-offs, or failure modes. "
                "If medium, ask for implementation detail. "
                "If weak, simplify and test fundamentals. "
                "Keep it under 80 words. No markdown bullets."
            ),
        },
        {
            "role": "user",
            "content": f"""
{_candidate_summary(candidate)}

Current topic:
- Curriculum day: {topic['day']}
- Topic title: {topic['title']}
- Module: {topic['module']}
- Candidate status on topic: {topic['candidate_status']}
- Tools: {', '.join(topic.get('tools', []))}
- Objectives: {' | '.join(topic.get('objectives', [])[:3])}

Previous answer quality: {answer_quality}
Previous answer:
{previous_answer}

Task:
Ask Question {question_number} of 8 as a follow-up.
Make it feel like a real technical interview.

Return strict JSON only:
{{
  "question": "..."
}}
""".strip(),
        },
    ]


def build_evaluation_messages(
    topic: Dict[str, Any],
    answer: str,
    question_kind: str,
) -> List[Dict[str, str]]:
    return [
        {
            "role": "system",
            "content": (
                "You are evaluating a candidate's answer in a technical AI engineering interview. "
                "Score for technical correctness, clarity, and reasoning depth. "
                "Be fair and concise. Return strict JSON only."
            ),
        },
        {
            "role": "user",
            "content": f"""
Topic context:
- Curriculum day: {topic['day']}
- Topic title: {topic['title']}
- Module: {topic['module']}
- Tools: {', '.join(topic.get('tools', []))}
- Objectives: {' | '.join(topic.get('objectives', [])[:4])}
- Candidate status on topic: {topic['candidate_status']}
- Question kind: {question_kind}

Candidate answer:
{answer}

Return strict JSON only:
{{
  "quality": "strong|medium|weak",
  "score": 0.0,
  "technical_score": 1,
  "communication_score": 1,
  "reasoning_score": 1,
  "evidence": ["short point 1", "short point 2"],
  "gap": "main missing area"
}}
""".strip(),
        },
    ]


def build_feedback_polish_messages(
    candidate: CandidateProfile,
    transcript: List[Dict[str, Any]],
    feedback: Feedback,
) -> List[Dict[str, str]]:
    compact_transcript = []
    for turn in transcript[-8:]:
        compact_transcript.append(
            {
                "day": turn["day"],
                "title": turn["title"],
                "quality": turn["quality"],
                "technical_score": turn.get("technical_score"),
                "communication_score": turn.get("communication_score"),
                "reasoning_score": turn.get("reasoning_score"),
            }
        )

    return [
        {
            "role": "system",
            "content": (
                "You are polishing interview feedback for a technical AI engineering interview. "
                "Keep feedback concise, actionable, and professional. "
                "Do not invent skills not supported by the transcript. "
                "Return strict JSON only."
            ),
        },
        {
            "role": "user",
            "content": f"""
Candidate:
{_candidate_summary(candidate)}

Transcript summary:
{compact_transcript}

Current feedback draft:
summary: {feedback.summary}
strengths: {feedback.strengths}
gaps: {feedback.gaps}
next: {feedback.next}

Return strict JSON only:
{{
  "summary": "...",
  "strengths": ["..."],
  "gaps": ["..."],
  "next": ["..."]
}}
""".strip(),
        },
    ]