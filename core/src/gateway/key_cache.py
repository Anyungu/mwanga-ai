import json
from datetime import datetime

from gateway.models import APIKey, Role
from gateway.redis_client import redis

AUTH_CACHE_TTL_SECONDS = 60


def auth_cache_key(key_hash: str) -> str:
    return f"key:{key_hash}"


async def get_cached_api_key(key_hash: str) -> APIKey | None:
    key_cache_key = auth_cache_key(key_hash)
    raw = await redis.get(key_cache_key)
    if raw is None:
        return None
    data = json.loads(raw)
    return APIKey(
        id=data["id"],
        key_hash=data["key_hash"],
        owner_team=data["owner_team"],
        role=Role(data["role"]),
        rate_limit_rpm=data["rate_limit_rpm"],
        daily_cost_limit_usd=data["daily_cost_limit_usd"],
        is_active=data["is_active"],
        created_at=datetime.fromisoformat(data["created_at"]),
    )


async def set_cached_api_key(api_key: APIKey) -> None:
    if api_key.id is None:
        return
    payload = {
        "id": api_key.id,
        "key_hash": api_key.key_hash,
        "owner_team": api_key.owner_team,
        "role": api_key.role.value,
        "rate_limit_rpm": api_key.rate_limit_rpm,
        "daily_cost_limit_usd": api_key.daily_cost_limit_usd,
        "is_active": api_key.is_active,
        "created_at": api_key.created_at.isoformat(),
    }
    await redis.set(auth_cache_key(api_key.key_hash), json.dumps(payload), ex=AUTH_CACHE_TTL_SECONDS)


async def invalidate_api_key_cache(key_hash: str) -> None:
    await redis.delete(auth_cache_key(key_hash))
