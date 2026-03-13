import asyncio
import websockets
import json

async def chat():
    uri = "ws://127.0.0.1:8000/chat"
    async with websockets.connect(uri) as websocket:
        while True:
            message = input("You: ")
            await websocket.send(message)
            response = await websocket.recv()
            data = json.loads(response)
            print("Sentiment:", data["sentiment"], "| Score:", data["sentiment_score"])

asyncio.run(chat())