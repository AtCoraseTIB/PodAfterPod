from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import Episode, Podcast
from services.rss_parser import fetch_and_parse_feed

router = APIRouter(prefix="/podcasts", tags=["podcasts"])


class SubscribeRequest(BaseModel):
    feed_url: str


class PodcastOut(BaseModel):
    id: int
    title: str
    feed_url: str
    description: str | None
    image_url: str | None
    author: str | None
    website: str | None
    last_updated: datetime | None
    episode_count: int

    class Config:
        from_attributes = True


@router.get("/", response_model=list[PodcastOut])
def list_podcasts(db: Session = Depends(get_db)):
    podcasts = db.query(Podcast).order_by(Podcast.title).all()
    result = []
    for p in podcasts:
        episode_count = db.query(Episode).filter(Episode.podcast_id == p.id).count()
        result.append(PodcastOut(
            id=p.id,
            title=p.title,
            feed_url=p.feed_url,
            description=p.description,
            image_url=p.image_url,
            author=p.author,
            website=p.website,
            last_updated=p.last_updated,
            episode_count=episode_count,
        ))
    return result


@router.post("/subscribe", response_model=PodcastOut)
async def subscribe(req: SubscribeRequest, db: Session = Depends(get_db)):
    existing = db.query(Podcast).filter(Podcast.feed_url == req.feed_url).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already subscribed to this podcast")

    try:
        info = await fetch_and_parse_feed(req.feed_url)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse feed: {e}")

    podcast = Podcast(
        title=info["title"],
        feed_url=req.feed_url,
        description=info["description"],
        image_url=info["image_url"],
        author=info["author"],
        website=info["website"],
        last_updated=info["last_updated"],
    )
    db.add(podcast)
    db.flush()

    seen_guids = set()
    for ep_data in info["episodes"]:
        guid = ep_data["guid"]
        if guid in seen_guids:
            continue
        seen_guids.add(guid)
        episode = Episode(podcast_id=podcast.id, **ep_data)
        db.add(episode)

    db.commit()
    db.refresh(podcast)

    episode_count = db.query(Episode).filter(Episode.podcast_id == podcast.id).count()
    return PodcastOut(
        id=podcast.id,
        title=podcast.title,
        feed_url=podcast.feed_url,
        description=podcast.description,
        image_url=podcast.image_url,
        author=podcast.author,
        website=podcast.website,
        last_updated=podcast.last_updated,
        episode_count=episode_count,
    )


@router.post("/{podcast_id}/refresh")
async def refresh_podcast(podcast_id: int, db: Session = Depends(get_db)):
    podcast = db.query(Podcast).filter(Podcast.id == podcast_id).first()
    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")

    try:
        info = await fetch_and_parse_feed(podcast.feed_url)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse feed: {e}")

    podcast.title = info["title"]
    podcast.description = info["description"]
    podcast.image_url = info["image_url"]
    podcast.author = info["author"]
    podcast.website = info["website"]
    podcast.last_updated = info["last_updated"]

    existing_guids = {
        ep.guid for ep in db.query(Episode).filter(Episode.podcast_id == podcast_id).all()
    }

    new_count = 0
    for ep_data in info["episodes"]:
        if ep_data["guid"] not in existing_guids:
            episode = Episode(podcast_id=podcast_id, **ep_data)
            db.add(episode)
            new_count += 1

    db.commit()
    return {"new_episodes": new_count}


@router.delete("/{podcast_id}")
def unsubscribe(podcast_id: int, db: Session = Depends(get_db)):
    podcast = db.query(Podcast).filter(Podcast.id == podcast_id).first()
    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")
    db.delete(podcast)
    db.commit()
    return {"ok": True}
