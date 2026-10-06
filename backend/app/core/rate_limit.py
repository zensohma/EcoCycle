import time

_WINDOW_SECONDS = 60
_MAX_ATTEMPTS = 5

_attempts: dict[str, list[float]] = {}


class RateLimitExceededError(Exception):
    pass


def check_login_rate_limit(client_ip: str) -> None:
    now = time.time()
    timestamps = _attempts.setdefault(client_ip, [])
    timestamps[:] = [t for t in timestamps if now - t < _WINDOW_SECONDS]

    if len(timestamps) >= _MAX_ATTEMPTS:
        raise RateLimitExceededError()

    timestamps.append(now)


def reset_login_rate_limit() -> None:
    _attempts.clear()
