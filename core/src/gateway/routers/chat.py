import logging

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from gateway.db import session_factory
from gateway.dependencies import verify_api_key
from gateway.llm.router import generate
from gateway.models import APIKey, UsageLog
from gateway.rate_limit import enforce_rpm

logger = logging.getLogger(__name__)

router = APIRouter(tags=["chat"], dependencies=[Depends(verify_api_key)])


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


@router.post("/chat")
async def chat(
    body: ChatRequest,
    api_key: APIKey = Depends(verify_api_key),
) -> ChatResponse:
    await enforce_rpm(api_key)
    result = await generate(body.message)
    try:
        async with session_factory() as session:
            session.add(
                UsageLog(
                    api_key_id=api_key.id,
                    model_used=result.model,
                    tokens_input=result.tokens_input,
                    tokens_output=result.tokens_output,
                )
            )
            await session.commit()
    except Exception:
        logger.exception("usage log insert failed")
    return ChatResponse(reply=result.text)
