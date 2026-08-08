import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, Optional


DATA_DIR = Path(__file__).resolve().parent.parent / "data"
CANDIDATES_PATH = DATA_DIR / "candidates.json"


@lru_cache(maxsize=1)
def load_candidates() -> Dict[str, Any]:
    with open(CANDIDATES_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def get_candidate_by_id(candidate_id: str) -> Optional[Dict[str, Any]]:
    data = load_candidates()
    for candidate in data.get("candidates", []):
        member = candidate.get("member", {})
        if member.get("id") == candidate_id:
            return candidate
    return None