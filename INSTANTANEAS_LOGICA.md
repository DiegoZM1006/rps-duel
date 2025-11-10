# Lógica de Cartas Instantáneas

## Resumen
Se ha implementado un sistema completo de cartas instantáneas con turnos y respuestas encadenadas. Solo hay **1 carta de cada tipo** en el mazo (en lugar de 2).

## Tipos de Cartas Instantáneas

### 1. ⚡ Cambio Relámpago (INSTANT_CHANGE)
- **Rol**: Solo Atacante
- **Momento**: Después de que el defensor jugó sus cartas
- **Efecto**: Cambia 1 de las cartas de ataque por otra carta de la mano
- **Respuesta posible**: El defensor puede usar Reasignar o Anular

### 2. 🔄 Reasignar (INSTANT_REASSIGN)
- **Rol**: Solo Defensor
- **Momento**: Después de que el atacante usó Cambio Relámpago
- **Efecto**: Intercambia las posiciones de las cartas de defensa
- **Respuesta posible**: El atacante puede usar Anular

### 3. 🚫 Anular (INSTANT_CANCEL)
- **Rol**: Cualquiera
- **Momento**: En respuesta a una instantánea del oponente
- **Efecto**: Cancela y revierte el efecto de la última instantánea jugada
- **Respuesta posible**: Ninguna (fin de cadena)

### 4. 🎴 Robo+1 (INSTANT_DRAW)
- **Rol**: Cualquiera
- **Momento**: Durante la fase de instantáneas
- **Efecto**: Roba 1 carta del mazo (filtrada por rol)
- **Respuesta posible**: El oponente puede usar Anular

## Flujo de la Fase Instantánea

```
1. ATTACKING PHASE
   ↓
   Atacante juega 2-3 cartas
   ↓
2. DEFENDING PHASE
   ↓
   Defensor juega 2-3 cartas
   ↓
3. INSTANT PHASE (si hay cartas instantáneas disponibles)
   ↓
   a) ¿Atacante tiene INSTANT_CHANGE?
      → SÍ: Turno del Atacante (puede jugar INSTANT_CHANGE)
         ↓
         ¿Defensor tiene INSTANT_REASSIGN o INSTANT_CANCEL?
         → SÍ: Turno del Defensor
            ↓
            Si jugó REASSIGN → ¿Atacante tiene INSTANT_CANCEL?
               → SÍ: Turno del Atacante
               → NO: Ir a RESOLVING
            Si jugó CANCEL → Ir a RESOLVING
         → NO: Ir a RESOLVING
      → NO: ¿Alguno tiene INSTANT_DRAW?
         → SÍ: Permitir jugar INSTANT_DRAW
         → NO: Ir a RESOLVING
   
   b) Jugadores pueden votar "OMITIR FASE"
      → Si ambos votan: Ir a RESOLVING
   ↓
4. RESOLVING PHASE
   ↓
   Calcular puntos y verificar ganador
   ↓
5. Siguiente ronda (intercambiar roles)
```

## Campos del GameState

### Nuevos campos para control de instantáneas:
- `instant_player_turn`: ID del jugador que puede jugar una instantánea
- `instant_actions_history`: Historial de instantáneas jugadas (para revertir con CANCEL)
- `pending_instant_response`: Si hay una instantánea esperando respuesta
- `can_respond_with_cancel`: Si el turno actual permite usar CANCEL

## Reglas Importantes

1. **Solo 1 carta instantánea por tipo en todo el mazo**
2. **Control de turnos**: Solo el jugador indicado en `instant_player_turn` puede jugar
3. **Prioridad del Atacante**: Si tiene INSTANT_CHANGE, tiene prioridad al inicio
4. **Cadenas de respuesta**: 
   - INSTANT_CHANGE → permite REASSIGN o CANCEL
   - INSTANT_REASSIGN → permite CANCEL
   - INSTANT_DRAW → permite CANCEL
   - INSTANT_CANCEL → termina la cadena
5. **Opción de omitir**: Ambos jugadores pueden votar para saltarse la fase

## Ejemplos de Cadenas

### Cadena completa:
```
1. Atacante juega INSTANT_CHANGE (cambia una carta)
2. Defensor responde con INSTANT_REASSIGN (reordena defensas)
3. Atacante responde con INSTANT_CANCEL (revierte el reordenamiento)
4. → Fase RESOLVING
```

### Cadena corta:
```
1. Defensor juega INSTANT_DRAW (roba carta)
2. Atacante responde con INSTANT_CANCEL (cancela el robo)
3. → Fase RESOLVING
```

### Sin cadena:
```
1. Atacante juega INSTANT_CHANGE (cambia una carta)
2. Defensor no tiene REASSIGN ni CANCEL
3. → Fase RESOLVING (con la carta cambiada)
```

## Integración con el Frontend

El frontend necesita:
1. Mostrar de quién es el turno (`instant_player_turn`)
2. Indicar si se puede usar CANCEL (`can_respond_with_cancel`)
3. Enviar `target_card_id` para INSTANT_CHANGE
4. Enviar `target_positions` para INSTANT_REASSIGN (opcional, por defecto [0,1])
5. Manejar el botón "OMITIR FASE" con sistema de votos

## Cambios Realizados

### Backend:
- ✅ `models.py`: Agregados nuevos campos al GameState
- ✅ `game_manager.py`: 
  - Modificado `create_deck()` para 1 carta de cada tipo
  - Reescrito `play_defense()` para inicializar fase instantánea
  - Reescrito completamente `play_instant()` con sistema de turnos
  - Implementados métodos auxiliares para cada tipo de carta
  - Actualizado `_prepare_next_round()` para resetear campos
- ✅ `main.py`: Actualizado endpoint para manejar `target_positions`

### Frontend:
- ⚠️ Pendiente: Actualizar UI para mostrar turnos y permitir selección de posiciones para REASSIGN
