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
        for _ in range(8):
            deck.append(Card(id=str(uuid.uuid4()), type=CardType.JOKER_ATTACK))
            deck.append(Card(id=str(uuid.uuid4()), type=CardType.JOKER_DEFENSE))
        
        # Cartas Instantáneas
        # 2 de cada tipo
        for _ in range():
            deck.append(Card(id=str(uuid.uuid4()), type=CardType.INSTANT_CHANGE))
            deck.append(Card(id=str(uuid.uuid4()), type=CardType.INSTANT_REASSIGN))
            deck.append(Card(id=str(uuid.uuid4()), type=CardType.INSTANT_CANCEL))
            deck.append(Card(id=str(uuid.uuid4()), type=CardType.INSTANT_DRAW))
        
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
        
        # Verificar si algún jugador tiene cartas instantáneas que puede usar
        has_instant_cards = any(
            any(c.type.startswith("instant_") for c in p.hand)
            for p in game.players
        )
        
        # Si hay cartas instantáneas disponibles, ir a fase de instantáneas
        game.phase = "instant" if has_instant_cards else "resolving"
        game.instant_played = False
        game.last_instant_card = None
        
        return True
    
    def resolve_round(self, game_id: str) -> dict:
        """Resuelve la ronda y calcula puntos"""
        game = self.games.get(game_id)
        if not game or game.phase != "resolving":
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
    
    def vote_skip_instant_phase(self, game_id: str, player_id: str) -> bool:
        """Registra el voto de un jugador para omitir la fase de instantáneas"""
        game = self.games.get(game_id)
        if not game or game.phase != "instant":
            return False

        # Si el jugador ya votó, ignorar
        if player_id in game.skip_votes:
            return False

        # Añadir el voto
        game.skip_votes.append(player_id)

        # Si todos los jugadores votaron, pasar a fase de resolución
        if len(game.skip_votes) >= len(game.players):
            game.phase = "resolving"
            game.skip_votes = []  # Limpiar votos para la próxima ronda
            return True

        return True  # Voto registrado exitosamente

    def can_play_instant(self, game_id: str, player_id: str, card_id: str) -> bool:
        """Verifica si un jugador puede jugar una carta instantánea"""
        game = self.games.get(game_id)
        if not game or game.phase not in ["defending", "instant"]:
            return False
            
        player = next((p for p in game.players if p.id == player_id), None)
        if not player:
            return False
            
        card = next((c for c in player.hand if c.id == card_id), None)
        if not card or not card.type.startswith("instant_"):
            return False
            
        # Verificar roles específicos
        if card.type == CardType.INSTANT_CHANGE and not player.is_attacker:
            return False
        if card.type == CardType.INSTANT_REASSIGN and player.is_attacker:
            return False
            
        # INSTANT_CANCEL solo se puede jugar si hay una carta instantánea previa
        if card.type == CardType.INSTANT_CANCEL and not game.last_instant_card:
            return False
            
        return True

    def play_instant(self, game_id: str, player_id: str, card_id: str, target_card_id: Optional[str] = None) -> bool:
        """Juega una carta instantánea"""
        if not self.can_play_instant(game_id, player_id, card_id):
            return False
            
        game = self.games.get(game_id)
        player = next(p for p in game.players if p.id == player_id)
        card = next(c for c in player.hand if c.id == card_id)
        
        # Procesar efectos según el tipo de carta
        if card.type == CardType.INSTANT_CHANGE:
            if not target_card_id or not game.attacker_cards:
                return False
            # Cambiar una carta de ataque por una de la mano
            new_card = next((c for c in player.hand if c.id == target_card_id), None)
            if not new_card:
                return False
            old_card = next((c for c in game.attacker_cards), None)
            if not old_card:
                return False
            game.attacker_cards.remove(old_card)
            game.attacker_cards.append(new_card)
            player.hand.remove(new_card)
            player.hand.append(old_card)
            
        elif card.type == CardType.INSTANT_REASSIGN and game.defender_cards:
            # Reasignar defensas (intercambiar posiciones)
            if len(game.defender_cards) >= 2:
                game.defender_cards[0], game.defender_cards[1] = game.defender_cards[1], game.defender_cards[0]
                
        elif card.type == CardType.INSTANT_CANCEL:
            if game.last_instant_card:
                # Revertir el efecto de la última carta instantánea
                self._revert_instant_effect(game)
                
        elif card.type == CardType.INSTANT_DRAW:
            # Robar una carta nueva
            deck = self._game_decks.get(game_id, [])
            if deck:
                new_cards = self.draw_cards_for_player(deck, 1, player.is_attacker)
                if new_cards:
                    player.hand.append(new_cards[0])
                    # Actualizar contador del mazo
                    game.deck_count = self.count_deck_cards(deck)
        
        # Remover la carta instantánea jugada de la mano
        player.hand = [c for c in player.hand if c.id != card_id]
        game.last_instant_card = card
        game.instant_played = True
        
        # Verificar si aún hay cartas instantáneas que se pueden jugar
        can_play_more_instants = any(
            self.can_play_instant(game_id, p.id, c.id)
            for p in game.players
            for c in p.hand
        )
        
        # Si no se pueden jugar más instantáneas, pasar a resolving
        game.phase = "instant" if can_play_more_instants else "resolving"
        
        return True

    def _revert_instant_effect(self, game: GameState):
        """Revierte el efecto de la última carta instantánea jugada"""
        if not game.last_instant_card:
            return
            
        if game.last_instant_card.type == CardType.INSTANT_CHANGE:
            # Revertir el cambio de cartas
            if game.attacker_cards:
                attacker = next(p for p in game.players if p.is_attacker)
                changed_card = game.attacker_cards[-1]
                original_card = attacker.hand[-1]
                game.attacker_cards[-1] = original_card
                attacker.hand[-1] = changed_card
                
        elif game.last_instant_card.type == CardType.INSTANT_REASSIGN:
            # Revertir el reordenamiento de defensas
            if len(game.defender_cards) >= 2:
                game.defender_cards[0], game.defender_cards[1] = game.defender_cards[1], game.defender_cards[0]
                
        elif game.last_instant_card.type == CardType.INSTANT_DRAW:
            # Remover la última carta robada
            affected_player = next(p for p in game.players if len(p.hand) > 0)
            affected_player.hand.pop()

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
        game.revealed_card = None  # Resetear carta revelada
        game.skip_votes = []  # Resetear votos para omitir fase
        game.instant_played = False  # Resetear estado de instantánea
        game.last_instant_card = None  # Resetear última carta instantánea
        game.current_round += 1
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