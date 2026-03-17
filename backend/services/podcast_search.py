import httpx

ITUNES_SEARCH_URL = "https://itunes.apple.com/search"


async def search_podcasts(query: str, limit: int = 20) -> list[dict]:
    params = {
        "term": query,
        "media": "podcast",
        "limit": limit,
        "entity": "podcast",
    }
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(ITUNES_SEARCH_URL, params=params)
        response.raise_for_status()
        data = response.json()

    results = []
    for item in data.get("results", []):
        results.append({
            "title": item.get("trackName", ""),
            "author": item.get("artistName", ""),
            "feed_url": item.get("feedUrl", ""),
            "image_url": item.get("artworkUrl600") or item.get("artworkUrl100", ""),
            "genre": item.get("primaryGenreName", ""),
            "episode_count": item.get("trackCount", 0),
        })
    return [r for r in results if r["feed_url"]]
