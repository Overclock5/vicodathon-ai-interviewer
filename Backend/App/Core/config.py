import os
from dataclasses import dataclass
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


@dataclass
class Settings:
    llm_provider: str
    api_key: str
    base_url: str
    model_name: str
    site_url: str
    site_name: str
    llm_enabled: bool


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    llm_provider = os.getenv("LLM_PROVIDER", "openrouter").strip().lower()
    model_name = os.getenv("MODEL_NAME", "openai/gpt-4o-mini").strip()
    site_url = os.getenv("SITE_URL", "http://localhost:3000").strip()
    site_name = os.getenv("SITE_NAME", "ViCodathon AI Interview Agent").strip()

    if llm_provider == "openrouter":
        api_key = os.getenv("OPENROUTER_API_KEY", "").strip()
        base_url = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1").strip()
    elif llm_provider == "openai":
        api_key = os.getenv("OPENAI_API_KEY", "").strip()
        base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").strip()
    else:
        api_key = os.getenv("LLM_API_KEY", "").strip()
        base_url = os.getenv("LLM_BASE_URL", "").strip()

    return Settings(
        llm_provider=llm_provider,
        api_key=api_key,
        base_url=base_url,
        model_name=model_name,
        site_url=site_url,
        site_name=site_name,
        llm_enabled=bool(api_key and base_url and model_name),
    )