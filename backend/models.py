from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class CardType(str, Enum):
    ROCK = "rock"
    PAPER = "paper"
    SCISSORS = "scissors"
    JOKER_ATTACK = "joker_attack"
    JOKER_DEFENSE = "joker_defense"
    INSTANT_CHANGE = "instant_change"
    INSTANT_CANCEL = "instant_cancel"

# Tambien debuguear que los jokers de defensa no aparezca en ATAQUE y viceversa
# Instanteaneas no sirven
class EventType(str, Enum):
    TRIO_SHOCK = "trio_shock" # Sirve
    INVERTED_CIRCLE = "inverted_circle" # No sirve
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
    phase: str = "waiting"  # waiting, attacking, defending, resolving, early_reveal
    winner: Optional[str] = None
    revealed_card: Optional[Card] = None  # Para EARLY_REVEAL: primera carta mostrada

class PlayCardsRequest(BaseModel):
    player_id: str
    cards: List[str]  # IDs de las cartas

class InstantCardRequest(BaseModel):
    player_id: str
    card_id: str
    target_card_id: Optional[str] = None