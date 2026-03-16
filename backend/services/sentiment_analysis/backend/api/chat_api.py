from fastapi import APIRouter, WebSocket
from backend.services.sentiment_service import sentiment_engine

router = APIRouter()
connections = []

@router.websocket("/chat")
async def chat_socket(websocket: WebSocket):

    await websocket.accept()
    connections.append(websocket)

    try:
        while True:
            message = await websocket.receive_text()
            result = sentiment_engine.analyze(message)
            response = {
                "message": message,
                "sentiment_score": result["score"],
                "sentiment": result["sentiment"]
            }
            await websocket.send_json(response)

    except Exception:
        connections.remove(websocket)