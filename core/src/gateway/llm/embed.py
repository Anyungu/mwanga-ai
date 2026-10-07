import httpx
from fastapi import HTTPException, status

from gateway.config import settings

_MODEL = "nomic-embed-text"
_DIM = 768


async def embed(text: str) -> list[float]:
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{settings.ollama_base_url.rstrip('/')}/api/embeddings",
                json={"model": _MODEL, "prompt": text},
            )
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Ollama is not reachable",
        ) from exc
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Embedding model is not available",
        )
    body = response.json()
    vector = body.get("embedding")
    if not isinstance(vector, list) or len(vector) != _DIM:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Embedding dimension mismatch",
        )
    return [float(value) for value in vector]
