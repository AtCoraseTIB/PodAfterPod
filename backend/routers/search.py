from fastapi import APIRouter, Query
from services.podcast_search import search_podcasts

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/")
async def search(q: str = Query(..., min_length=1)):
    results = await search_podcasts(q)
    return results
