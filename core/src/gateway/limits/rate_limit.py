from datetime import datetime, timezone

from fastapi import HTTPException, status

from gateway.models import APIKey
from gateway.redis_client import redis

RPM_TTL_SECONDS = 60


def rpm_cache_key(api_key_id: int) -> str:
    minute = datetime.now(timezone.utc).strftime("%Y%m%d%H%M")
    return f"rpm:{api_key_id}:{minute}"


async def enforce_rpm(api_key: APIKey) -> None:
    if api_key.id is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal Server Error",
        )
    key = rpm_cache_key(api_key.id)
    count = await redis.incr(key)
    if count == 1:
        await redis.expire(key, RPM_TTL_SECONDS)
    if count > api_key.rate_limit_rpm:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded",
        )
