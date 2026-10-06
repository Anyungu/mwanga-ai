from datetime import datetime, timezone
from enum import Enum

from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel


class Role(str, Enum):
    admin = "admin"
    service_account = "service_account"
    viewer = "viewer"


class APIKey(SQLModel, table=True):
    __tablename__ = "api_keys"

    id: int | None = Field(default=None, primary_key=True)
    key_hash: str = Field(unique=True, index=True)
    owner_team: str = Field(index=True)
    role: Role = Role.service_account
    rate_limit_rpm: int = 60
    daily_cost_limit_usd: float = 10.0
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UsageLog(SQLModel, table=True):
    __tablename__ = "usage_logs"

    id: int | None = Field(default=None, primary_key=True)
    api_key_id: int | None = Field(
        default=None,
        sa_column=Column(ForeignKey("api_keys.id", ondelete="SET NULL"), index=True),
    )
    model_used: str = Field(index=True)
    tokens_input: int = 0
    tokens_output: int = 0
    cost_usd: float = 0.0
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class DocumentChunk(SQLModel, table=True):
    __tablename__ = "document_chunks"

    id: int | None = Field(default=None, primary_key=True)
    source_document: str = Field(index=True)
    content: str
    metadata_json: dict | None = Field(default=None, sa_column=Column(JSONB))
    embedding: list[float] | None = Field(default=None, sa_column=Column(Vector(768)))
