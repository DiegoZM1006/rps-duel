from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class CardType(str, Enum):
    WARRIOR = "warrior"      # Antes ROCK
    ARCHER = "archer"        # Antes PAPER
    ASSASSIN = "assassin"    # Antes SCISSORS
    JOKER_ATTACK = "joker_attack"
    JOKER_DEFENSE = "joker_defense"

# Jokers filtrados por rol: Joker de ataque solo para atacantes, Joker de defensa solo para defensores
class EventType(str, Enum):
    TRIO_SHOCK = "trio_shock"
    INVERTED_CIRCLE = "inverted_circle"  # Guerrero > Asesino > Arquero > Guerrero
    EARLY_REVEAL = "early_reveal"
    DEFENSE_WALL = "defense_wall"
    ATTACK_PRESSURE = "attack_pressure"
    RECYCLE = "recycle"

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
    phase: str = "waiting"  # waiting, attacking, defending, showing_result, finished
    winner: Optional[str] = None
    revealed_card: Optional[Card] = None
    deck_count: dict = {}  # Contador de cartas por tipo en el mazo
    round_result: Optional[dict] = None  # Resultado de la ronda actual
    continue_votes: List[str] = []  # Jugadores que votaron para continuar

class Room(BaseModel):
    room_id: str
    players: List[Player] = []
    game_id: Optional[str] = None

class PlayCardsRequest(BaseModel):
    player_id: str
    cards: List[str]  # IDs de las cartas