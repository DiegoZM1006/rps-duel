import { useState } from 'react';
import HelpModal from './HelpModal';

function Lobby({ onJoinRoom, onCreateRoom, room, error, playerId }) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const handleCreateRoom = () => {
    if (playerName.trim()) {
      onCreateRoom(playerName.trim());
    }
  };

  const handleJoinRoom = () => {
    if (playerName.trim() && roomCode.trim()) {
      onJoinRoom(playerName.trim(), roomCode.trim());
    }
  };

  if (room) {
    return (
      <div className="min-h-screen bg-game-bg flex items-center justify-center text-white p-4">
        <div className="bg-game-card p-8 rounded-lg shadow-2xl text-center max-w-md w-full border-2 border-game-accent">
          <h1 className="text-3xl font-bold text-game-highlight mb-4">Sala de Espera</h1>
          <p className="text-gray-300 mb-6">Comparte este código con tu oponente:</p>
          <div className="bg-game-bg border-2 border-dashed border-game-highlight p-4 rounded-lg mb-6">
            <p className="text-4xl font-mono tracking-widest">{room.room_id}</p>
          </div>
          <h2 className="text-xl font-bold mb-4">Jugadores Conectados:</h2>
          <ul className="space-y-2 mb-6">
            {room.players.map(p => (
              <li key={p.id} className="bg-game-accent p-3 rounded-lg">
                {p.name} {p.id === playerId ? '(Tú)' : ''}
              </li>
            ))}
          </ul>
          {room.players.length < 2 && (
            <div className="animate-pulse text-yellow-400">
              Esperando al oponente...
            </div>
          )}
          <div className="mt-6">
            <button
              onClick={() => setShowHelp(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              <span>📚</span>
              <span>Cómo Jugar</span>
            </button>
          </div>
        </div>
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-game-card p-8 rounded-xl shadow-2xl max-w-md w-full border-2 border-game-accent">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            ⚔️🏹🗡️
          </h1>
          <h2 className="text-3xl font-bold text-game-highlight mb-2">
            RPS Duel
          </h2>
          <p className="text-gray-400 text-sm">
            Combate Táctico
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Tu nombre
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Ingresa tu nombre..."
              className="w-full px-4 py-3 bg-game-bg text-white rounded-lg border-2 border-game-accent focus:border-game-highlight outline-none transition"
              maxLength={20}
              autoFocus
            />
          </div>
        </div>

        <button
          onClick={handleCreateRoom}
          disabled={!playerName.trim()}
          className="w-full bg-game-highlight hover:bg-red-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          Crear Sala
        </button>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-t border-game-accent" />
          <span className="px-4 text-gray-400">O</span>
          <hr className="flex-grow border-t border-game-accent" />
        </div>

        <div className="mb-4">
          <label htmlFor="roomCode" className="block text-sm font-bold mb-2 text-gray-300">
            Código de la Sala
          </label>
          <input
            id="roomCode"
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="ABCDEF"
            className="w-full bg-game-bg border-2 border-game-accent rounded-lg p-3 focus:outline-none focus:border-game-highlight uppercase"
          />
        </div>

        <button
            onClick={handleJoinRoom}
            disabled={!playerName.trim() || !roomCode.trim()}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Unirse a Sala
        </button>

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}

        <div className="mt-6">
          <button
            onClick={() => setShowHelp(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <span>📚</span>
            <span>Cómo Jugar</span>
          </button>
        </div>

        <div className="mt-6 p-4 bg-game-accent rounded-lg">
          <h3 className="text-white font-bold mb-2 text-sm">⚡ Resumen Rápido:</h3>
          <ul className="text-gray-300 text-xs space-y-1">
            <li>• Primer jugador en llegar a 5 puntos gana</li>
            <li>• Atacante juega 2 cartas (Guerreros, Arqueros, Asesinos)</li>
            <li>• Defensor debe igualar tipos para defender</li>
            <li>• Roles se intercambian cada ronda</li>
            <li>• Cada partida tiene un evento especial único</li>
            <li>• Cartas instantáneas pueden cambiar el resultado</li>
          </ul>
        </div>
      </div>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}

export default Lobby;