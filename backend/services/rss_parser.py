from datetime import datetime
from email.utils import parsedate_to_datetime
import feedparser
import httpx


async def fetch_and_parse_feed(feed_url: str) -> dict:
    async with httpx.AsyncClient(follow_redirects=True, timeout=15) as client:
        response = await client.get(feed_url)
        response.raise_for_status()
        content = response.text

    feed = feedparser.parse(content)

    if feed.bozo and not feed.entries:
        raise ValueError(f"Could not parse feed: {feed_url}")

    podcast_info = {
        "title": feed.feed.get("title", "Unknown Podcast"),
        "description": feed.feed.get("summary") or feed.feed.get("description"),
        "image_url": _extract_image(feed.feed),
        "author": feed.feed.get("author") or feed.feed.get("itunes_author"),
        "website": feed.feed.get("link"),
        "last_updated": _parse_date(feed.feed.get("updated")),
        "episodes": [_parse_entry(entry) for entry in feed.entries],
    }
    return podcast_info


def _extract_image(feed_obj) -> str | None:
    if hasattr(feed_obj, "image") and hasattr(feed_obj.image, "href"):
        return feed_obj.image.href
    if hasattr(feed_obj, "itunes_image") and isinstance(feed_obj.itunes_image, dict):
        return feed_obj.itunes_image.get("href")
    return None


def _parse_date(date_str: str | None) -> datetime | None:
    if not date_str:
        return None
    try:
        return parsedate_to_datetime(date_str)
    except Exception:
        return None


def _parse_duration(duration_str: str | None) -> int | None:
    if not duration_str:
        return None
    parts = str(duration_str).strip().split(":")
    try:
        if len(parts) == 3:
            return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
        elif len(parts) == 2:
            return int(parts[0]) * 60 + int(parts[1])
        else:
            return int(parts[0])
    except ValueError:
        return None


def _extract_audio_url(entry) -> str | None:
    for link in getattr(entry, "enclosures", []):
        if link.get("type", "").startswith("audio/"):
            return link.get("href")
    for link in getattr(entry, "links", []):
        if link.get("type", "").startswith("audio/"):
            return link.get("href")
    return None


def _extract_episode_image(entry) -> str | None:
    itunes_image = getattr(entry, "itunes_image", None)
    if isinstance(itunes_image, dict):
        return itunes_image.get("href")
    return None


def _parse_entry(entry) -> dict:
    return {
        "guid": entry.get("id") or entry.get("link") or entry.get("title", ""),
        "title": entry.get("title", "Unknown Episode"),
        "description": entry.get("summary") or entry.get("description"),
        "audio_url": _extract_audio_url(entry),
        "image_url": _extract_episode_image(entry),
        "duration": _parse_duration(entry.get("itunes_duration")),
        "published_at": _parse_date(entry.get("published")),
    }
