"""Configuration loaded from environment variables."""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import List


def _split_csv(env_value: str | None, default: List[str]) -> List[str]:
    if not env_value:
        return default
    return [item.strip() for item in env_value.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    host: str = os.getenv("BRAIN_HOST", "0.0.0.0")
    port: int = int(os.getenv("BRAIN_PORT", "8000"))
    cors_origins: List[str] = field(
        default_factory=lambda: _split_csv(
            os.getenv("CORS_ORIGINS"),
            ["http://localhost:3000", "http://localhost:8081", "http://localhost:19006"],
        )
    )
    ollama_base_url: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    ollama_model: str = os.getenv("OLLAMA_MODEL", "llama3.1:8b")


settings = Settings()
