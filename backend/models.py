from datetime import datetime
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class Podcast(Base):
    __tablename__ = "podcasts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    feed_url: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(String)
    author: Mapped[str | None] = mapped_column(String)
    website: Mapped[str | None] = mapped_column(String)
    last_updated: Mapped[datetime | None] = mapped_column(DateTime)
    subscribed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    episodes: Mapped[list["Episode"]] = relationship(
        "Episode", back_populates="podcast", cascade="all, delete-orphan"
    )


class Episode(Base):
    __tablename__ = "episodes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    podcast_id: Mapped[int] = mapped_column(Integer, ForeignKey("podcasts.id"), nullable=False)
    guid: Mapped[str] = mapped_column(String, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    audio_url: Mapped[str | None] = mapped_column(String)
    image_url: Mapped[str | None] = mapped_column(String)
    duration: Mapped[int | None] = mapped_column(Integer)  # seconds
    published_at: Mapped[datetime | None] = mapped_column(DateTime)
    is_played: Mapped[bool] = mapped_column(Boolean, default=False)
    is_downloaded: Mapped[bool] = mapped_column(Boolean, default=False)
    playback_position: Mapped[int] = mapped_column(Integer, default=0)  # seconds
    in_queue: Mapped[bool] = mapped_column(Boolean, default=False)
    queue_position: Mapped[int | None] = mapped_column(Integer)

    podcast: Mapped["Podcast"] = relationship("Podcast", back_populates="episodes")
