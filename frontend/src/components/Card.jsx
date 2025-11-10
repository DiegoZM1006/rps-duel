function Card({ card, onClick, isSelected, isDisabled, size = 'normal', deckCount }) {
  const cardIcons = {
    warrior: '⚔️',
    archer: '🏹',
    assassin: '🗡️',
    joker_attack: '👹',
    joker_defense: '🛡️',
    instant_change: '⚡',
    instant_reassign: '🔄',
    instant_cancel: '🚫',
    instant_draw: '🎴'
  };

  const cardNames = {
    warrior: 'Guerrero',
    archer: 'Arquero',
    assassin: 'Asesino',
    joker_attack: 'J. Ataque',
    joker_defense: 'J. Defensa',
    instant_change: 'Cambio',
    instant_reassign: 'Reasignar',
    instant_cancel: 'Anular',
    instant_draw: 'Robo+1'
  };

  const cardColors = {
    warrior: 'from-red-700 to-red-900',      // Rojo intenso para guerrero
    archer: 'from-green-600 to-green-900',   // Verde para arquero
    assassin: 'from-purple-700 to-purple-900', // Púrpura oscuro para asesino
    joker_attack: 'from-orange-600 to-red-800',
    joker_defense: 'from-cyan-600 to-blue-900',
    instant_change: 'from-yellow-600 to-yellow-800',
    instant_reassign: 'from-indigo-600 to-indigo-800',
    instant_cancel: 'from-pink-600 to-pink-800',
    instant_draw: 'from-emerald-600 to-emerald-800'
  };

  const sizeClasses = {
    small: 'w-16 h-24 text-2xl',
    normal: 'w-24 h-36 text-4xl',
    large: 'w-32 h-48 text-5xl'
  };

  // Obtener el contador de cartas restantes en el mazo
  const remainingCards = deckCount ? deckCount[card.type] || 0 : null;

  return (
    <div
      onClick={!isDisabled ? onClick : undefined}
      className={`
        ${sizeClasses[size]}
        bg-gradient-to-br ${cardColors[card.type]}
        rounded-lg shadow-lg
        flex flex-col items-center justify-center
        cursor-pointer
        card-glow
        relative
        ${isSelected ? 'card-selected' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        transition-all duration-200
      `}
    >
      {/* Contador de cartas en la esquina superior derecha */}
      {remainingCards !== null && (
        <div className="absolute top-1 right-1 bg-black bg-opacity-75 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border border-white">
          {remainingCards}
        </div>
      )}
      
      <div className="text-center">
        <div className="mb-1">{cardIcons[card.type]}</div>
        <div className="text-white text-xs font-bold">
          {cardNames[card.type]}
        </div>
      </div>
    </div>
  );
}

export default Card;