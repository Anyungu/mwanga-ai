from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlmodel import col, func, select

from gateway.db import session_factory
from gateway.models import APIKey, UsageLog
from gateway.redis_client import redis

SPEND_TTL_SECONDS = 60 * 60 * 26


def spend_cache_key(api_key_id: int) -> str:
    day = datetime.now(timezone.utc).strftime("%Y%m%d")
    return f"spend:{api_key_id}:{day}"


async def _seed_daily_spend(api_key_id: int) -> float:
    start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    async with session_factory() as session:
        result = await session.exec(
            select(func.coalesce(func.sum(col(UsageLog.cost_usd)), 0.0)).where(
                UsageLog.api_key_id == api_key_id,
                UsageLog.timestamp >= start,
            )
        )
        total = float(result.one())
    key = spend_cache_key(api_key_id)
    created = await redis.set(key, total, ex=SPEND_TTL_SECONDS, nx=True)
    if not created:
        cached = await redis.get(key)
        if cached is not None:
            return float(cached)
    return total


async def get_daily_spend(api_key_id: int) -> float:
    cached = await redis.get(spend_cache_key(api_key_id))
    if cached is not None:
        return float(cached)
    return await _seed_daily_spend(api_key_id)


async def enforce_daily_spend(api_key: APIKey) -> None:
    if api_key.id is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal Server Error",
        )
    spend = await get_daily_spend(api_key.id)
    if spend >= api_key.daily_cost_limit_usd:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Daily cost limit exceeded",
        )


async def add_daily_spend(api_key_id: int, cost_usd: float) -> None:
    key = spend_cache_key(api_key_id)
    await redis.incrbyfloat(key, cost_usd)
    if await redis.ttl(key) < 0:
        await redis.expire(key, SPEND_TTL_SECONDS)
