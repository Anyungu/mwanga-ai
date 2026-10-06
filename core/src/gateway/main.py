from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import text

import gateway.models
from gateway.db import engine
from gateway.routers import health


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(gateway.models.SQLModel.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(title="Mwanga Gateway", lifespan=lifespan)
app.include_router(health.router)
