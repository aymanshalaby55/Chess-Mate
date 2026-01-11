import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketProps {
  serverUrl: string;
  gameId: string;
  playerId: string;
  onMoveUpdate?: (data: any) => void;
  onPlayerJoined?: (data: any) => void;
}

export const useSocket = ({
  serverUrl,
  gameId,
  playerId,
  onMoveUpdate,
  onPlayerJoined,
}: UseSocketProps) => {
  // Initialize socket connection
  const socket: Socket = io(serverUrl);

  const testSocketConnection = () => {
    socket.emit('test-message', {
      playerId,
      message: 'Hello from client!',
      gameId,
    });
  };

  const sendChessMove = (moveData: { move: string; fen: string }) => {
    socket.emit('chess-move', {
      gameId,
      playerId,
      move: moveData.move,
      fen: moveData.fen,
    });
  };

  const joinGameRoom = () => {
    socket.emit('join-room', gameId);
  };

  useEffect(() => {
    // Listen for test responses
    socket.on('test-response', (data) => {
      console.log('Test response:', data);
    });

    // Listen for move updates
    socket.on('move-update', (data) => {
      console.log('Move update received:', data);
      onMoveUpdate?.(data);
    });

    // Listen for room join confirmations
    socket.on('joined-room', (data) => {
      console.log('Joined room:', data);
    });

    // Listen for other players joining
    socket.on('player-joined', (data) => {
      console.log('Player joined:', data);
      onPlayerJoined?.(data);
    });

    // Cleanup
    return () => {
      socket.off('test-response');
      socket.off('move-update');
      socket.off('joined-room');
      socket.off('player-joined');
      socket.disconnect();
    };
  }, [socket, gameId, playerId, onMoveUpdate, onPlayerJoined]);

  return {
    socket,
    testSocketConnection,
    sendChessMove,
    joinGameRoom,
  };
};
