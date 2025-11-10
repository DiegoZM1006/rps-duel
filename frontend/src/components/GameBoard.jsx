import { useState, useEffect } from 'react';
import Card from './Card';
import EventCard from './EventCard';
import ScoreBoard from './ScoreBoard';

function GameBoard({ gameState, playerId, playerName, onPlayAttack, onPlayDefense, onContinueRound, isFinished }) {
  const [selectedCards, setSelectedCards] = useState([]);
  
  if (!gameState) return null;

  const currentPlayer = gameState.players.find(p => p.id === playerId);
  const opponent = gameState.players.find(p => p.id !== playerId);
  
  const isMyTurn = (gameState.phase === 'attacking' && currentPlayer.is_attacker) ||
                   (gameState.phase === 'defending' && !currentPlayer.is_attacker);
  
  const requiredCards = gameState.event === 'trio_shock' ? 3 : 2;

  const handleCardClick = (card) => {
    if (!isMyTurn || isFinished) return;

    if (selectedCards.find(c => c.id === card.id)) {
      setSelectedCards(selectedCards.filter(c => c.id !== card.id));
    } else if (selectedCards.length < requiredCards) {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const handlePlayCards = () => {
    if (selectedCards.length !== requiredCards) return;

    const cardIds = selectedCards.map(c => c.id);
    
    if (currentPlayer.is_attacker && gameState.phase === 'attacking') {
      onPlayAttack(cardIds);
    } else if (!currentPlayer.is_attacker && gameState.phase === 'defending') {
      onPlayDefense(cardIds);
    }
    
    setSelectedCards([]);
  };

  const getPhaseMessage = () => {
    if (isFinished) {
      const winner = gameState.players.find(p => p.id === gameState.winner);
      return winner.id === playerId ? '🎉 ¡GANASTE!' : '😢 Perdiste';
    }

    if (gameState.phase === 'attacking') {
      return currentPlayer.is_attacker ? '⚔️ Tu turno: ATACA' : '⏳ Esperando ataque...';
    }
    
    if (gameState.phase === 'defending') {
      if (gameState.event === 'early_reveal' && !currentPlayer.is_attacker) {
        return '👁️ Carta revelada! (+1 carta) - DEFIENDE';
      }
      return !currentPlayer.is_attacker ? '🛡️ Tu turno: DEFIENDE' : '⏳ Esperando defensa...';
    }
    
    if (gameState.phase === 'showing_result') {
      return '📊 Resultado de la Ronda';
    }

    return 'Preparando...';
  };

  const getRoundResultMessage = () => {
    if (!gameState.round_result) return '';
    
    const result = gameState.round_result;
    const wasAttacker = result.attacker_id === playerId;
    
    if (wasAttacker) {
      if (result.points === 0) {
        return '🛡️ El defensor bloqueó todas tus cartas';
      } else if (result.points === 1) {
        return '⚔️ Lograste pasar 1 carta (+1 punto)';
      } else if (result.points === 2) {
        return '💥 ¡Ataque exitoso! (+2 puntos)';
      } else if (result.points >= 3) {
        return '🔥 ¡ATAQUE DEVASTADOR! (+' + result.points + ' puntos)';
      }
    } else {
      if (result.matches === requiredCards) {
        return '�️ ¡Defensa perfecta! Bloqueaste todas las cartas';
      } else if (result.matches > 0) {
        return '⚠️ Bloqueaste ' + result.matches + ' carta(s), pasaron ' + (requiredCards - result.matches);
      } else {
        return '💔 No lograste defender ninguna carta';
      }
    }
    
    return '';
  };

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center bg-game-card p-4 rounded-lg shadow-lg">
          <div className="text-white">
            <h1 className="text-2xl font-bold">RPS Duel</h1>
            <p className="text-sm text-gray-400">Ronda {gameState.current_round + 1}</p>
          </div>
          
          <EventCard event={gameState.event} />
          
          <div className="text-right">
            <p className="text-white font-bold">{playerName}</p>
            <p className={`text-sm font-bold ${currentPlayer.is_attacker ? 'text-red-400' : 'text-blue-400'}`}>
              {currentPlayer.is_attacker ? '⚔️ ATACANTE' : '🛡️ DEFENSOR'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Opponent Section */}
          <div className="bg-game-card p-6 rounded-lg shadow-lg">
            <h2 className="text-white font-bold mb-4 text-center">
              👤 {opponent.name}
            </h2>
            <p className={`text-center text-sm font-bold mb-2 ${opponent.is_attacker ? 'text-red-400' : 'text-blue-400'}`}>
              {opponent.is_attacker ? '⚔️ ATACANTE' : '🛡️ DEFENSOR'}
            </p>
            <ScoreBoard score={opponent.score} maxScore={5} />
            
            <div className="mt-4">
              <p className="text-gray-400 text-sm text-center mb-2">
                Cartas en mano: {opponent.hand.length}
              </p>
              <div className="flex justify-center gap-1">
                {opponent.hand.map((_, idx) => (
                  <div key={idx} className="w-10 h-14 bg-game-accent rounded"></div>
                ))}
              </div>
            </div>

            {/* Cartas jugadas por oponente */}
            {gameState.phase !== 'attacking' && (
              <div className="mt-6">
                <p className="text-white text-sm mb-2 text-center">
                  {opponent.is_attacker ? 'Atacando con:' : 'Defendiendo con:'}
                </p>
                <div className="flex justify-center gap-2">
                  {opponent.is_attacker ? (
                    gameState.event === 'early_reveal' && gameState.revealed_card && gameState.phase === 'defending' ? (
                      <>
                        <Card key={gameState.revealed_card.id} card={gameState.revealed_card} size="small" isDisabled={true} deckCount={gameState.deck_count} />
                        <div className="w-16 h-20 bg-game-accent rounded flex items-center justify-center text-white text-xs">
                          ?
                        </div>
                      </>
                    ) : (
                      gameState.attacker_cards.map(card => (
                        <Card key={card.id} card={card} size="small" isDisabled={true} deckCount={gameState.deck_count} />
                      ))
                    )
                  ) : (
                    gameState.defender_cards.map(card => (
                      <Card key={card.id} card={card} size="small" isDisabled={true} deckCount={gameState.deck_count} />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Center Battle Area */}
          <div className="bg-game-card p-6 rounded-lg shadow-lg flex flex-col justify-center">
            <div className="text-center mb-6">
              <h2 className={`text-3xl font-bold ${isFinished ? 'text-game-highlight' : 'text-white'}`}>
                {getPhaseMessage()}
              </h2>
            </div>

            {/* Resultado de la Ronda */}
            {gameState.phase === 'showing_result' && gameState.round_result && (
              <div className="space-y-6">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-white text-xl font-bold text-center mb-4">Resultado</h3>
                  
                  {/* Cartas jugadas */}
                  <div className="flex justify-center items-center gap-8 mb-4">
                    <div className="text-center">
                      <p className="text-red-400 text-sm mb-2 font-bold">⚔️ ATAQUE</p>
                      <p className="text-white text-xs mb-2">{gameState.round_result.attacker_name}</p>
                      <div className="flex gap-2">
                        {gameState.round_result.attacker_cards && gameState.round_result.attacker_cards.map(card => (
                          <Card key={card.id} card={card} size="normal" isDisabled={true} deckCount={gameState.deck_count} />
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-5xl">VS</div>
                    
                    <div className="text-center">
                      <p className="text-blue-400 text-sm mb-2 font-bold">🛡️ DEFENSA</p>
                      <p className="text-white text-xs mb-2">{gameState.round_result.defender_name}</p>
                      <div className="flex gap-2">
                        {gameState.round_result.defender_cards && gameState.round_result.defender_cards.map(card => (
                          <Card key={card.id} card={card} size="normal" isDisabled={true} deckCount={gameState.deck_count} />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Mensaje de resultado */}
                  <div className="text-center mt-4">
                    <p className="text-yellow-400 text-lg font-bold">{getRoundResultMessage()}</p>
                    <p className="text-white text-sm mt-2">
                      {gameState.round_result.attacker_name}: <span className="text-green-400 font-bold">+{gameState.round_result.points} puntos</span>
                    </p>
                  </div>
                  
                  {/* Marcador actualizado */}
                  <div className="flex justify-center gap-8 mt-4 pt-4 border-t border-gray-700">
                    <div className="text-center">
                      <p className="text-gray-400 text-xs">{gameState.round_result.attacker_name}</p>
                      <p className="text-white text-2xl font-bold">{gameState.round_result.attacker_score}</p>
                    </div>
                    <div className="text-white text-2xl">-</div>
                    <div className="text-center">
                      <p className="text-gray-400 text-xs">{gameState.round_result.defender_name}</p>
                      <p className="text-white text-2xl font-bold">{gameState.round_result.defender_score}</p>
                    </div>
                  </div>
                </div>
                
                {/* Botón continuar */}
                {!isFinished && gameState.phase === 'showing_result' && (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        onContinueRound();
                        setSelectedCards([]);
                      }}
                      disabled={gameState.continue_votes && gameState.continue_votes.includes(playerId)}
                      className={`w-full font-bold py-3 px-6 rounded-lg transition ${
                        gameState.continue_votes && gameState.continue_votes.includes(playerId)
                          ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                          : 'bg-game-highlight hover:bg-red-600 text-white'
                      }`}
                    >
                      {gameState.continue_votes && gameState.continue_votes.includes(playerId)
                        ? '✓ Esperando al otro jugador...'
                        : 'Continuar ➡️'}
                    </button>
                    {gameState.continue_votes && gameState.continue_votes.length > 0 && (
                      <p className="text-center text-gray-400 text-sm">
                        {gameState.continue_votes.length}/2 jugadores listos
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Battle Animation Area - Solo mostrar si no es fase de resultado */}
            {gameState.phase !== 'showing_result' && (
              <div className="flex justify-center items-center gap-8 my-8">
                {gameState.phase === 'defending' ? (
                  <>
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-2">Ataque</p>
                      <div className="flex gap-2">
                        {gameState.event === 'early_reveal' && gameState.revealed_card && gameState.phase === 'defending' ? (
                          <>
                            <Card key={gameState.revealed_card.id} card={gameState.revealed_card} size="normal" isDisabled={true} deckCount={gameState.deck_count} />
                            <div className="w-20 h-28 bg-game-accent rounded flex items-center justify-center text-white text-2xl">
                              ?
                            </div>
                          </>
                        ) : (
                          gameState.attacker_cards.map(card => (
                            <Card key={card.id} card={card} size="normal" isDisabled={true} deckCount={gameState.deck_count} />
                          ))
                        )}
                      </div>
                    </div>
                    
                    <div className="text-5xl animate-pulse">⚔️</div>
                    
                    {gameState.defender_cards.length > 0 && (
                      <div className="text-center">
                        <p className="text-gray-400 text-sm mb-2">Defensa</p>
                        <div className="flex gap-2">
                          {gameState.defender_cards.map(card => (
                            <Card key={card.id} card={card} size="normal" isDisabled={true} deckCount={gameState.deck_count} />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-6xl">🎴</div>
                )}
              </div>
            )}

            {isFinished && (
              <button
                onClick={() => window.location.reload()}
                className="bg-game-highlight hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition mx-auto"
              >
                Nueva Partida
              </button>
            )}
          </div>

          {/* Current Player Section */}
          <div className="bg-game-card p-6 rounded-lg shadow-lg">
            <h2 className="text-white font-bold mb-4 text-center">
              🎮 {playerName} (Tú)
            </h2>
            <p className={`text-center text-sm font-bold mb-2 ${currentPlayer.is_attacker ? 'text-red-400' : 'text-blue-400'}`}>
              {currentPlayer.is_attacker ? '⚔️ ATACANTE' : '🛡️ DEFENSOR'}
            </p>
            <ScoreBoard score={currentPlayer.score} maxScore={5} isPlayer={true} />

            {/* Cartas jugadas por el jugador actual */}
            {gameState.phase !== 'attacking' && (
              <div className="mt-4">
                <p className="text-white text-sm mb-2 text-center">
                  {currentPlayer.is_attacker ? 'Tus cartas de ataque:' : 'Tus cartas de defensa:'}
                </p>
                <div className="flex justify-center gap-2">
                  {currentPlayer.is_attacker ? (
                    gameState.event === 'early_reveal' && gameState.revealed_card && gameState.phase === 'defending' ? (
                      <>
                        <Card key={gameState.revealed_card.id} card={gameState.revealed_card} size="small" isDisabled={true} deckCount={gameState.deck_count} />
                        <div className="w-16 h-20 bg-game-accent rounded flex items-center justify-center text-white text-xs">
                          Oculta
                        </div>
                      </>
                    ) : (
                      gameState.attacker_cards.map(card => (
                        <Card key={card.id} card={card} size="small" isDisabled={true} deckCount={gameState.deck_count} />
                      ))
                    )
                  ) : (
                    gameState.defender_cards.map(card => (
                      <Card key={card.id} card={card} size="small" isDisabled={true} deckCount={gameState.deck_count} />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Player Hand */}
            <div className="mt-6">
              <p className="text-white text-sm mb-4 text-center">
                Tu mano {isMyTurn ? `(Selecciona ${requiredCards})` : ''}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {currentPlayer.hand.map(card => (
                  <Card
                    key={card.id}
                    card={card}
                    onClick={() => handleCardClick(card)}
                    isSelected={selectedCards.find(c => c.id === card.id)}
                    isDisabled={!isMyTurn || isFinished}
                    deckCount={gameState.deck_count}
                  />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            {isMyTurn && !isFinished && (
              <div className="mt-6 space-y-2">
                <button
                  onClick={handlePlayCards}
                  disabled={selectedCards.length !== requiredCards}
                  className={`
                    w-full py-3 rounded-lg font-bold text-white transition
                    ${selectedCards.length === requiredCards
                      ? 'bg-game-highlight hover:bg-red-600 cursor-pointer'
                      : 'bg-gray-600 cursor-not-allowed opacity-50'}
                  `}
                >
                  {currentPlayer.is_attacker ? '⚔️ ATACAR' : '🛡️ DEFENDER'}
                  {selectedCards.length > 0 && ` (${selectedCards.length}/${requiredCards})`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameBoard;