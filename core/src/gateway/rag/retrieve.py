from sqlmodel import col, select

from gateway.db import session_factory
from gateway.llm.embed import embed
from gateway.models import DocumentChunk

_CHUNK_SIZE = 500
_OVERLAP = 100
_TOP_K = 3


def chunk_text(content: str) -> list[str]:
    text = content.strip()
    if not text:
        return []
    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = min(start + _CHUNK_SIZE, len(text))
        chunks.append(text[start:end])
        if end >= len(text):
            break
        start = end - _OVERLAP
    return chunks


async def retrieve(query: str, k: int = _TOP_K) -> list[DocumentChunk]:
    vector = await embed(query)
    async with session_factory() as session:
        result = await session.exec(
            select(DocumentChunk)
            .where(col(DocumentChunk.embedding).is_not(None))
            .order_by(DocumentChunk.embedding.cosine_distance(vector))
            .limit(k)
        )
        return list(result.all())
