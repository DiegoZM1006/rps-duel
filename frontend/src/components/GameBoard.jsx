import { useState, useEffect } from 'react';
import Card from './Card';
import EventCard from './EventCard';
import ScoreBoard from './ScoreBoard';

function GameBoard({ gameState, playerId, playerName, onPlayAttack, onPlayDefense, onPlayInstant, isFinished }) {
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
      return !currentPlayer.is_attacker ? '🛡️ Tu turno: DEFIENDE' : '⏳ Esperando defensa...';
    }
    
    if (gameState.phase === 'resolving') {
      return '📊 Resolviendo ronda...';
    }

    return 'Preparando...';
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
            <p className="text-sm text-gray-400">
              {currentPlayer.is_attacker ? '⚔️ Atacante' : '🛡️ Defensor'}
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
                  {(opponent.is_attacker ? gameState.attacker_cards : gameState.defender_cards).map(card => (
                    <Card key={card.id} card={card} size="small" isDisabled={true} />
                  ))}
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

            {/* Battle Animation Area */}
            <div className="flex justify-center items-center gap-8 my-8">
              {gameState.phase === 'defending' || gameState.phase === 'resolving' ? (
                <>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-2">Ataque</p>
                    <div className="flex gap-2">
                      {gameState.attacker_cards.map(card => (
                        <Card key={card.id} card={card} size="normal" isDisabled={true} />
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-5xl animate-pulse">⚔️</div>
                  
                  {gameState.defender_cards.length > 0 && (
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-2">Defensa</p>
                      <div className="flex gap-2">
                        {gameState.defender_cards.map(card => (
                          <Card key={card.id} card={card} size="normal" isDisabled={true} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-6xl">🎴</div>
              )}
            </div>

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
            <ScoreBoard score={currentPlayer.score} maxScore={5} isPlayer={true} />

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
                  />
                ))}
              </div>
            </div>

            {/* Action Button */}
            {isMyTurn && !isFinished && (
              <button
                onClick={handlePlayCards}
                disabled={selectedCards.length !== requiredCards}
                className={`
                  w-full mt-6 py-3 rounded-lg font-bold text-white transition
                  ${selectedCards.length === requiredCards
                    ? 'bg-game-highlight hover:bg-red-600 cursor-pointer'
                    : 'bg-gray-600 cursor-not-allowed opacity-50'}
                `}
              >
                {currentPlayer.is_attacker ? '⚔️ ATACAR' : '🛡️ DEFENDER'}
                {selectedCards.length > 0 && ` (${selectedCards.length}/${requiredCards})`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameBoard;