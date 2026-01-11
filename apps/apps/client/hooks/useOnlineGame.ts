"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Chess, Square, Color } from "chess.js";
import { io, Socket } from 'socket.io-client';
import { MoveRecord, ChatMessage, GameOverEvent } from "@/types";

export interface UseOnlineGameOptions {
  onGameOver?: (data: GameOverEvent) => void;
  onOpponentJoined?: () => void;
  onOpponentLeft?: () => void;
  gameId?: number;
  inviteCode?: string | null; // Add invite code option
  userId?: number;
  userName?: string;
  serverUrl?: string;
}

export default function useOnlineGame(options?: UseOnlineGameOptions) {
  const [game, setGame] = useState(() => new Chess());
  const gameRef = useRef<Chess>(new Chess());
  const socketRef = useRef<Socket | null>(null);
  
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [playerColor, setPlayerColor] = useState<Color>("w");
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Board state
  const [boardPosition, setBoardPosition] = useState(new Chess().fen());
  const [viewingHistory, setViewingHistory] = useState(false);
  const [viewingMoveIndex, setViewingMoveIndex] = useState(-1);
  
  // Timer state
  const [whiteTimeLeft, setWhiteTimeLeft] = useState(600000);
  const [blackTimeLeft, setBlackTimeLeft] = useState(600000);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  // Game over state
  const [gameOverData, setGameOverData] = useState<GameOverEvent | null>(null);
  
  // Opponent info
  const [opponent, setOpponent] = useState<{
    id: number;
    name: string;
    rating?: number;
    picture?: string;
  } | null>(null);

  // Move history
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
  const [gameMoves, setGameMoves] = useState<MoveRecord[]>(gameMovesRef.current);

  // Initialize socket connection
  useEffect(() => {
    // Don't connect if we don't have required data
    if (!options?.userId || !options?.userName) {
      return;
    }

    const serverUrl = options?.serverUrl || 'http://localhost:4040';
    const socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });
    socketRef.current = socket;

    const onConnect = () => {
      console.log('Connected to server');
      setIsConnected(true);
      
      // Authenticate
      socket.emit('authenticate', {
        odId: options.userId,
        odName: options.userName,
      });
      
      // If we have an invite code, join via invite first
      if (options?.inviteCode && options?.userId && options?.userName) {
        console.log('Joining via invite code:', options.inviteCode);
        socket.emit('join-by-invite', {
          inviteCode: options.inviteCode,
          odId: options.userId,
          odName: options.userName,
        });
      } 
      // Otherwise just join the game room directly
      else if (options?.gameId && options?.userId && options?.userName) {
        console.log('Joining game directly:', options.gameId);
        socket.emit('join-game', {
          gameId: options.gameId,
          odId: options.userId,
          odName: options.userName,
        });
      }
    };

    const onDisconnect = () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      setOpponentConnected(false);
    };

    const onAuthenticated = (data: any) => {
      console.log('Authenticated:', data);
    };

    const onGameState = (data: any) => {
      console.log('Game state received:', data);
      const chess = new Chess(data.fen);
      gameRef.current = chess;
      setGame(chess);
      setBoardPosition(data.fen);
      setPlayerColor(data.yourColor === 'white' ? 'w' : data.yourColor === 'black' ? 'b' : 'w');
      setIsMyTurn(data.currentTurn === data.yourColor);
      setGameStarted(data.status === 'ongoing');
      setWhiteTimeLeft(data.whiteTimeLeft || 600000);
      setBlackTimeLeft(data.blackTimeLeft || 600000);
      
      if (data.yourColor === 'white' && data.black) {
        setOpponent(data.black);
        setOpponentConnected(true);
      } else if (data.yourColor === 'black' && data.white) {
        setOpponent(data.white);
        setOpponentConnected(true);
      }
      
      // Load move history
      if (data.moves && data.moves.length > 0) {
        const moves: MoveRecord[] = [
          { fen: new Chess().fen(), timestamp: Date.now() },
          ...data.moves.map((m: any) => ({
            fen: m.fen,
            timestamp: new Date(m.createdAt).getTime(),
            moveNotation: m.piece + m.to,
            from: m.from,
            to: m.to,
            promotion: m.promotion,
            timeSpent: m.timeSpent,
          })),
        ];
        gameMovesRef.current = moves;
        setGameMoves(moves);
      }
    };

    const onPlayerJoined = (data: any) => {
      console.log('Player joined:', data);
      setOpponentConnected(true);
      setOpponent({
        id: data.odId,
        name: data.odName,
        rating: data.rating,
      });
      options?.onOpponentJoined?.();
    };

    const onPlayerDisconnected = (data: any) => {
      console.log('Player disconnected:', data);
      setOpponentConnected(false);
      options?.onOpponentLeft?.();
    };

    const onGameStarted = (data: any) => {
      console.log('Game started:', data);
      setGameStarted(true);
      setIsMyTurn(playerColor === 'w'); // White goes first
      if (data.opponent) {
        setOpponent({
          id: data.opponent.odId,
          name: data.opponent.odName,
          rating: data.opponent.rating,
        });
        setOpponentConnected(true);
      }
    };

    const onMoveMade = (data: any) => {
      console.log('Move made:', data);
      const chess = new Chess(data.fen);
      gameRef.current = chess;
      setGame(chess);
      setBoardPosition(data.fen);
      setIsMyTurn(data.currentTurn === (playerColor === 'w' ? 'white' : 'black'));
      setWhiteTimeLeft(data.whiteTimeLeft);
      setBlackTimeLeft(data.blackTimeLeft);
      
      // Add to move history
      const newMove: MoveRecord = {
        fen: data.fen,
        timestamp: Date.now(),
        moveNotation: data.san,
        from: data.from,
        to: data.to,
        promotion: data.promotion,
      };
      gameMovesRef.current.push(newMove);
      setGameMoves([...gameMovesRef.current]);
    };

    const onTimeUpdate = (data: any) => {
      if (data.color === 'white') {
        setWhiteTimeLeft(data.timeLeft);
      } else {
        setBlackTimeLeft(data.timeLeft);
      }
    };

    const onGameOver = (data: GameOverEvent) => {
      console.log('Game over:', data);
      setGameOverData(data);
      setGameStarted(false);
      options?.onGameOver?.(data);
    };

    const onNewMessage = (message: ChatMessage) => {
      setChatMessages((prev) => [...prev, message]);
    };

    const onMessagesHistory = (messages: ChatMessage[]) => {
      setChatMessages(messages);
    };

    const onDrawOffered = (data: any) => {
      console.log('Draw offered by:', data.odName);
    };

    const onError = (data: any) => {
      console.error('Socket error:', data.message);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('authenticated', onAuthenticated);
    socket.on('game-state', onGameState);
    socket.on('player-joined', onPlayerJoined);
    socket.on('player-disconnected', onPlayerDisconnected);
    socket.on('game-started', onGameStarted);
    socket.on('move-made', onMoveMade);
    socket.on('time-update', onTimeUpdate);
    socket.on('game-over', onGameOver);
    socket.on('new-message', onNewMessage);
    socket.on('messages-history', onMessagesHistory);
    socket.on('draw-offered', onDrawOffered);
    socket.on('error', onError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('authenticated', onAuthenticated);
      socket.off('game-state', onGameState);
      socket.off('player-joined', onPlayerJoined);
      socket.off('player-disconnected', onPlayerDisconnected);
      socket.off('game-started', onGameStarted);
      socket.off('move-made', onMoveMade);
      socket.off('time-update', onTimeUpdate);
      socket.off('game-over', onGameOver);
      socket.off('new-message', onNewMessage);
      socket.off('messages-history', onMessagesHistory);
      socket.off('draw-offered', onDrawOffered);
      socket.off('error', onError);
      socket.disconnect();
    };
  }, [options?.gameId, options?.inviteCode, options?.userId, options?.userName, options?.serverUrl, playerColor]);

  // Handle chess moves
  const onDrop = useCallback(
    (sourceSquare: Square, targetSquare: Square) => {
      if (!isMyTurn || viewingHistory || !gameStarted || gameOverData) {
        return false;
      }

      const gameCopy = new Chess(game.fen());
      
      try {
        const move = gameCopy.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        });

        if (move) {
          // Optimistically update local state
          gameRef.current = gameCopy;
          setGame(gameCopy);
          setBoardPosition(gameCopy.fen());
          setIsMyTurn(false);

          // Send move to server
          if (socketRef.current && options?.gameId) {
            socketRef.current.emit('make-move', {
              gameId: options.gameId,
              from: sourceSquare,
              to: targetSquare,
              promotion: move.promotion,
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
    [game, isMyTurn, viewingHistory, gameStarted, gameOverData, options?.gameId]
  );

  // Send chat message
  const sendMessage = useCallback((message: string) => {
    if (socketRef.current && options?.gameId) {
      socketRef.current.emit('send-message', {
        gameId: options.gameId,
        message,
      });
    }
  }, [options?.gameId]);

  // Resign game
  const resign = useCallback(() => {
    if (socketRef.current && options?.gameId) {
      socketRef.current.emit('resign', { gameId: options.gameId });
    }
  }, [options?.gameId]);

  // Offer draw
  const offerDraw = useCallback(() => {
    if (socketRef.current && options?.gameId) {
      socketRef.current.emit('offer-draw', { gameId: options.gameId });
    }
  }, [options?.gameId]);

  // Accept draw
  const acceptDraw = useCallback(() => {
    if (socketRef.current && options?.gameId) {
      socketRef.current.emit('accept-draw', { gameId: options.gameId });
    }
  }, [options?.gameId]);

  // Decline draw
  const declineDraw = useCallback(() => {
    if (socketRef.current && options?.gameId) {
      socketRef.current.emit('decline-draw', { gameId: options.gameId });
    }
  }, [options?.gameId]);

  // Handle move click for history viewing
  const handleMoveClick = useCallback((index: number) => {
    if (index < 0 || index >= gameMovesRef.current.length) return;

    const targetMove = gameMovesRef.current[index];
    const newGame = new Chess(targetMove.fen);
    setGame(newGame);
    setViewingHistory(true);
    setViewingMoveIndex(index);
    setBoardPosition(targetMove.fen);
  }, []);

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

  return {
    // Game state
    game,
    boardPosition,
    gameMoves,
    playerColor,
    viewingHistory,
    viewingMoveIndex,
    boardStyles,
    
    // Connection state
    isConnected,
    isMyTurn,
    opponentConnected,
    gameStarted,
    opponent,
    
    // Timer state
    whiteTimeLeft,
    blackTimeLeft,
    
    // Chat state
    chatMessages,
    
    // Game over state
    gameOverData,
    
    // Actions
    onDrop,
    handleMoveClick,
    returnToCurrentPosition,
    sendMessage,
    resign,
    offerDraw,
    acceptDraw,
    declineDraw,
  };
}
