from fastapi import FastAPI

from app.schemas import ActivityEvent


app = FastAPI(
    title="Vita API",
    description="Backend for the Vita productivity and activity insights platform.",
    version="0.1.0",
)


@app.get("/", tags=["system"])
def root() -> dict[str, str]:
    return {"message": "Vita API is running"}


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/events", tags=["events"])
def ingest_event(event: ActivityEvent) -> dict[str, object]:
    return {"accepted": True, "event": event}
