from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.routes.agent_routes import router as agent_router
from backend.routes.ticket_routes import router as ticket_router

app = FastAPI(title=settings.app_name, version=settings.app_version)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
)

app.include_router(ticket_router)
app.include_router(agent_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
