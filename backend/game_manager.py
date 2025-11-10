import random
import uuid
from typing import Dict, Optional, List
from models import GameState, Player, Card, CardType, EventType, Room

class GameManager:
    def __init__(self):
        self.games: Dict[str, GameState] = {}
        self.rooms: Dict[str, Room] = {}
    
    def create_deck(self) -> List[Card]:
        """Crea el mazo base de 40 cartas"""
        deck = []
        
        # 12 de cada tipo base
        for _ in range(48):
            deck.append(Card(id=str(uuid.uuid4()), type=CardType.WARRIOR))
            deck.append(Card(id=str(uuid.uuid4()), type=CardType.ARCHER))
            deck.append(Card(id=str(uuid.uuid4()), type=CardType.ASSASSIN))
        
        # 2 Jokers de ataque y defensa
        for _ in range(4):
            deck.append(Card(id=str(uuid.uuid4()), type=CardType.JOKER_ATTACK))
            deck.append(Card(id=str(uuid.uuid4()), type=CardType.JOKER_DEFENSE))
        
        random.shuffle(deck)
        return deck
    
    def draw_cards(self, deck: List[Card], count: int) -> List[Card]:
        """Roba cartas del mazo"""
        drawn = deck[:count]
        del deck[:count]
        return drawn
    
    def filter_cards_by_role(self, cards: List[Card], is_attacker: bool) -> List[Card]:
        """Filtra cartas según el rol del jugador"""
        if is_attacker:
            # Atacante: no puede tener jokers de defensa
            return [c for c in cards if c.type != CardType.JOKER_DEFENSE]
        else:
            # Defensor: no puede tener jokers de ataque
            return [c for c in cards if c.type != CardType.JOKER_ATTACK]
    
    def draw_cards_for_player(self, deck: List[Card], count: int, is_attacker: bool) -> List[Card]:
        """Roba cartas del mazo y filtra según el rol del jugador"""
        drawn = []
        while len(drawn) < count and len(deck) > 0:
            card = deck.pop(0)
            # Filtrar según rol
            if is_attacker and card.type == CardType.JOKER_DEFENSE:
                # Devolver al final del mazo si no es apropiada
                deck.append(card)
                continue
            elif not is_attacker and card.type == CardType.JOKER_ATTACK:
                # Devolver al final del mazo si no es apropiada
                deck.append(card)
                continue
            drawn.append(card)
        return drawn
    
    def select_random_event(self) -> EventType:
        """Selecciona un evento aleatorio"""
        events = list(EventType)
        return random.choice(events)

    def count_deck_cards(self, deck: List[Card]) -> dict:
        """Cuenta cuántas cartas de cada tipo hay en el mazo"""
        count = {}
        for card in deck:
            card_type = card.type.value
            count[card_type] = count.get(card_type, 0) + 1
        return count

    def create_room(self, player_id: str, player_name: str) -> Room:
        """Crea una nueva sala y añade al primer jugador."""
        room_id = str(uuid.uuid4())[:6].upper() # Código de sala corto
        player = Player(id=player_id, name=player_name)
        room = Room(room_id=room_id, players=[player])
        self.rooms[room_id] = room
        return room

    def join_room(self, room_id: str, player_id: str, player_name: str) -> Optional[Room]:
        """Añade un segundo jugador a una sala existente."""
        room = self.rooms.get(room_id)
        if not room or len(room.players) >= 2:
            return None # La sala no existe o ya está llena
        
        player = Player(id=player_id, name=player_name)
        room.players.append(player)
        return room

    def get_room(self, room_id: str) -> Optional[Room]:
        """Obtiene una sala por ID."""
        return self.rooms.get(room_id)

    def start_game_in_room(self, room_id: str) -> Optional[GameState]:
        """Inicia una partida para una sala que ya tiene 2 jugadores."""
        room = self.rooms.get(room_id)
        if not room or len(room.players) != 2:
            return None

        player1_data = room.players[0]
        player2_data = room.players[1]

        """Crea una nueva partida"""
        game_id = str(uuid.uuid4())
        room.game_id = game_id
        deck = self.create_deck()
        
        # Determinar atacante inicial
        is_p1_attacker = random.choice([True, False])
        
        player1 = Player(
            id=player1_data.id,
            name=player1_data.name,
            hand=self.draw_cards_for_player(deck, 4, is_p1_attacker),
            is_attacker=is_p1_attacker
        )
        
        player2 = Player(
            id=player2_data.id,
            name=player2_data.name,
            hand=self.draw_cards_for_player(deck, 4, not is_p1_attacker),
            is_attacker=not is_p1_attacker
        )
        
        game = GameState(
            game_id=game_id,
            players=[player1, player2],
            event=self.select_random_event(),
            # event=EventType.RECYCLE,
            phase="attacking",
            deck_count=self.count_deck_cards(deck)
        )
        
        self.games[game_id] = game
        # Guardamos el deck en un dict separado para no serializar todo
        self._game_decks = getattr(self, '_game_decks', {})
        self._game_decks[game_id] = deck
        
        return game

    def create_game(self, player1_id: str, player1_name: str, 
                    player2_id: str, player2_name: str) -> GameState:
        # Esta función ya no se usará directamente para el matchmaking, pero la dejamos por si acaso.
        pass
    
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
                extra_cards = self.draw_cards_for_player(deck, 1, defender.is_attacker)
                defender.hand.extend(extra_cards)
                # Actualizar contador del mazo
                game.deck_count = self.count_deck_cards(deck)
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
        
        # Cambiar a fase de mostrar resultados
        game.phase = "showing_result"
        
        return True
    
    def resolve_round(self, game_id: str) -> dict:
        """Resuelve la ronda y calcula puntos"""
        game = self.games.get(game_id)
        if not game or game.phase != "showing_result":
            return {"error": "Invalid phase"}
        
        attacker = next(p for p in game.players if p.is_attacker)
        defender = next(p for p in game.players if not p.is_attacker)
        
        # Contar defensas exitosas - cada carta de defensa solo se usa una vez
        matches = 0
        used_defense_indices = set()
        
        for atk_card in game.attacker_cards:
            for def_idx, def_card in enumerate(game.defender_cards):
                # Saltar cartas de defensa ya usadas
                if def_idx in used_defense_indices:
                    continue
                    
                if self._can_defend(atk_card, def_card, game.event):
                    matches += 1
                    used_defense_indices.add(def_idx)  # Marcar como usada
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
        
        # Guardar resultado de la ronda en el estado del juego
        result = {
            "points": points,
            "matches": matches,
            "attacker_id": attacker.id,
            "attacker_name": attacker.name,
            "attacker_score": attacker.score,
            "defender_id": defender.id,
            "defender_name": defender.name,
            "defender_score": defender.score,
            "attacker_cards": [c.model_dump() for c in game.attacker_cards],
            "defender_cards": [c.model_dump() for c in game.defender_cards],
            "winner": game.winner
        }
        
        game.round_result = result
        
        # Verificar ganador
        if attacker.score >= 5:
            game.winner = attacker.id
            game.phase = "finished"
        elif defender.score >= 5:
            game.winner = defender.id
            game.phase = "finished"
        
        return result
    
    def continue_to_next_round(self, game_id: str, player_id: str) -> bool:
        """Registra que un jugador está listo para continuar a la siguiente ronda"""
        game = self.games.get(game_id)
        if not game or game.phase != "showing_result":
            return False
        
        # Añadir voto del jugador si no ha votado
        if player_id not in game.continue_votes:
            game.continue_votes.append(player_id)
        
        # Si ambos jugadores votaron, preparar siguiente ronda
        if len(game.continue_votes) >= 2:
            self._prepare_next_round(game_id)
            return True
        
        return True
    
    def _can_defend(self, attack_card: Card, defense_card: Card, event: Optional[EventType]) -> bool:
        """Verifica si una carta puede defender otra"""
        # Joker de defensa defiende todo
        if defense_card.type == CardType.JOKER_DEFENSE:
            return True
        
        # Joker de ataque solo se defiende con Joker de defensa
        if attack_card.type == CardType.JOKER_ATTACK:
            return False
        
        # Círculo invertido: juego clásico de piedra, papel, tijera
        # La defensa debe GANAR al ataque (no igualar)
        if event == EventType.INVERTED_CIRCLE:
            # Mapeo: qué carta de defensa le gana a cada carta de ataque
            winning_defense = {
                CardType.WARRIOR: CardType.ARCHER,      # ARQUERO le gana a GUERRERO
                CardType.ARCHER: CardType.ASSASSIN,     # ASESINO le gana a ARQUERO
                CardType.ASSASSIN: CardType.WARRIOR     # GUERRERO le gana a ASESINO
            }
            return defense_card.type == winning_defense.get(attack_card.type)
        
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
        
        # Robar nuevas cartas según el rol
        for player in game.players:
            needed = 4 - len(player.hand)
            if needed > 0 and len(deck) >= needed:
                new_cards = self.draw_cards_for_player(deck, needed, player.is_attacker)
                player.hand.extend(new_cards)
        
        # Actualizar contador del mazo después de robar cartas
        game.deck_count = self.count_deck_cards(deck)
        
        # Reset cartas jugadas y reveladas
        game.attacker_cards = []
        game.defender_cards = []
        game.revealed_card = None
        game.round_result = None
        game.continue_votes = []
        game.current_round += 1
        
        # Nuevo evento para la siguiente ronda
        game.event = self.select_random_event()
        
        game.phase = "attacking"
    
    def delete_game(self, game_id: str):
        """Elimina una partida de memoria"""
        if game_id in self.games:
            del self.games[game_id]
        # También eliminamos la sala asociada
        room_to_delete = next((rid for rid, r in self.rooms.items() if r.game_id == game_id), None)
        if room_to_delete and room_to_delete in self.rooms:
            del self.rooms[room_to_delete]
        if hasattr(self, '_game_decks') and game_id in self._game_decks:
            del self._game_decks[game_id]

# Instancia global
game_manager = GameManager()