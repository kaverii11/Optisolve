from fastapi import FastAPI
from backend.api.chat_api import router

app = FastAPI(
    title="Real-Time Chat Sentiment System",
    version="1.0"
)

app.include_router(router)