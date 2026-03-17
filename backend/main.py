from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers import episodes, podcasts, search

Base.metadata.create_all(bind=engine)

app = FastAPI(title="PodAfterPod", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(podcasts.router)
app.include_router(episodes.router)
app.include_router(search.router)


@app.get("/health")
def health():
    return {"status": "ok"}
