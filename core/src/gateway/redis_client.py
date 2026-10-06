from redis.asyncio import Redis

from gateway.config import settings

redis = Redis.from_url(settings.redis_url, decode_responses=True)


async def ping_redis() -> None:
    await redis.ping()


async def close_redis() -> None:
    await redis.aclose()
