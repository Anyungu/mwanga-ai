import httpx
from fastapi import HTTPException, status
from pydantic import BaseModel

from gateway.config import settings

_MODEL = "gemini-3.8-flash"
_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{_MODEL}:generateContent"


class Completion(BaseModel):
    text: str
    model: str
    tokens_input: int
    tokens_output: int


async def generate(message: str) -> Completion:
    if not settings.gemini_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API key is not configured",
        )
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            _URL,
            headers={"x-goog-api-key": settings.gemini_api_key},
            json={"contents": [{"parts": [{"text": message}]}]},
        )
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Gemini request failed",
        )
    body = response.json()
    try:
        text = body["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Gemini response was empty",
        ) from None
    if not isinstance(text, str):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Gemini response was empty",
        )
    usage = body.get("usageMetadata")
    if not isinstance(usage, dict):
        usage = {}
    tokens_input = usage.get("promptTokenCount", 0)
    tokens_output = usage.get("candidatesTokenCount", 0)
    if not isinstance(tokens_input, int):
        tokens_input = 0
    if not isinstance(tokens_output, int):
        tokens_output = 0
    return Completion(
        text=text,
        model=_MODEL,
        tokens_input=tokens_input,
        tokens_output=tokens_output,
    )
