import logging

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from gateway.db import session_factory
from gateway.dependencies import verify_api_key
from gateway.limits.costing import estimate_cost_usd
from gateway.limits.rate_limit import enforce_rpm
from gateway.limits.spend import add_daily_spend, enforce_daily_spend
from gateway.llm.generate import generate
from gateway.models import APIKey, UsageLog
from gateway.rag.retrieve import retrieve

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
    await enforce_daily_spend(api_key)
    chunks = await retrieve(body.message)
    if chunks:
        context = "\n\n".join(chunk.content for chunk in chunks)
        prompt = f"Context:\n{context}\n\nQuestion: {body.message}\nAnswer using the context when relevant."
    else:
        prompt = body.message
    result = await generate(prompt)
    cost_usd = estimate_cost_usd(result.model, result.tokens_input, result.tokens_output)
    if api_key.id is not None:
        await add_daily_spend(api_key.id, cost_usd)
    try:
        async with session_factory() as session:
            session.add(
                UsageLog(
                    api_key_id=api_key.id,
                    model_used=result.model,
                    tokens_input=result.tokens_input,
                    tokens_output=result.tokens_output,
                    cost_usd=cost_usd,
                )
            )
            await session.commit()
    except Exception:
        logger.exception("usage log insert failed")
    return ChatResponse(reply=result.text)
