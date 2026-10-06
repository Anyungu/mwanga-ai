import hashlib

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import APIKeyHeader
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from gateway.db import get_session
from gateway.models import APIKey

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def verify_api_key(
    key: str | None = Security(api_key_header),
    session: AsyncSession = Depends(get_session),
) -> APIKey:
    if not key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API Key",
        )
    key_hash = hashlib.sha256(key.encode()).hexdigest()
    result = await session.exec(select(APIKey).where(APIKey.key_hash == key_hash))
    api_key = result.first()
    if api_key is None or not api_key.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked API Key",
        )
    return api_key
