import { useState } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';

function App() {
  const [playerName, setPlayerName] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  
  const {
    isConnected,
    gameState,
    playerId,
    status,
    error,
    playAttack,
    playDefense,
    playInstant
  } = useWebSocket(hasJoined ? playerName : null);

  const handleJoin = (name) => {
    setPlayerName(name);
    setHasJoined(true);
  };

  if (!hasJoined) {
    return <Lobby onJoin={handleJoin} />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-900 text-white p-8 rounded-lg shadow-2xl max-w-md">
          <h2 className="text-2xl font-bold mb-4">❌ Error</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-700 hover:bg-red-600 px-6 py-2 rounded-lg transition"
          >
            Reiniciar
          </button>
        </div>
      </div>
    );
  }

  if (status === 'connecting') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-game-highlight mx-auto mb-4"></div>
          <p className="text-xl">Conectando...</p>
        </div>
      </div>
    );
  }

  if (status === 'waiting') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-game-card p-12 rounded-lg shadow-2xl text-center max-w-md">
          <div className="animate-pulse mb-6">
            <div className="text-6xl mb-4">⏳</div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Esperando oponente...
          </h2>
          <p className="text-gray-400">
            Otro jugador debe unirse desde la misma red
          </p>
          <div className="mt-6 text-sm text-gray-500">
            Tu nombre: <span className="text-game-highlight font-bold">{playerName}</span>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'playing' || status === 'finished') {
    return (
      <GameBoard
        gameState={gameState}
        playerId={playerId}
        playerName={playerName}
        onPlayAttack={playAttack}
        onPlayDefense={playDefense}
        onPlayInstant={playInstant}
        isFinished={status === 'finished'}
      />
    );
  }

  return null;
}

export default App;