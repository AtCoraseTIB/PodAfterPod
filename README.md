# PodAfterPod

A BeyondPod-inspired podcast app built with **FastAPI** (backend) and **React Native / Expo** (Android app).

## Features

- Subscribe to podcasts via RSS feed URL
- Search for podcasts via iTunes Search API
- Browse episodes per podcast
- Audio playback with background audio support
- Resume playback from where you left off
- Skip forward 30s / back 15s
- Adjustable playback speed (0.75× – 2×)
- Episode queue management
- Mark episodes as played/unplayed
- Pull-to-refresh / refresh individual podcasts

## Project Structure

```
PodAfterPod/
├── backend/          # FastAPI Python backend
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── routers/
│   │   ├── podcasts.py
│   │   ├── episodes.py
│   │   └── search.py
│   └── services/
│       ├── rss_parser.py
│       └── podcast_search.py
├── mobile/           # React Native (Expo) Android app
│   ├── app/          # Expo Router pages
│   └── src/
│       ├── screens/
│       ├── components/
│       ├── store/
│       └── utils/
└── docker-compose.yml
```

## Getting Started

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# API available at http://localhost:8000
# Docs at http://localhost:8000/docs
```

Or with Docker:
```bash
docker-compose up
```

### Mobile App

```bash
cd mobile
npm install
npm run android   # Run on Android emulator/device
```

> **Note:** The Android emulator reaches your local machine at `10.0.2.2`.
> For a real device, update `BASE_URL` in `mobile/src/api.js` to your machine's LAN IP.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/podcasts/` | List subscriptions |
| POST | `/podcasts/subscribe` | Subscribe by RSS URL |
| POST | `/podcasts/{id}/refresh` | Fetch new episodes |
| DELETE | `/podcasts/{id}` | Unsubscribe |
| GET | `/episodes/podcast/{id}` | List episodes |
| GET | `/episodes/queue` | Get playback queue |
| PATCH | `/episodes/{id}/progress` | Save playback position |
| PATCH | `/episodes/{id}/played` | Mark as played |
| PATCH | `/episodes/{id}/queue` | Add/remove from queue |
| GET | `/search/?q=...` | Search iTunes for podcasts |
