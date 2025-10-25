// Utilidades para la lógica del juego en el frontend

/**
 * Determina si una carta puede defender a otra según las reglas
 */
export const canDefend = (attackCard, defenseCard, event = null) => {
  // Joker de defensa defiende todo
  if (defenseCard.type === 'joker_defense') {
    return true;
  }

  // Joker de ataque solo se defiende con Joker de defensa
  if (attackCard.type === 'joker_attack') {
    return false;
  }

  // Círculo invertido: las defensas son inversas
  if (event === 'inverted_circle') {
    const invertedDefenses = {
      rock: 'scissors',
      paper: 'rock',
      scissors: 'paper'
    };
    return defenseCard.type === invertedDefenses[attackCard.type];
  }

  // Defensa normal: igualdad de tipos
  return attackCard.type === defenseCard.type;
};

/**
 * Calcula cuántas cartas de ataque fueron defendidas exitosamente
 */
export const calculateDefendedCards = (attackCards, defenseCards, event = null) => {
  let defendedCount = 0;
  const usedDefenseIndices = new Set();

  attackCards.forEach(attackCard => {
    for (let i = 0; i < defenseCards.length; i++) {
      if (usedDefenseIndices.has(i)) continue;
      
      if (canDefend(attackCard, defenseCards[i], event)) {
        defendedCount++;
        usedDefenseIndices.add(i);
        break;
      }
    }
  });

  return defendedCount;
};

/**
 * Calcula los puntos que gana el atacante según defensas exitosas
 */
export const calculateAttackPoints = (defendedCount, totalAttacks, event = null) => {
  const undefended = totalAttacks - defendedCount;

  // Evento Presión del Ataque: +3 si no defiende ninguna
  if (event === 'attack_pressure' && defendedCount === 0) {
    return 3;
  }

  // Reglas normales
  if (defendedCount === totalAttacks) {
    return 0; // Todas defendidas
  } else if (defendedCount === totalAttacks - 1) {
    return 1; // Solo 1 pasó
  } else {
    return 2; // 2 o más pasaron
  }
};

/**
 * Determina si el defensor gana un punto bonus (evento Muro de Defensa)
 */
export const defenderGetsBonus = (defendedCount, totalAttacks, event = null) => {
  return event === 'defense_wall' && defendedCount === totalAttacks;
};

/**
 * Obtiene el nombre legible de un tipo de carta
 */
export const getCardName = (cardType) => {
  const cardNames = {
    rock: 'Piedra',
    paper: 'Papel',
    scissors: 'Tijera',
    joker_attack: 'Joker de Ataque',
    joker_defense: 'Joker de Defensa',
    instant_change: 'Cambio Relámpago',
    instant_cancel: 'Anular'
  };
  return cardNames[cardType] || cardType;
};

/**
 * Obtiene el ícono de un tipo de carta
 */
export const getCardIcon = (cardType) => {
  const cardIcons = {
    rock: '🪨',
    paper: '📄',
    scissors: '✂️',
    joker_attack: '⚔️',
    joker_defense: '🛡️',
    instant_change: '⚡',
    instant_cancel: '🚫'
  };
  return cardIcons[cardType] || '🎴';
};

/**
 * Obtiene información del evento
 */
export const getEventInfo = (eventType) => {
  const events = {
    trio_shock: {
      icon: '⚡',
      name: 'Trío de Choque',
      description: 'Se juegan 3 cartas en lugar de 2',
      requiredCards: 3
    },
    inverted_circle: {
      icon: '🔄',
      name: 'Círculo Invertido',
      description: 'Papel defiende Piedra, Tijera defiende Papel, Piedra defiende Tijera',
      requiredCards: 2
    },
    early_reveal: {
      icon: '👁️',
      name: 'Revelación Temprana',
      description: 'Atacante muestra 1 carta, Defensor roba +1',
      requiredCards: 2
    },
    defense_wall: {
      icon: '🛡️',
      name: 'Muro de Defensa',
      description: 'Si Defensor iguala ambas, gana 1 punto',
      requiredCards: 2
    },
    attack_pressure: {
      icon: '💥',
      name: 'Presión del Ataque',
      description: 'Si Defensor no iguala ninguna: +3 puntos',
      requiredCards: 2
    },
    recycle: {
      icon: '♻️',
      name: 'Reciclaje',
      description: 'Las cartas no usadas se conservan para la siguiente ronda',
      requiredCards: 2
    }
  };

  return events[eventType] || {
    icon: '❓',
    name: 'Evento Desconocido',
    description: 'Evento no identificado',
    requiredCards: 2
  };
};

/**
 * Determina cuántas cartas se deben jugar según el evento activo
 */
export const getRequiredCards = (event = null) => {
  if (event === 'trio_shock') {
    return 3;
  }
  return 2;
};

/**
 * Valida si una mano de cartas es jugable
 */
export const isHandPlayable = (hand, requiredCards) => {
  return hand.length >= requiredCards;
};

/**
 * Filtra cartas instantáneas de la mano
 */
export const getInstantCards = (hand) => {
  return hand.filter(card => 
    card.type === 'instant_change' || card.type === 'instant_cancel'
  );
};

/**
 * Filtra cartas normales (no instantáneas) de la mano
 */
export const getNormalCards = (hand) => {
  return hand.filter(card => 
    card.type !== 'instant_change' && card.type !== 'instant_cancel'
  );
};

/**
 * Determina el color del gradiente para cada tipo de carta
 */
export const getCardGradient = (cardType) => {
  const gradients = {
    rock: 'from-gray-600 to-gray-800',
    paper: 'from-blue-600 to-blue-800',
    scissors: 'from-red-600 to-red-800',
    joker_attack: 'from-purple-600 to-purple-900',
    joker_defense: 'from-green-600 to-green-900',
    instant_change: 'from-yellow-600 to-yellow-800',
    instant_cancel: 'from-orange-600 to-orange-800'
  };
  return gradients[cardType] || 'from-gray-500 to-gray-700';
};

/**
 * Genera un mensaje descriptivo del resultado de la ronda
 */
export const getRoundResultMessage = (result, isAttacker) => {
  if (!result) return '';

  const { points, matches } = result;

  if (isAttacker) {
    if (points === 0) {
      return '🛡️ El defensor bloqueó todo tu ataque';
    } else if (points === 1) {
      return '⚔️ Lograste pasar 1 carta (+1 punto)';
    } else if (points === 2) {
      return '💥 ¡Ataque exitoso! (+2 puntos)';
    } else if (points === 3) {
      return '🔥 ¡ATAQUE DEVASTADOR! (+3 puntos)';
    }
  } else {
    if (matches === 2) {
      return '🛡️ ¡Defensa perfecta! Bloqueaste todo';
    } else if (matches === 1) {
      return '⚠️ Solo bloqueaste 1 carta';
    } else {
      return '💔 No lograste defender ninguna';
    }
  }

  return '';
};

/**
 * Verifica si un jugador ganó la partida
 */
export const checkWinner = (score, maxScore = 5) => {
  return score >= maxScore;
};

/**
 * Formatea el tiempo transcurrido (para futuras implementaciones)
 */
export const formatGameTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default {
  canDefend,
  calculateDefendedCards,
  calculateAttackPoints,
  defenderGetsBonus,
  getCardName,
  getCardIcon,
  getEventInfo,
  getRequiredCards,
  isHandPlayable,
  getInstantCards,
  getNormalCards,
  getCardGradient,
  getRoundResultMessage,
  checkWinner,
  formatGameTime
};