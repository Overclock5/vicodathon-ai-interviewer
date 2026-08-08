import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict


DATA_DIR = Path(__file__).resolve().parent.parent / "data"
CURRICULUM_PATH = DATA_DIR / "curriculum.json"


def _find_module_title(day_number: int, modules: list[dict]) -> str:
    for module in modules:
        start_day, end_day = module["days"]
        if start_day <= day_number <= end_day:
            return module["title"]
    return "Unknown Module"


@lru_cache(maxsize=1)
def load_curriculum() -> Dict[str, Any]:
    with open(CURRICULUM_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


@lru_cache(maxsize=1)
def get_day_map() -> Dict[int, Dict[str, Any]]:
    curriculum = load_curriculum()
    modules = curriculum.get("modules", [])
    day_map: Dict[int, Dict[str, Any]] = {}

    for day in curriculum.get("days", []):
        enriched_day = {
            **day,
            "module": _find_module_title(day["day"], modules)
        }
        day_map[day["day"]] = enriched_day

    return day_map