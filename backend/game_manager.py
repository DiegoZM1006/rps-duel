import random
import uuid
from typing import Dict, Optional, List
from models import GameState, Player, Card, CardType, EventType

class GameManager:
    def __init__(self):
        self.games: Dict[str, GameState] = {}
        self.waiting_players: List[str] = []
    
    def create_deck(self) -> List[Card]:
        """Crea el mazo base de 40 cartas"""
        deck = []
        
        # 12 de cada tipo base
        for _ in range(12):
            deck.append(Card(id=str(uuid.uuid4()), type=CardType.ROCK))
            deck.append(Card(id=str(uuid.uuid4()), type=CardType.PAPER))
            deck.append(Card(id=str(uuid.uuid4()), type=CardType.SCISSORS))
        
        # 2 Jokers de ataque y defensa
        for _ in range(2):
            deck.append(Card(id=str(uuid.uuid4()), type=CardType.JOKER_ATTACK))
            deck.append(Card(id=str(uuid.uuid4()), type=CardType.JOKER_DEFENSE))
        
        # 2 Instantáneas
        deck.append(Card(id=str(uuid.uuid4()), type=CardType.INSTANT_CHANGE))
        deck.append(Card(id=str(uuid.uuid4()), type=CardType.INSTANT_CANCEL))
        
        random.shuffle(deck)
        return deck
    
    def draw_cards(self, deck: List[Card], count: int) -> List[Card]:
        """Roba cartas del mazo"""
        drawn = deck[:count]
        del deck[:count]
        return drawn
    
    def select_random_event(self) -> EventType:
        """Selecciona un evento aleatorio"""
        events = list(EventType)
        return random.choice(events)
    
    def create_game(self, player1_id: str, player1_name: str, 
                    player2_id: str, player2_name: str) -> GameState:
        """Crea una nueva partida"""
        game_id = str(uuid.uuid4())
        deck = self.create_deck()
        
        # Determinar atacante inicial
        is_p1_attacker = random.choice([True, False])
        
        player1 = Player(
            id=player1_id,
            name=player1_name,
            hand=self.draw_cards(deck, 4),
            is_attacker=is_p1_attacker
        )
        
        player2 = Player(
            id=player2_id,
            name=player2_name,
            hand=self.draw_cards(deck, 4),
            is_attacker=not is_p1_attacker
        )
        
        game = GameState(
            game_id=game_id,
            players=[player1, player2],
            # event=self.select_random_event(),
            event=EventType.EARLY_REVEAL,
            phase="attacking"
        )
        
        self.games[game_id] = game
        # Guardamos el deck en un dict separado para no serializar todo
        self._game_decks = getattr(self, '_game_decks', {})
        self._game_decks[game_id] = deck
        
        return game
    
    def get_game(self, game_id: str) -> Optional[GameState]:
        """Obtiene una partida por ID"""
        return self.games.get(game_id)
    
    def play_attack(self, game_id: str, player_id: str, card_ids: List[str]) -> bool:
        """Jugador atacante juega sus cartas"""
        game = self.games.get(game_id)
        if not game or game.phase != "attacking":
            return False
        
        attacker = next((p for p in game.players if p.id == player_id and p.is_attacker), None)
        if not attacker:
            return False
        
        # Determinar cuántas cartas se requieren según el evento
        required_cards = 3 if game.event == EventType.TRIO_SHOCK else 2
        
        # Verificar que tenga las cartas
        cards = [c for c in attacker.hand if c.id in card_ids]
        if len(cards) != required_cards:
            return False
        
        # Early Reveal: revelar solo la primera carta
        if game.event == EventType.EARLY_REVEAL:
            game.revealed_card = cards[0]  # Solo la primera carta
            game.attacker_cards = cards  # Guardar todas pero no mostrar todavía
            
            # Dar carta extra al defensor
            defender = next(p for p in game.players if not p.is_attacker)
            deck = self._game_decks.get(game_id, [])
            if len(deck) > 0:
                defender.hand.extend(self.draw_cards(deck, 1))
        else:
            game.attacker_cards = cards
        
        # Remover cartas de la mano
        attacker.hand = [c for c in attacker.hand if c.id not in card_ids]
        game.phase = "defending"
        
        return True
    
    def play_defense(self, game_id: str, player_id: str, card_ids: List[str]) -> bool:
        """Jugador defensor juega sus cartas"""
        game = self.games.get(game_id)
        if not game or game.phase != "defending":
            return False
        
        defender = next((p for p in game.players if p.id == player_id and not p.is_attacker), None)
        if not defender:
            return False
        
        # Determinar cuántas cartas se requieren según el evento
        required_cards = 3 if game.event == EventType.TRIO_SHOCK else 2
        
        cards = [c for c in defender.hand if c.id in card_ids]
        if len(cards) != required_cards:
            return False
        
        game.defender_cards = cards
        defender.hand = [c for c in defender.hand if c.id not in card_ids]
        game.phase = "resolving"
        
        return True
    
    def resolve_round(self, game_id: str) -> dict:
        """Resuelve la ronda y calcula puntos"""
        game = self.games.get(game_id)
        if not game or game.phase != "resolving":
            return {"error": "Invalid phase"}
        
        attacker = next(p for p in game.players if p.is_attacker)
        defender = next(p for p in game.players if not p.is_attacker)
        
        # Contar defensas exitosas
        matches = 0
        for atk_card in game.attacker_cards:
            for def_card in game.defender_cards:
                if self._can_defend(atk_card, def_card, game.event):
                    matches += 1
                    break
        
        # Calcular puntos según el número total de cartas jugadas
        total_cards = len(game.attacker_cards)
        points = 0
        
        if total_cards == 3:  # TRIO_SHOCK
            if matches == 0:
                points = 3
            elif matches == 1:
                points = 2
            elif matches == 2:
                points = 1
            # matches == 3 → 0 puntos
        else:  # Juego normal (2 cartas)
            if matches == 0:
                points = 2
            elif matches == 1:
                points = 1
            # matches == 2 → 0 puntos
        
        # Aplicar evento especial
        if game.event == EventType.ATTACK_PRESSURE and matches == 0:
            points = 3 if total_cards == 2 else 4  # Bonus extra en TRIO_SHOCK
        elif game.event == EventType.DEFENSE_WALL and matches == total_cards:
            defender.score += 1
        
        attacker.score += points
        
        # Verificar ganador
        if attacker.score >= 5:
            game.winner = attacker.id
            game.phase = "finished"
        elif defender.score >= 5:
            game.winner = defender.id
            game.phase = "finished"
        else:
            # Preparar siguiente ronda
            self._prepare_next_round(game_id)
        
        return {
            "points": points,
            "matches": matches,
            "attacker_score": attacker.score,
            "defender_score": defender.score,
            "winner": game.winner
        }
    
    def _can_defend(self, attack_card: Card, defense_card: Card, event: Optional[EventType]) -> bool:
        """Verifica si una carta puede defender otra"""
        # Joker de defensa defiende todo
        if defense_card.type == CardType.JOKER_DEFENSE:
            return True
        
        # Joker de ataque solo se defiende con Joker de defensa
        if attack_card.type == CardType.JOKER_ATTACK:
            return False
        
        # Círculo invertido
        if event == EventType.INVERTED_CIRCLE:
            mapping = {
                CardType.ROCK: CardType.SCISSORS,
                CardType.PAPER: CardType.ROCK,
                CardType.SCISSORS: CardType.PAPER
            }
            return defense_card.type == mapping.get(attack_card.type)
        
        # Defensa normal (igualdad)
        return attack_card.type == defense_card.type
    
    def _prepare_next_round(self, game_id: str):
        """Prepara la siguiente ronda"""
        game = self.games[game_id]
        deck = self._game_decks.get(game_id, [])
        
        # Intercambiar roles
        for player in game.players:
            player.is_attacker = not player.is_attacker
        
        # Descartar manos (salvo evento Reciclaje)
        if game.event != EventType.RECYCLE:
            for player in game.players:
                player.hand = []
        
        # Robar nuevas cartas
        for player in game.players:
            needed = 4 - len(player.hand)
            if needed > 0 and len(deck) >= needed:
                player.hand.extend(self.draw_cards(deck, needed))
        
        # Reset cartas jugadas y reveladas
        game.attacker_cards = []
        game.defender_cards = []
        game.revealed_card = None  # Resetear carta revelada
        game.current_round += 1
        game.phase = "attacking"
    
    def delete_game(self, game_id: str):
        """Elimina una partida de memoria"""
        if game_id in self.games:
            del self.games[game_id]
        if hasattr(self, '_game_decks') and game_id in self._game_decks:
            del self._game_decks[game_id]

# Instancia global
game_manager = GameManager()