function Card({ card, onClick, isSelected, isDisabled, size = 'normal' }) {
  const cardIcons = {
    rock: '🪨',
    paper: '📄',
    scissors: '✂️',
    joker_attack: '⚔️',
    joker_defense: '🛡️',
    instant_change: '⚡',
    instant_cancel: '🚫'
  };

  const cardNames = {
    rock: 'Piedra',
    paper: 'Papel',
    scissors: 'Tijera',
    joker_attack: 'J. Ataque',
    joker_defense: 'J. Defensa',
    instant_change: 'Cambio',
    instant_cancel: 'Anular'
  };

  const cardColors = {
    rock: 'from-gray-600 to-gray-800',
    paper: 'from-blue-600 to-blue-800',
    scissors: 'from-red-600 to-red-800',
    joker_attack: 'from-purple-600 to-purple-900',
    joker_defense: 'from-green-600 to-green-900',
    instant_change: 'from-yellow-600 to-yellow-800',
    instant_cancel: 'from-orange-600 to-orange-800'
  };

  const sizeClasses = {
    small: 'w-16 h-24 text-2xl',
    normal: 'w-24 h-36 text-4xl',
    large: 'w-32 h-48 text-5xl'
  };

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
        ${isSelected ? 'card-selected' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        transition-all duration-200
      `}
    >
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