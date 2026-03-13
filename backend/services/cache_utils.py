from __future__ import annotations

import time
from threading import Lock
from typing import Any


class TTLCache:
    def __init__(self) -> None:
        self._store: dict[str, tuple[float, Any]] = {}
        self._lock = Lock()

    def get(self, key: str) -> Any | None:
        with self._lock:
            cached_entry = self._store.get(key)
            if cached_entry is None:
                return None

            expires_at, value = cached_entry
            if expires_at <= time.time():
                self._store.pop(key, None)
                return None

            return value

    def set(self, key: str, value: Any, ttl_seconds: int) -> Any:
        with self._lock:
            self._store[key] = (time.time() + ttl_seconds, value)
        return value

    def get_or_set(self, key: str, ttl_seconds: int, factory) -> Any:
        cached_value = self.get(key)
        if cached_value is not None:
            return cached_value

        value = factory()
        return self.set(key, value, ttl_seconds)


cache = TTLCache()
