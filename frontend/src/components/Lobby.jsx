import { useState } from 'react';
import HelpModal from './HelpModal';

function Lobby({ onJoin }) {
  const [name, setName] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-game-card p-8 rounded-xl shadow-2xl max-w-md w-full border-2 border-game-accent">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            🪨📄✂️
          </h1>
          <h2 className="text-3xl font-bold text-game-highlight mb-2">
            RPS Duel
          </h2>
          <p className="text-gray-400 text-sm">
            Ataque vs Defensa
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Tu nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ingresa tu nombre..."
              className="w-full px-4 py-3 bg-game-bg text-white rounded-lg border-2 border-game-accent focus:border-game-highlight outline-none transition"
              maxLength={20}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-game-highlight hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition transform hover:scale-105 active:scale-95"
          >
            Unirse al Juego
          </button>
        </form>

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
            <li>• Atacante juega 2 cartas</li>
            <li>• Defensor debe igualar tipos para defender</li>
            <li>• Roles se intercambian cada ronda</li>
            <li>• Cada partida tiene un evento especial único</li>
          </ul>
        </div>
      </div>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}

export default Lobby;