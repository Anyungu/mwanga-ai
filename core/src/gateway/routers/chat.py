from fastapi import APIRouter, Depends
from pydantic import BaseModel

from gateway.dependencies import verify_api_key

router = APIRouter(tags=["chat"], dependencies=[Depends(verify_api_key)])


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


@router.post("/chat")
async def chat(body: ChatRequest) -> ChatResponse:
    return ChatResponse(reply=body.message)
