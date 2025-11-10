from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class CardType(str, Enum):
    ROCK = "rock"
    PAPER = "paper"
    SCISSORS = "scissors"
    JOKER_ATTACK = "joker_attack"
    JOKER_DEFENSE = "joker_defense"
    INSTANT_CHANGE = "instant_change"      # Cambio Relámpago (Atacante)
    INSTANT_REASSIGN = "instant_reassign"  # Reasignar (Defensor)
    INSTANT_CANCEL = "instant_cancel"      # Anular (Cualquiera)
    INSTANT_DRAW = "instant_draw"          # Robo+1 (Cualquiera)

# Jokers filtrados por rol: Joker de ataque solo para atacantes, Joker de defensa solo para defensores
# Instantáneas tienen roles específicos y fases de uso
# TODO: REVISAR TODOS LOS EVENTOS
class EventType(str, Enum):
    TRIO_SHOCK = "trio_shock" # Sirve 
    INVERTED_CIRCLE = "inverted_circle" # Sirve - Piedra, Papel, Tijera clásico
    EARLY_REVEAL = "early_reveal" # Sirve
    DEFENSE_WALL = "defense_wall" # Sirve
    ATTACK_PRESSURE = "attack_pressure" #   Sirve
    RECYCLE = "recycle" # Sirve

class Card(BaseModel):
    id: str
    type: CardType

class Player(BaseModel):
    id: str
    name: str
    hand: List[Card] = []
    score: int = 0
    is_attacker: bool = False

class GameState(BaseModel):
    game_id: str
    players: List[Player]
    event: Optional[EventType] = None
    current_round: int = 0
    attacker_cards: List[Card] = []
    defender_cards: List[Card] = []
    phase: str = "waiting"  # waiting, attacking, defending, instant, resolving, early_reveal
    instant_played: bool = False  # Para controlar si ya se jugó una carta instantánea en esta ronda
    last_instant_card: Optional[Card] = None  # Para guardar la última carta instantánea jugada
    skip_votes: List[str] = []  # Lista de IDs de jugadores que votaron para omitir
    winner: Optional[str] = None
    revealed_card: Optional[Card] = None  # Para EARLY_REVEAL: primera carta mostrada

class Room(BaseModel):
    room_id: str
    players: List[Player] = []
    game_id: Optional[str] = None

class PlayCardsRequest(BaseModel):
    player_id: str
    cards: List[str]  # IDs de las cartas

class InstantCardRequest(BaseModel):
    player_id: str
    card_id: str
    target_card_id: Optional[str] = None