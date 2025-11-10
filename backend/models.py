from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class CardType(str, Enum):
    WARRIOR = "warrior"      # Antes ROCK
    ARCHER = "archer"        # Antes PAPER
    ASSASSIN = "assassin"    # Antes SCISSORS
    JOKER_ATTACK = "joker_attack"
    JOKER_DEFENSE = "joker_defense"
    INSTANT_CHANGE = "instant_change"      # Cambio Relámpago (Atacante)
    INSTANT_REASSIGN = "instant_reassign"  # Reasignar (Defensor)
    INSTANT_CANCEL = "instant_cancel"      # Anular (Cualquiera)
    INSTANT_DRAW = "instant_draw"          # Robo+1 (Cualquiera)

# Jokers filtrados por rol: Joker de ataque solo para atacantes, Joker de defensa solo para defensores
# Instantáneas tienen roles específicos y fases de uso
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
    phase: str = "waiting"  # waiting, attacking, defending, instant, resolving, early_reveal
    instant_played: bool = False
    last_instant_card: Optional[Card] = None
    skip_votes: List[str] = []
    winner: Optional[str] = None
    revealed_card: Optional[Card] = None
    deck_count: dict = {}  # Contador de cartas por tipo en el mazo

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