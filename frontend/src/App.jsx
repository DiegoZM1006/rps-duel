import { useState } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';

function App() {
  // const [playerName, setPlayerName] = useState('');
  // const [hasJoined, setHasJoined] = useState(false);
  
  const {
    isConnected,
    gameState,
    playerId,
    playerName,
    status,
    error,
    room,
    createRoom,
    joinRoom,
    playAttack,
    playDefense,
    playInstant
  } = useWebSocket();

  const handleCreateRoom = (name) => {
    createRoom(name);
  };

  const handleJoinRoom = (name, code) => {
    joinRoom(name, code);
  };

  if (!gameState && !room) {
    return (
      <Lobby
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        room={room} // Será null inicialmente
        error={error}
        playerId={playerId} // Será null inicialmente
      />
    );
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

  // Si está conectado pero no ha comenzado el juego (ej. en una sala esperando oponente)
  if (room && !gameState) {
    return (
      <Lobby
        onCreateRoom={handleCreateRoom} // Estas no se usarán si room está presente, pero por consistencia
        onJoinRoom={handleJoinRoom}
        room={room} // Pasamos el estado de la sala para mostrarlo
        error={error}
        playerId={playerId}
      />
    );
  }

  // Si el estado es 'connecting' (antes de que se establezca cualquier sala o juego)
  if (status === 'connecting' && !room && !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-game-highlight mx-auto mb-4"></div>
          <p className="text-xl">Conectando...</p>
        </div>
      </div>
    );
  }
  
  // Si existe el estado de juego, mostramos el GameBoard
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

  // Fallback para estados inesperados, quizás mostrar un mensaje de carga genérico o error
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <p>Cargando o estado inesperado...</p>
    </div>
  );
}

export default App;