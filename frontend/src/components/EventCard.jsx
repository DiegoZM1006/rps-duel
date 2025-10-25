function EventCard({ event }) {
  const eventData = {
    trio_shock: {
      icon: '⚡',
      name: 'Trío de Choque',
      description: 'Se juegan 3 cartas en lugar de 2'
    },
    inverted_circle: {
      icon: '🔄',
      name: 'Círculo Invertido',
      description: 'Papel defiende Piedra, Tijera defiende Papel, Piedra defiende Tijera'
    },
    early_reveal: {
      icon: '👁️',
      name: 'Revelación Temprana',
      description: 'Atacante muestra 1 carta, Defensor roba +1'
    },
    defense_wall: {
      icon: '🛡️',
      name: 'Muro de Defensa',
      description: 'Si Defensor iguala ambas, gana 1 punto'
    },
    attack_pressure: {
      icon: '💥',
      name: 'Presión del Ataque',
      description: 'Si Defensor no iguala ninguna: +3 puntos'
    },
    recycle: {
      icon: '♻️',
      name: 'Reciclaje',
      description: 'Las cartas no usadas se conservan'
    }
  };

  if (!event) return null;

  const currentEvent = eventData[event];

  return (
    <div className="bg-game-accent p-3 rounded-lg border-2 border-game-highlight max-w-xs">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{currentEvent.icon}</span>
        <h3 className="text-white font-bold text-sm">{currentEvent.name}</h3>
      </div>
      <p className="text-gray-300 text-xs">{currentEvent.description}</p>
    </div>
  );
}

export default EventCard;