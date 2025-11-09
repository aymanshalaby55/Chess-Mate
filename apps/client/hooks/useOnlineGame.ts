"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Chess, Square, Color } from "chess.js";
import { io, Socket } from 'socket.io-client';
import { MoveRecord, UseOnlineGameOptions } from "@/types";

export default function useOnlineGame(options?: UseOnlineGameOptions) {
  const [game, setGame] = useState(() => new Chess());
  const gameRef = useRef<Chess>(new Chess());
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [playerColor, setPlayerColor] = useState<Color>("w"); // Default to white
  const [boardPosition, setBoardPosition] = useState(new Chess().fen());
  const [viewingHistory, setViewingHistory] = useState(false);
  const [viewingMoveIndex, setViewingMoveIndex] = useState(-1);
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Keep a history of all game positions with timestamps
  const gameMovesRef = useRef<MoveRecord[]>([
    {
      fen: new Chess().fen(),
      timestamp: Date.now(),
      moveNotation: undefined,
      from: undefined,
      to: undefined,
      promotion: undefined,
    },
  ]);

  // Expose the game moves history as a state value
  const [gameMoves, setGameMoves] = useState<MoveRecord[]>(
    gameMovesRef.current
  );

  // Initialize socket connection
  useEffect(() => {
    const serverUrl = options?.serverUrl || 'http://localhost:4040';
    const socket = io(serverUrl);
    socketRef.current = socket;

    const onConnect = () => {
      console.log('Connected to server');
      setIsConnected(true);
      
      // Join the game room
      const gameId = options?.gameId || 'default-game';
      const playerId = options?.playerId || `player-${Date.now()}`;
      
      socket.emit('join-room', {
        gameId,
        playerId
      });
    };

    const onDisconnect = () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      setOpponentConnected(false);
    };

    const onJoinedRoom = (data: any) => {
      console.log('Joined room:', data);
      setPlayerColor(data.playerColor || 'w');
      setIsMyTurn(data.playerColor === 'w'); // White goes first
      setGameStarted(data.playerCount === 2);
    };

    const onPlayerJoined = (data: any) => {
      console.log('Player joined:', data);
      setOpponentConnected(true);
      if (data.playerCount === 2) {
        setGameStarted(true);
      }
    };

    const onPlayerLeft = (data: any) => {
      console.log('Player left:', data);
      setOpponentConnected(false);
    };

    const onMoveUpdate = (data: any) => {
      console.log('Move update received:', data);
      const gameCopy = new Chess(data.fen);
      setGame(gameCopy);
      setIsMyTurn(gameCopy.turn() === playerColor);
    };

    const onGameStart = (data: any) => {
      console.log('Game started:', data);
      setGameStarted(true);
    };

    const onGameOver = (data: any) => {
      console.log('Game over:', data);
      options?.onGameOver?.(data.winner);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('joined-room', onJoinedRoom);
    socket.on('player-joined', onPlayerJoined);
    socket.on('player-left', onPlayerLeft);
    socket.on('move-update', onMoveUpdate);
    socket.on('game-start', onGameStart);
    socket.on('game-over', onGameOver);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('joined-room', onJoinedRoom);
      socket.off('player-joined', onPlayerJoined);
      socket.off('player-left', onPlayerLeft);
      socket.off('move-update', onMoveUpdate);
      socket.off('game-start', onGameStart);
      socket.off('game-over', onGameOver);
      socket.disconnect();
    };
  }, [options?.gameId, options?.playerId, options?.serverUrl, playerColor, options]);

  // Update the game ref whenever game state changes
  useEffect(() => {
    gameRef.current = game;
    // Add position to history if it's a new move
    const currentFen = game.fen();

    if (
      gameMovesRef.current.length === 0 ||
      gameMovesRef.current[gameMovesRef.current.length - 1].fen !== currentFen
    ) {
      const history = game.history({ verbose: true });
      const lastMove = history.length > 0 ? history[history.length - 1] : null;
      const moveNotation = lastMove ? lastMove.san : undefined;

      const newMoveRecord: MoveRecord = {
        fen: currentFen,
        timestamp: Date.now(),
        moveNotation,
        from: lastMove?.from,
        to: lastMove?.to,
        promotion: lastMove?.promotion as "q" | "r" | "b" | "n" | undefined,
      };

      gameMovesRef.current.push(newMoveRecord);
      setGameMoves([...gameMovesRef.current]);
    }

    // Only update the board position if we're not viewing history
    if (!viewingHistory) {
      setBoardPosition(currentFen);
    }
  }, [game, viewingHistory]);

  // Handle chess moves
  const onDrop = useCallback(
    (sourceSquare: Square, targetSquare: Square) => {
      // Don't allow moves if it's not our turn or we're viewing history
      if (!isMyTurn || viewingHistory || !gameStarted) {
        return false;
      }

      const gameCopy = new Chess(game.fen());
      
      try {
        const move = gameCopy.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q", // Always promote to queen for simplicity
        });

        if (move) {
          setGame(gameCopy);
          setIsMyTurn(false); // It's no longer our turn

          // Send move to server
          if (socketRef.current) {
            socketRef.current.emit('chess-move', {
              gameId: options?.gameId || 'default-game',
              playerId: options?.playerId || 'player-1',
              move: move.san,
              fen: gameCopy.fen()
            });
          }

          return true;
        }
      } catch (error) {
        console.error('Invalid move:', error);
        return false;
      }

      return false;
    },
    [game, isMyTurn, viewingHistory, gameStarted, options?.gameId, options?.playerId]
  );

  // Reset game
  const resetGame = useCallback(() => {
    const newGame = new Chess();
    setGame(newGame);
    setViewingHistory(false);
    setViewingMoveIndex(-1);
    gameMovesRef.current = [
      {
        fen: newGame.fen(),
        timestamp: Date.now(),
        moveNotation: undefined,
        from: undefined,
        to: undefined,
        promotion: undefined,
      },
    ];
    setGameMoves([...gameMovesRef.current]);
    setIsMyTurn(playerColor === 'w'); // White goes first
  }, [playerColor]);

  // Switch color
  const switchColor = useCallback(() => {
    const newColor = playerColor === "w" ? "b" : "w";
    setPlayerColor(newColor);
    setIsMyTurn(newColor === 'w'); // White goes first
    resetGame();
  }, [playerColor, resetGame]);

  // Handle move click for history viewing
  const handleMoveClick = useCallback(
    (index: number) => {
      if (index < 0 || index >= gameMovesRef.current.length) {
        return;
      }

      const targetMove = gameMovesRef.current[index];
      const newGame = new Chess(targetMove.fen);
      setGame(newGame);
      setViewingHistory(true);
      setViewingMoveIndex(index);
      setBoardPosition(targetMove.fen);
    },
    []
  );

  // Return to current position
  const returnToCurrentPosition = useCallback(() => {
    const currentGame = gameMovesRef.current[gameMovesRef.current.length - 1];
    if (currentGame) {
      const newGame = new Chess(currentGame.fen);
      setGame(newGame);
      setViewingHistory(false);
      setViewingMoveIndex(-1);
      setBoardPosition(currentGame.fen);
    }
  }, []);

  // Board styles
  const boardStyles = useMemo(
    () => ({
      customDarkSquareStyle: { backgroundColor: "#739552" },
      customLightSquareStyle: { backgroundColor: "#EBECD0" },
      animationDuration: 200,
    }),
    []
  );

  // Test socket connection
  const testSocketConnection = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('test-message', {
        playerId: options?.playerId || 'player-1',
        message: 'Hello from chess client!',
        gameId: options?.gameId || 'default-game'
      });
    }
  }, [options?.playerId, options?.gameId]);

  return {
    game,
    boardPosition,
    gameMoves,
    playerColor,
    viewingHistory,
    viewingMoveIndex,
    boardStyles,
    onDrop,
    resetGame,
    switchColor,
    handleMoveClick,
    returnToCurrentPosition,
    isConnected,
    isMyTurn,
    opponentConnected,
    gameStarted,
    testSocketConnection,
  };
}
