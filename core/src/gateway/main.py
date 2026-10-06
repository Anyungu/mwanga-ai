from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import text

from gateway.db import engine
from gateway.routers import health


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1"))
    yield
    await engine.dispose()


app = FastAPI(title="Mwanga Gateway", lifespan=lifespan)
app.include_router(health.router)
