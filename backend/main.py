from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
import json
import uuid

from game_manager import game_manager
from models import PlayCardsRequest, InstantCardRequest

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
        self.player_to_game: Dict[str, str] = {}
        self.waiting_player: Dict[str, dict] = {}
    
    async def connect(self, player_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[player_id] = websocket
    
    def disconnect(self, player_id: str):
        if player_id in self.active_connections:
            del self.active_connections[player_id]
        if player_id in self.player_to_game:
            game_id = self.player_to_game[player_id]
            del self.player_to_game[player_id]
            game_manager.delete_game(game_id)
    
    async def send_personal_message(self, message: dict, player_id: str):
        if player_id in self.active_connections:
            await self.active_connections[player_id].send_json(message)
    
    async def broadcast_to_game(self, game_id: str, message: dict):
        players = [pid for pid, gid in self.player_to_game.items() if gid == game_id]
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
        
        # Intentar emparejar con jugador en espera
        if manager.waiting_player:
            # Hay alguien esperando
            other_id, other_data = list(manager.waiting_player.items())[0]
            del manager.waiting_player[other_id]
            
            # Crear partida
            game = game_manager.create_game(
                other_id, other_data["name"],
                player_id, player_name
            )
            
            manager.player_to_game[other_id] = game.game_id
            manager.player_to_game[player_id] = game.game_id
            
            # Notificar a ambos jugadores
            await manager.broadcast_to_game(game.game_id, {
                "type": "game_start",
                "game": game.model_dump()
            })
        else:
            # Poner en espera
            manager.waiting_player[player_id] = {"name": player_name}
            await manager.send_personal_message({
                "type": "waiting",
                "message": "Esperando oponente..."
            }, player_id)
        
        # Escuchar mensajes
        while True:
            data = await websocket.receive_json()
            await handle_game_action(player_id, data)
            
    except WebSocketDisconnect:
        manager.disconnect(player_id)
        # Notificar al otro jugador si estaba en partida
        if player_id in manager.player_to_game:
            game_id = manager.player_to_game[player_id]
            await manager.broadcast_to_game(game_id, {
                "type": "player_disconnected",
                "message": "El oponente se desconectó"
            })

async def handle_game_action(player_id: str, data: dict):
    """Maneja acciones del juego"""
    action = data.get("action")
    game_id = manager.player_to_game.get(player_id)
    
    if not game_id:
        return
    
    game = game_manager.get_game(game_id)
    if not game:
        return
    
    if action == "play_attack":
        card_ids = data.get("card_ids", [])
        success = game_manager.play_attack(game_id, player_id, card_ids)
        
        if success:
            await manager.broadcast_to_game(game_id, {
                "type": "attack_played",
                "game": game.model_dump()
            })
    
    elif action == "play_defense":
        card_ids = data.get("card_ids", [])
        success = game_manager.play_defense(game_id, player_id, card_ids)
        
        if success:
            # Resolver ronda automáticamente
            result = game_manager.resolve_round(game_id)
            game = game_manager.get_game(game_id)
            
            await manager.broadcast_to_game(game_id, {
                "type": "round_resolved",
                "result": result,
                "game": game.model_dump()
            })
    
    elif action == "play_instant":
        card_id = data.get("card_id")
        # TODO: Implementar lógica de instantáneas
        pass
    
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