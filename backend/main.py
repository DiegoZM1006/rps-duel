from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
import json
import uuid

from game_manager import game_manager
from models import PlayCardsRequest

app = FastAPI()

# CORS para desarrollo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gestión de conexiones WebSocket
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.player_to_room: Dict[str, str] = {}
    
    async def connect(self, player_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[player_id] = websocket
    
    async def disconnect(self, player_id: str):
        room_id = self.player_to_room.get(player_id)
        if player_id in self.active_connections:
            del self.active_connections[player_id]
        if player_id in self.player_to_room:
            del self.player_to_room[player_id]
        
        # Notificar al otro jugador si estaba en una sala o partida
        if room_id:
            await self.broadcast_to_room(room_id, {
                "type": "player_disconnected",
                "message": "El oponente se desconectó. La partida ha terminado."
            })
            room = game_manager.get_room(room_id)
            if room and room.game_id:
                game_manager.delete_game(room.game_id)
    
    async def send_personal_message(self, message: dict, player_id: str):
        if player_id in self.active_connections:
            await self.active_connections[player_id].send_json(message)
    
    async def broadcast_to_room(self, room_id: str, message: dict):
        room = game_manager.get_room(room_id)
        if not room: return
        players = [p.id for p in room.players]
        for player_id in players:
            await self.send_personal_message(message, player_id)

manager = ConnectionManager()

@app.get("/")
async def root():
    return {"message": "RPS Duel Backend is running"}

@app.websocket("/ws/{player_name}")
async def websocket_endpoint(websocket: WebSocket, player_name: str):
    player_id = str(uuid.uuid4())
    await manager.connect(player_id, websocket)
    
    try:
        # Enviar ID al cliente
        await manager.send_personal_message({
            "type": "connected",
            "player_id": player_id,
            "player_name": player_name
        }, player_id)
        
        # Escuchar mensajes
        while True:
            data = await websocket.receive_json()
            await handle_game_action(player_id, player_name, data)
            
    except WebSocketDisconnect:
        await manager.disconnect(player_id)

async def handle_game_action(player_id: str, player_name: str, data: dict):
    """Maneja acciones del juego"""
    action = data.get("action")

    if action == "create_room":
        room = game_manager.create_room(player_id, player_name)
        manager.player_to_room[player_id] = room.room_id
        await manager.send_personal_message({
            "type": "room_created",
            "room": room.model_dump()
        }, player_id)
        return

    if action == "join_room":
        room_id = data.get("room_id", "").upper()
        room = game_manager.join_room(room_id, player_id, player_name)
        if room:
            manager.player_to_room[player_id] = room.room_id
            await manager.broadcast_to_room(room.room_id, {
                "type": "player_joined",
                "room": room.model_dump()
            })
            # Si la sala está llena, iniciar la partida
            if len(room.players) == 2:
                game = game_manager.start_game_in_room(room.room_id)
                if game:
                    await manager.broadcast_to_room(room.room_id, {
                        "type": "game_start",
                        "game": game.model_dump()
                    })
        else:
            await manager.send_personal_message({
                "type": "error",
                "message": "La sala no existe o está llena."
            }, player_id)
        return

    # Acciones dentro de una partida
    room_id = manager.player_to_room.get(player_id)
    if not room_id: return

    room = game_manager.get_room(room_id)
    if not room or not room.game_id: return

    game_id = room.game_id
    game = game_manager.get_game(game_id)
    if not game: return
    
    if action == "play_attack":
        card_ids = data.get("card_ids", [])
        success = game_manager.play_attack(game_id, player_id, card_ids)
        
        if success:
            await manager.broadcast_to_room(room_id, {
                "type": "attack_played",
                "game": game.model_dump()
            })
    
    elif action == "play_defense":
        card_ids = data.get("card_ids", [])
        success = game_manager.play_defense(game_id, player_id, card_ids)
        
        if success:
            # Calcular resultado de la ronda
            result = game_manager.resolve_round(game_id)
            game = game_manager.get_game(game_id)
            
            await manager.broadcast_to_room(room_id, {
                "type": "round_result",
                "result": result,
                "game": game.model_dump()
            })
    
    elif action == "continue_round":
        success = game_manager.continue_to_next_round(game_id, player_id)
        
        if success:
            game = game_manager.get_game(game_id)
            await manager.broadcast_to_room(room_id, {
                "type": "next_round",
                "game": game.model_dump()
            })
        else:
            # Un jugador votó, esperar al otro
            game = game_manager.get_game(game_id)
            await manager.broadcast_to_room(room_id, {
                "type": "continue_vote",
                "game": game.model_dump()
            })
    
    elif action == "get_game_state":
        game = game_manager.get_game(game_id)
        await manager.send_personal_message({
            "type": "game_state",
            "game": game.model_dump()
        }, player_id)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "active_games": len(game_manager.games)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)