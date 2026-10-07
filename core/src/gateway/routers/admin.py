import hashlib
import secrets
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from sqlmodel import col, func, select

from gateway.db import session_factory
from gateway.key_cache import invalidate_api_key_cache
from gateway.models import APIKey, Role, UsageLog

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


class KeyUsage(BaseModel):
    api_key_id: int
    request_count: int
    tokens_input: int
    tokens_output: int
    cost_usd: float


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


@router.get("/keys/usage")
async def list_key_usage() -> list[KeyUsage]:
    start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    async with session_factory() as session:
        result = await session.exec(
            select(
                UsageLog.api_key_id,
                func.count().label("request_count"),
                func.coalesce(func.sum(col(UsageLog.tokens_input)), 0).label("tokens_input"),
                func.coalesce(func.sum(col(UsageLog.tokens_output)), 0).label("tokens_output"),
                func.coalesce(func.sum(col(UsageLog.cost_usd)), 0.0).label("cost_usd"),
            )
            .where(
                UsageLog.timestamp >= start,
                col(UsageLog.api_key_id).is_not(None),
            )
            .group_by(UsageLog.api_key_id)
        )
        rows = result.all()
    return [
        KeyUsage(
            api_key_id=api_key_id,
            request_count=int(request_count),
            tokens_input=int(tokens_input),
            tokens_output=int(tokens_output),
            cost_usd=float(cost_usd),
        )
        for api_key_id, request_count, tokens_input, tokens_output, cost_usd in rows
        if api_key_id is not None
    ]


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
