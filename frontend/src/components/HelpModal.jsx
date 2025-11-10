import { useState } from 'react';

function HelpModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('cards');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-game-card rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-2 border-game-accent">
        <div className="bg-game-accent p-4 flex justify-between items-center border-b-2 border-game-highlight">
          <h2 className="text-2xl font-bold text-white">📚 Guía del Juego</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-game-highlight text-2xl font-bold transition"
          >
            ✕
          </button>
        </div>

        <div className="flex border-b-2 border-game-accent">
          <button
            onClick={() => setActiveTab('cards')}
            className={`flex-1 py-3 px-4 font-bold transition ${
              activeTab === 'cards'
                ? 'bg-game-highlight text-white'
                : 'bg-game-bg text-gray-400 hover:text-white'
            }`}
          >
            🎴 Cartas
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 py-3 px-4 font-bold transition ${
              activeTab === 'events'
                ? 'bg-game-highlight text-white'
                : 'bg-game-bg text-gray-400 hover:text-white'
            }`}
          >
            ⚡ Eventos
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex-1 py-3 px-4 font-bold transition ${
              activeTab === 'rules'
                ? 'bg-game-highlight text-white'
                : 'bg-game-bg text-gray-400 hover:text-white'
            }`}
          >
            📋 Reglas
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {activeTab === 'cards' && <CardsTab />}
          {activeTab === 'events' && <EventsTab />}
          {activeTab === 'rules' && <RulesTab />}
        </div>

        <div className="bg-game-accent p-4 flex justify-end border-t-2 border-game-highlight">
          <button
            onClick={onClose}
            className="bg-game-highlight hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

function CardsTab() {
  const cards = [
    {
      icon: '⚔️',
      name: 'Guerrero',
      type: 'Básica',
      description: 'Unidad cuerpo a cuerpo resistente. En modo normal, defiende contra otro Guerrero igualándolo.',
      quantity: '12 en el mazo'
    },
    {
      icon: '🏹',
      name: 'Arquero',
      type: 'Básica',
      description: 'Unidad de rango medio con alta precisión. En modo normal, defiende contra otro Arquero igualándolo.',
      quantity: '12 en el mazo'
    },
    {
      icon: '🗡️',
      name: 'Asesino',
      type: 'Básica',
      description: 'Unidad ágil y letal. En modo normal, defiende contra otro Asesino igualándolo.',
      quantity: '12 en el mazo'
    },
    {
      icon: '👹',
      name: 'Joker de Ataque',
      type: 'Especial',
      description: 'Solo aparece en manos de ATACANTES. Es muy poderosa: solo puede ser defendida por un Joker de Defensa. Garantiza un punto si el defensor no tiene el Joker de Defensa.',
      quantity: '2 en el mazo',
      highlight: true
    },
    {
      icon: '🛡️',
      name: 'Joker de Defensa',
      type: 'Especial',
      description: 'Solo aparece en manos de DEFENSORES. Es la carta más versátil: defiende contra cualquier carta, incluyendo el Joker de Ataque. Tu mejor aliado para evitar puntos del atacante.',
      quantity: '2 en el mazo',
      highlight: true
    },
    {
      icon: '⚡',
      name: 'Cambio Relámpago',
      type: 'Instantánea',
      description: 'Permite al ATACANTE cambiar una de sus cartas jugadas por otra de su mano durante la fase instantánea.',
      quantity: '2 en el mazo'
    },
    {
      icon: '🔄',
      name: 'Reasignar',
      type: 'Instantánea',
      description: 'Permite al DEFENSOR intercambiar el orden de sus cartas de defensa durante la fase instantánea.',
      quantity: '2 en el mazo'
    },
    {
      icon: '🚫',
      name: 'Anular',
      type: 'Instantánea',
      description: 'Cancela la última carta instantánea jugada por el oponente, revirtiendo su efecto.',
      quantity: '2 en el mazo'
    },
    {
      icon: '🎴',
      name: 'Robo+1',
      type: 'Instantánea',
      description: 'Roba una carta adicional del mazo durante la fase instantánea.',
      quantity: '2 en el mazo'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-game-accent p-4 rounded-lg">
        <h3 className="text-white font-bold text-lg mb-2">🎴 Tipos de Cartas</h3>
        <p className="text-gray-300 text-sm">
          El mazo contiene 40 cartas en total. Cada jugador comienza con 4 cartas en su mano.
        </p>
      </div>

      {cards.map((card, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border-2 ${
            card.highlight
              ? 'bg-game-accent border-game-highlight'
              : 'bg-game-bg border-game-accent'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl">{card.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-white font-bold text-lg">{card.name}</h4>
                <span className={`text-xs px-2 py-1 rounded ${
                  card.type === 'Especial' 
                    ? 'bg-purple-600 text-white'
                    : card.type === 'Instantánea'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-blue-600 text-white'
                }`}>
                  {card.type}
                </span>
              </div>
              <p className="text-gray-300 text-sm mb-2">{card.description}</p>
              <p className="text-gray-400 text-xs italic">{card.quantity}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EventsTab() {
  const events = [
    {
      icon: '⚡',
      name: 'Trío de Choque',
      description: 'Se juegan 3 cartas en lugar de 2. Tanto el atacante como el defensor deben jugar 3 cartas.',
      scoring: [
        '3 cartas defendidas = 0 puntos',
        '2 cartas defendidas = 1 punto',
        '1 carta defendida = 2 puntos',
        '0 cartas defendidas = 3 puntos'
      ],
      active: true
    },
    {
      icon: '🔄',
      name: 'Círculo Invertido',
      description: 'Se activa el sistema de ventajas tácticas. La defensa debe GANAR al ataque (no igualar).',
      mechanics: [
        '🏹 Arquero vence a ⚔️ Guerrero (agilidad vs fuerza)',
        '🗡️ Asesino vence a 🏹 Arquero (sigilo vs rango)',
        '⚔️ Guerrero vence a 🗡️ Asesino (resistencia vs agilidad)'
      ],
      active: true
    },
    {
      icon: '👁️',
      name: 'Revelación Temprana',
      description: 'El atacante revela su primera carta antes de que el defensor juegue. El defensor roba una carta extra (+1).',
      mechanics: [
        'Atacante muestra 1 de sus 2 cartas',
        'Defensor ve la carta revelada',
        'Defensor recibe 1 carta adicional (5 cartas totales)',
        'Defensor juega 2 cartas para defender'
      ],
      active: true
    },
    {
      icon: '🛡️',
      name: 'Muro de Defensa',
      description: 'Si el defensor logra igualar/defender TODAS las cartas del ataque, gana 1 punto bonus adicional.',
      mechanics: [
        'Funciona con el sistema normal de defensa',
        'Defensor debe igualar todas las cartas',
        'Bonus: +1 punto para el defensor'
      ],
      active: true
    },
    {
      icon: '💥',
      name: 'Presión del Ataque',
      description: 'Si el defensor NO logra defender ninguna carta, el atacante recibe puntos extra.',
      mechanics: [
        '2 cartas: +3 puntos (en lugar de +2)',
        '3 cartas (Trío): +4 puntos (en lugar de +3)'
      ],
      active: true
    },
    {
      icon: '♻️',
      name: 'Reciclaje',
      description: 'Las cartas que no se usaron en la ronda se conservan para la siguiente. Solo se rellenan hasta tener 4 cartas.',
      mechanics: [
        'Cartas no jugadas se mantienen',
        'Se roban solo las necesarias para llegar a 4',
        'Útil para conservar cartas estratégicas'
      ],
      active: true
    }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-game-accent p-4 rounded-lg">
        <h3 className="text-white font-bold text-lg mb-2">⚡ Eventos Especiales</h3>
        <p className="text-gray-300 text-sm">
          Cada partida tiene un evento especial que modifica las reglas del juego. ¡Adapta tu estrategia!
        </p>
      </div>

      {events.map((event, index) => (
        <div
          key={index}
          className="bg-game-bg border-2 border-game-accent p-4 rounded-lg"
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl">{event.icon}</div>
            <div className="flex-1">
              <h4 className="text-white font-bold text-lg mb-2">{event.name}</h4>
              <p className="text-gray-300 text-sm mb-3">{event.description}</p>
              
              {event.scoring && (
                <div className="bg-game-accent p-3 rounded mb-2">
                  <p className="text-white text-xs font-bold mb-1">Sistema de puntos:</p>
                  <ul className="text-gray-300 text-xs space-y-1">
                    {event.scoring.map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {event.mechanics && (
                <div className="bg-game-accent p-3 rounded">
                  <p className="text-white text-xs font-bold mb-1">Mecánicas:</p>
                  <ul className="text-gray-300 text-xs space-y-1">
                    {event.mechanics.map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RulesTab() {
  return (
    <div className="space-y-4">
      <div className="bg-game-accent p-4 rounded-lg">
        <h3 className="text-white font-bold text-lg mb-2">📋 Reglas del Juego</h3>
        <p className="text-gray-300 text-sm">
          RPS Duel es un juego de cartas estratégico para 2 jugadores basado en combate táctico.
        </p>
      </div>

      <div className="bg-game-bg border-2 border-game-accent p-4 rounded-lg">
        <h4 className="text-game-highlight font-bold mb-3">🎯 Objetivo</h4>
        <p className="text-gray-300 text-sm">
          Ser el primero en alcanzar <span className="text-game-highlight font-bold">5 puntos</span> para ganar la partida.
        </p>
      </div>

      <div className="bg-game-bg border-2 border-game-accent p-4 rounded-lg">
        <h4 className="text-game-highlight font-bold mb-3">🔄 Mecánica de Roles</h4>
        <div className="space-y-2 text-gray-300 text-sm">
          <p>• Los roles de <span className="text-red-500">Atacante</span> y <span className="text-green-500">Defensor</span> se determinan aleatoriamente al inicio</p>
          <p>• Los roles se <span className="text-game-highlight">intercambian cada ronda</span></p>
          <p>• Cada jugador experimentará ambos roles durante la partida</p>
        </div>
      </div>

      <div className="bg-game-bg border-2 border-game-accent p-4 rounded-lg">
        <h4 className="text-game-highlight font-bold mb-3">⚔️ Fase de Ataque</h4>
        <div className="space-y-2 text-gray-300 text-sm">
          <p>1. El atacante selecciona 2 cartas de su mano (3 si es Trío de Choque)</p>
          <p>2. Las cartas se revelan al defensor</p>
          <p>3. El turno pasa al defensor</p>
        </div>
      </div>

      <div className="bg-game-bg border-2 border-game-accent p-4 rounded-lg">
        <h4 className="text-game-highlight font-bold mb-3">🛡️ Fase de Defensa</h4>
        <div className="space-y-2 text-gray-300 text-sm">
          <p>1. El defensor ve las cartas del atacante</p>
          <p>2. El defensor selecciona 2 cartas para defender (3 si es Trío de Choque)</p>
          <p>3. Opcionalmente, ambos jugadores pueden usar cartas instantáneas</p>
          <p>4. Se resuelve el combate automáticamente</p>
        </div>
      </div>

      <div className="bg-game-bg border-2 border-game-accent p-4 rounded-lg">
        <h4 className="text-game-highlight font-bold mb-3">⚡ Fase de Instantáneas</h4>
        <div className="space-y-2 text-gray-300 text-sm">
          <p>• Después de jugar las cartas, si hay cartas instantáneas disponibles</p>
          <p>• Cualquier jugador puede jugar 1 carta instantánea</p>
          <p>• Ambos jugadores pueden votar para omitir esta fase</p>
          <p>• Las instantáneas pueden cambiar el resultado del combate</p>
        </div>
      </div>

      <div className="bg-game-bg border-2 border-game-accent p-4 rounded-lg">
        <h4 className="text-game-highlight font-bold mb-3">🎲 Sistema de Puntos (Normal)</h4>
        <div className="space-y-2 text-gray-300 text-sm">
          <p>• <span className="text-green-500">2 cartas defendidas</span> = 0 puntos para atacante</p>
          <p>• <span className="text-yellow-500">1 carta defendida</span> = 1 punto para atacante</p>
          <p>• <span className="text-red-500">0 cartas defendidas</span> = 2 puntos para atacante</p>
          <p className="text-xs text-gray-400 mt-2">* Los eventos especiales pueden modificar estos valores</p>
        </div>
      </div>

      <div className="bg-game-bg border-2 border-game-accent p-4 rounded-lg">
        <h4 className="text-game-highlight font-bold mb-3">🎴 Gestión de Cartas</h4>
        <div className="space-y-2 text-gray-300 text-sm">
          <p>• Cada jugador comienza con 4 cartas</p>
          <p>• Las cartas jugadas se descartan (excepto en evento Reciclaje)</p>
          <p>• Se roban cartas nuevas hasta tener 4 al inicio de cada ronda</p>
          <p>• Los Jokers solo aparecen en manos del rol apropiado</p>
        </div>
      </div>

      <div className="bg-game-bg border-2 border-game-accent p-4 rounded-lg">
        <h4 className="text-game-highlight font-bold mb-3">💡 Consejos Estratégicos</h4>
        <div className="space-y-2 text-gray-300 text-sm">
          <p>• Como atacante, usa el Joker de Ataque 👹 estratégicamente</p>
          <p>• Como defensor, conserva el Joker de Defensa 🛡️ para los Jokers de Ataque</p>
          <p>• Adapta tu estrategia según el evento activo</p>
          <p>• En Círculo Invertido, piensa en las ventajas tácticas de cada unidad</p>
          <p>• Las cartas instantáneas pueden cambiar completamente una ronda</p>
        </div>
      </div>
    </div>
  );
}

export default HelpModal;