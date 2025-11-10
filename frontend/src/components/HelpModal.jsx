  // RulesTab and other tabs are below (kept concise and reordered for clarity)
  function RulesTab() {
    return (
      <div className="space-y-4">
        <div className="bg-game-accent p-4 rounded-lg">
          <h3 className="text-white font-bold text-lg mb-2">📋 Reglas (resumidas)</h3>
          <p className="text-gray-300 text-sm">Aquí tienes las reglas organizadas en pasos claros y fáciles de seguir.</p>
        </div>

        <div className="bg-game-bg border-2 border-game-accent p-4 rounded-lg">
          <h4 className="text-game-highlight font-bold mb-2">Objetivo</h4>
          <p className="text-gray-300 text-sm">Ser el primero en alcanzar <span className="text-game-highlight font-bold">5 puntos</span>.</p>
        </div>

        <div className="bg-game-bg border-2 border-game-accent p-4 rounded-lg">
          <h4 className="text-game-highlight font-bold mb-2">Turnos y fases (orden)</h4>
          <ol className="text-gray-300 text-sm list-decimal list-inside space-y-1">
            <li><strong>Preparación:</strong> ambos jugadores tienen 4 cartas al inicio de la ronda.</li>
            <li><strong>Ataque:</strong> el atacante selecciona 2 cartas (3 si el evento es Trío de Choque).</li>
            <li><strong>Defensa:</strong> el defensor selecciona cartas para igualar o ganar según el evento.</li>
            <li><strong>Instantáneas (opcional):</strong> si hay cartas instantáneas disponibles, los jugadores pueden jugar una cada uno o votar para omitir.</li>
            <li><strong>Resolución:</strong> se calculan puntos y se preparan cartas para la siguiente ronda.</li>
          </ol>
        </div>

        <div className="bg-game-bg border-2 border-game-accent p-4 rounded-lg">
          <h4 className="text-game-highlight font-bold mb-2">Sistema de puntos (rápido)</h4>
          <div className="space-y-2 text-gray-300 text-sm">
            <p>• Juego normal (2 cartas):</p>
            <ul className="list-inside list-disc ml-4 text-gray-300 text-sm">
              <li>2 cartas defendidas = 0 puntos para atacante</li>
              <li>1 carta defendida = 1 punto para atacante</li>
              <li>0 cartas defendidas = 2 puntos para atacante</li>
            </ul>
            <p>• Trío de Choque (3 cartas): puntos escalados (3,2,1,0) según defensas.</p>
            <p className="text-xs text-gray-400 mt-2">* Algunos eventos modifican estos valores.</p>
          </div>
        </div>

        <div className="bg-game-bg border-2 border-game-accent p-4 rounded-lg">
          <h4 className="text-game-highlight font-bold mb-2">Mecánica de roles</h4>
          <div className="text-gray-300 text-sm space-y-1">
            <p>• Roles (Atacante/Defensor) se eligen aleatoriamente al inicio y se intercambian cada ronda.</p>
            <p>• Jokers e instantáneas tienen restricciones por rol: lee la pestaña Cartas para detalles.</p>
          </div>
        </div>

        <div className="bg-game-bg border-2 border-game-accent p-4 rounded-lg">
          <h4 className="text-game-highlight font-bold mb-2">Flujo recomendado para nuevos jugadores</h4>
          <ul className="text-gray-300 text-sm list-disc list-inside space-y-1">
            <li>Lee Inicio Rápido para el flujo mínimo.</li>
            <li>Revisa la pestaña Cartas para conocer las restricciones por rol.</li>
            <li>Consulta Eventos para anticipar cambios por partida.</li>
          </ul>
        </div>
      </div>
    );
  }

  function CardsTab() {
    const cards = [
      { icon: '⚔️', name: 'Guerrero', type: 'Básica', description: 'Unidad cuerpo a cuerpo resistente.', quantity: '12 en el mazo' },
      { icon: '🏹', name: 'Arquero', type: 'Básica', description: 'Unidad de rango con precisión.', quantity: '12 en el mazo' },
      { icon: '🗡️', name: 'Asesino', type: 'Básica', description: 'Unidad ágil y letal.', quantity: '12 en el mazo' },
      { icon: '👹', name: 'Joker de Ataque', type: 'Especial', description: 'Solo para ATACANTES. Muy poderoso.', quantity: '2 en el mazo', highlight: true },
      { icon: '🛡️', name: 'Joker de Defensa', type: 'Especial', description: 'Solo para DEFENSORES. Defiende todo.', quantity: '2 en el mazo', highlight: true },
      { icon: '⚡', name: 'Cambio Relámpago', type: 'Instantánea', description: 'Atacante puede cambiar carta jugada.', quantity: '2 en el mazo' },
      { icon: '🔄', name: 'Reasignar', type: 'Instantánea', description: 'Defensor intercambia orden de defensa.', quantity: '2 en el mazo' },
      { icon: '🚫', name: 'Anular', type: 'Instantánea', description: 'Cancela la última instantánea.', quantity: '2 en el mazo' },
      { icon: '🎴', name: 'Robo+1', type: 'Instantánea', description: 'Roba +1 carta del mazo.', quantity: '2 en el mazo' }
    ];

    return (
      <div className="space-y-4">
        <div className="bg-game-accent p-4 rounded-lg">
          <h3 className="text-white font-bold text-lg mb-2">🎴 Tipos de Cartas</h3>
          <p className="text-gray-300 text-sm">El mazo contiene 40 cartas. Observa el contador en las cartas para ver cuántas quedan de cada tipo.</p>
        </div>

        {cards.map((card, index) => (
          <div key={index} className={`p-4 rounded-lg border-2 ${card.highlight ? 'bg-game-accent border-game-highlight' : 'bg-game-bg border-game-accent'}`}>
            <div className="flex items-start gap-4">
              <div className="text-4xl">{card.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-white font-bold text-lg">{card.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${card.type === 'Especial' ? 'bg-purple-600 text-white' : card.type === 'Instantánea' ? 'bg-yellow-600 text-white' : 'bg-blue-600 text-white'}`}>{card.type}</span>
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
      { icon: '⚡', name: 'Trío de Choque', description: 'Se juegan 3 cartas en lugar de 2.', scoring: ['3 cartas defendidas = 0 puntos', '2 cartas defendidas = 1 punto', '1 carta defendida = 2 puntos', '0 cartas defendidas = 3 puntos'] },
      { icon: '🔄', name: 'Círculo Invertido', description: 'La defensa debe GANAR al ataque (no solo igualar).', mechanics: ['Arquero vence a Guerrero', 'Asesino vence a Arquero', 'Guerrero vence a Asesino'] },
      { icon: '👁️', name: 'Revelación Temprana', description: 'El atacante revela su primera carta; el defensor roba +1.' },
      { icon: '🛡️', name: 'Muro de Defensa', description: 'Si el defensor defiende todas las cartas, gana +1 punto.' },
      { icon: '💥', name: 'Presión del Ataque', description: 'Si el defensor no defiende ninguna, el atacante recibe puntos extra.' },
      { icon: '♻️', name: 'Reciclaje', description: 'Las cartas no jugadas se conservan para la siguiente ronda.' }
    ];

    return (
      <div className="space-y-4">
        <div className="bg-game-accent p-4 rounded-lg">
          <h3 className="text-white font-bold text-lg mb-2">⚡ Eventos Especiales</h3>
          <p className="text-gray-300 text-sm">Cada partida tiene un evento que modifica la dinámica: aprende a adaptarte.</p>
        </div>

        {events.map((event, index) => (
          <div key={index} className="bg-game-bg border-2 border-game-accent p-4 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{event.icon}</div>
              <div className="flex-1">
                <h4 className="text-white font-bold text-lg mb-2">{event.name}</h4>
                <p className="text-gray-300 text-sm mb-2">{event.description}</p>
                {event.scoring && (
                  <div className="bg-game-accent p-3 rounded mb-2">
                    <p className="text-white text-xs font-bold mb-1">Sistema de puntos:</p>
                    <ul className="text-gray-300 text-xs space-y-1">{event.scoring.map((s, i) => <li key={i}>• {s}</li>)}</ul>
                  </div>
                )}
                {event.mechanics && (
                  <div className="bg-game-accent p-3 rounded">
                    <p className="text-white text-xs font-bold mb-1">Mecánicas:</p>
                    <ul className="text-gray-300 text-xs space-y-1">{event.mechanics.map((m, i) => <li key={i}>• {m}</li>)}</ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  export default HelpModal;