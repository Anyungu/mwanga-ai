import hashlib
import secrets
from datetime import datetime
from typing import Literal

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from sqlmodel import select

from gateway.db import session_factory
from gateway.key_cache import invalidate_api_key_cache
from gateway.models import APIKey, Role

router = APIRouter(prefix="/admin", tags=["admin"])

DemoRole = Literal["service_account", "viewer"]


class KeyCreate(BaseModel):
    owner_team: str = Field(min_length=1)
    role: DemoRole = "service_account"
    rate_limit_rpm: int = Field(default=60, ge=1)
    daily_cost_limit_usd: float = Field(default=10.0, ge=0)


class KeyCreated(BaseModel):
    id: int
    key: str
    owner_team: str
    role: Role
    rate_limit_rpm: int
    daily_cost_limit_usd: float
    is_active: bool
    created_at: datetime


class KeyRecord(BaseModel):
    id: int
    owner_team: str
    role: Role
    rate_limit_rpm: int
    daily_cost_limit_usd: float
    is_active: bool
    created_at: datetime


def to_record(row: APIKey) -> KeyRecord:
    if row.id is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal Server Error",
        )
    return KeyRecord(
        id=row.id,
        owner_team=row.owner_team,
        role=row.role,
        rate_limit_rpm=row.rate_limit_rpm,
        daily_cost_limit_usd=row.daily_cost_limit_usd,
        is_active=row.is_active,
        created_at=row.created_at,
    )


@router.post("/keys", status_code=status.HTTP_201_CREATED)
async def create_key(body: KeyCreate) -> KeyCreated:
    raw = secrets.token_urlsafe(32)
    record = APIKey(
        key_hash=hashlib.sha256(raw.encode()).hexdigest(),
        owner_team=body.owner_team,
        role=Role(body.role),
        rate_limit_rpm=body.rate_limit_rpm,
        daily_cost_limit_usd=body.daily_cost_limit_usd,
    )
    async with session_factory() as session:
        session.add(record)
        await session.commit()
        await session.refresh(record)
    created = to_record(record)
    return KeyCreated(key=raw, **created.model_dump())


@router.get("/keys")
async def list_keys() -> list[KeyRecord]:
    async with session_factory() as session:
        result = await session.exec(select(APIKey).order_by(APIKey.created_at.desc()))
        rows = result.all()
    return [to_record(row) for row in rows]


@router.put("/keys/{key_id}/revoke")
async def revoke_key(key_id: int) -> KeyRecord:
    async with session_factory() as session:
        result = await session.exec(select(APIKey).where(APIKey.id == key_id))
        row = result.first()
        if row is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
        row.is_active = False
        session.add(row)
        await session.commit()
        await session.refresh(row)
    await invalidate_api_key_cache(row.key_hash)
    return to_record(row)
