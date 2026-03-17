from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import asc, desc
from sqlalchemy.orm import Session
from database import get_db
from models import Episode

router = APIRouter(prefix="/episodes", tags=["episodes"])


class EpisodeOut(BaseModel):
    id: int
    podcast_id: int
    guid: str
    title: str
    description: str | None
    audio_url: str | None
    image_url: str | None
    duration: int | None
    published_at: datetime | None
    is_played: bool
    playback_position: int
    in_queue: bool
    queue_position: int | None

    class Config:
        from_attributes = True


class ProgressUpdate(BaseModel):
    position: int
    is_played: bool | None = None


class QueueUpdate(BaseModel):
    in_queue: bool
    queue_position: int | None = None


@router.get("/podcast/{podcast_id}", response_model=list[EpisodeOut])
def list_episodes(podcast_id: int, db: Session = Depends(get_db)):
    episodes = (
        db.query(Episode)
        .filter(Episode.podcast_id == podcast_id)
        .order_by(desc(Episode.published_at))
        .all()
    )
    return episodes


@router.get("/queue", response_model=list[EpisodeOut])
def get_queue(db: Session = Depends(get_db)):
    episodes = (
        db.query(Episode)
        .filter(Episode.in_queue == True)
        .order_by(asc(Episode.queue_position))
        .all()
    )
    return episodes


@router.patch("/{episode_id}/progress")
def update_progress(episode_id: int, update: ProgressUpdate, db: Session = Depends(get_db)):
    episode = db.query(Episode).filter(Episode.id == episode_id).first()
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")

    episode.playback_position = update.position
    if update.is_played is not None:
        episode.is_played = update.is_played
    db.commit()
    return {"ok": True}


@router.patch("/{episode_id}/played")
def mark_played(episode_id: int, db: Session = Depends(get_db)):
    episode = db.query(Episode).filter(Episode.id == episode_id).first()
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")
    episode.is_played = True
    episode.playback_position = 0
    db.commit()
    return {"ok": True}


@router.patch("/{episode_id}/unplayed")
def mark_unplayed(episode_id: int, db: Session = Depends(get_db)):
    episode = db.query(Episode).filter(Episode.id == episode_id).first()
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")
    episode.is_played = False
    episode.playback_position = 0
    db.commit()
    return {"ok": True}


@router.patch("/{episode_id}/queue")
def update_queue(episode_id: int, update: QueueUpdate, db: Session = Depends(get_db)):
    episode = db.query(Episode).filter(Episode.id == episode_id).first()
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")

    episode.in_queue = update.in_queue
    if update.in_queue and update.queue_position is None:
        # Append to end of queue
        max_pos = (
            db.query(Episode)
            .filter(Episode.in_queue == True)
            .order_by(desc(Episode.queue_position))
            .first()
        )
        episode.queue_position = (max_pos.queue_position + 1) if max_pos and max_pos.queue_position is not None else 0
    else:
        episode.queue_position = update.queue_position

    db.commit()
    return {"ok": True}


@router.get("/{episode_id}", response_model=EpisodeOut)
def get_episode(episode_id: int, db: Session = Depends(get_db)):
    episode = db.query(Episode).filter(Episode.id == episode_id).first()
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")
    return episode
