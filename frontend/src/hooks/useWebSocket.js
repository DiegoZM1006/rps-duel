import { useState, useEffect, useRef, useCallback } from 'react';

export const useWebSocket = (playerName) => {
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [status, setStatus] = useState('disconnected'); // disconnected, connecting, waiting, playing, finished
  const [error, setError] = useState(null);
  
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;
    
    setStatus('connecting');
    
    // Detectar si estamos usando nginx o acceso directo
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const wsUrl = `${protocol}//${host}/ws/${encodeURIComponent(playerName)}`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket conectado');
      setIsConnected(true);
      setError(null);
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Mensaje recibido:', data);

      switch (data.type) {
        case 'connected':
          setPlayerId(data.player_id);
          break;
          
        case 'waiting':
          setStatus('waiting');
          break;
          
        case 'game_start':
          setGameState(data.game);
          setStatus('playing');
          break;
          
        case 'attack_played':
          setGameState(data.game);
          break;
          
        case 'round_resolved':
          setGameState(data.game);
          if (data.game.winner) {
            setStatus('finished');
          }
          break;
          
        case 'game_state':
          setGameState(data.game);
          break;
          
        case 'player_disconnected':
          setError(data.message);
          setStatus('disconnected');
          break;
          
        default:
          console.log('Tipo de mensaje desconocido:', data.type);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Error de conexión');
    };

    ws.current.onclose = () => {
      console.log('WebSocket desconectado');
      setIsConnected(false);
      setStatus('disconnected');
      
      // Intentar reconectar después de 3 segundos
      reconnectTimeout.current = setTimeout(() => {
        if (playerName) {
          connect();
        }
      }, 3000);
    };
  }, [playerName]);

  useEffect(() => {
    if (playerName) {
      connect();
    }

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [playerName, connect]);

  const sendMessage = useCallback((data) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    } else {
      console.error('WebSocket no está conectado');
    }
  }, []);

  const playAttack = useCallback((cardIds) => {
    sendMessage({
      action: 'play_attack',
      card_ids: cardIds
    });
  }, [sendMessage]);

  const playDefense = useCallback((cardIds) => {
    sendMessage({
      action: 'play_defense',
      card_ids: cardIds
    });
  }, [sendMessage]);

  const playInstant = useCallback((cardId, targetCardId = null) => {
    sendMessage({
      action: 'play_instant',
      card_id: cardId,
      target_card_id: targetCardId
    });
  }, [sendMessage]);

  return {
    isConnected,
    gameState,
    playerId,
    status,
    error,
    playAttack,
    playDefense,
    playInstant
  };
};