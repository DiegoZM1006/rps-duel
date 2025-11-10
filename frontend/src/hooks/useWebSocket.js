import { useState, useEffect, useRef, useCallback } from 'react';

export const useWebSocket = () => { // Ya no recibe playerName para autoconectar
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [room, setRoom] = useState(null); // Nuevo estado para la sala
  const [playerId, setPlayerId] = useState(null);
  const [playerName, setPlayerName] = useState(null); // Estado interno para el nombre
  const [status, setStatus] = useState('disconnected'); // disconnected, connecting, connected, waiting_in_room, playing, finished
  const [error, setError] = useState(null);
  
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);
  const pendingAction = useRef(null); // Para guardar la acción a ejecutar tras la conexión

  const connect = useCallback((name) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log("WebSocket ya está conectado.");
      return;
    }
    
    setStatus('connecting');
    setError(null);
    setPlayerName(name); // Guardamos el nombre del jugador
    
    // Usamos variables de entorno para la URL, con un fallback para desarrollo local
    const backendHost = import.meta.env.VITE_BACKEND_HOST || '127.0.0.1:8000';
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${protocol}://${backendHost}/ws/${encodeURIComponent(name)}`;
    console.log(`Conectando a: ${wsUrl}`);
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket conectado');
      setIsConnected(true);
      setError(null);
      setStatus('connected'); // Estado intermedio: conectado pero no en sala/juego
      // Si hay una acción pendiente, la ejecutamos ahora
      if (pendingAction.current) {
        sendMessage(pendingAction.current);
        pendingAction.current = null; // Limpiamos la acción pendiente
      }
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Mensaje recibido:', data);

      switch (data.type) {
        case 'connected':
          setPlayerId(data.player_id);
          // El nombre ya lo tenemos desde el input del lobby
          break;
          
        case 'room_created':
          setRoom(data.room);
          setStatus('waiting_in_room');
          break;

        case 'player_joined':
          setRoom(data.room);
          setStatus('waiting_in_room');
          break;
          
        case 'game_start':
          setGameState(data.game);
          setRoom(null); // Salimos de la sala para entrar al juego
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
          setGameState(prev => prev ? { ...prev, phase: 'finished' } : null);
          setRoom(null);
          setStatus('finished'); // Un estado final para mostrar el mensaje
          break;

        case 'skip_vote_updated':
          setGameState(data.game);
          break;

        case 'error':
          setError(data.message);
          setStatus('error');
          break;
          
        default:
          console.log('Tipo de mensaje desconocido:', data.type);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Error de conexión con el servidor. Asegúrate de que el backend esté corriendo.');
      setStatus('error');
    };

    ws.current.onclose = () => {
      console.log('WebSocket desconectado');
      setIsConnected(false);
      // No intentamos reconectar automáticamente en un sistema de salas
      // El usuario debe reiniciar la acción
      if (status !== 'finished' && status !== 'error') {
        setStatus('disconnected');
      }
    };
  }, [status]); // Dependemos de status para evitar reconexiones no deseadas

  useEffect(() => {
    // Limpieza al desmontar el componente
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current?.readyState === WebSocket.OPEN) {
        console.log("Cerrando WebSocket al desmontar el componente.");
        ws.current.close();
      }
    };
  }, []);

  const sendMessage = useCallback((data) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    } else {
      console.error('WebSocket no está conectado. No se puede enviar el mensaje:', data);
      setError("No se pudo comunicar con el servidor. Intenta refrescar la página.");
      setStatus('error');
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

  // Nuevas funciones para el sistema de salas
  const createRoom = useCallback((name) => {
    connect(name);
    // Guardamos la acción para ejecutarla en onopen
    pendingAction.current = { action: 'create_room' };
  }, [connect, sendMessage]);

  const joinRoom = useCallback((name, roomCode) => {
    connect(name);
    // Guardamos la acción para ejecutarla en onopen
    pendingAction.current = { action: 'join_room', room_id: roomCode };
  }, [connect, sendMessage]);

  return {
    isConnected,
    gameState,
    room, // Exponer el estado de la sala
    playerId,
    playerName, // Exponer el nombre del jugador
    status,
    error,
    createRoom, // Exponer la función para crear sala
    joinRoom, // Exponer la función para unirse a sala
    playAttack,
    playDefense,
    playInstant
  };
};