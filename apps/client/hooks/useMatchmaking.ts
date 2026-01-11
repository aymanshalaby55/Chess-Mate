"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { io, Socket } from 'socket.io-client';
import { TimeControl } from "@/types";

export interface MatchedGame {
  gameId: number;
  white: {
    odId: number;
    odName: string;
    rating: number;
  };
  black: {
    odId: number;
    odName: string;
    rating: number;
  };
  timeControl: TimeControl;
  initialTime: number;
  fen: string;
}

export interface UseMatchmakingOptions {
  userId: number;
  userName: string;
  userRating: number;
  serverUrl?: string;
  onGameMatched?: (game: MatchedGame) => void;
}

export default function useMatchmaking(options: UseMatchmakingOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [searchTime, setSearchTime] = useState(0);
  const [matchedGame, setMatchedGame] = useState<MatchedGame | null>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const serverUrl = options.serverUrl || 'http://localhost:4040';
    const socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });
    socketRef.current = socket;

    const onConnect = () => {
      console.log('Matchmaking connected');
      setIsConnected(true);
      
      // Authenticate
      socket.emit('authenticate', {
        odId: options.userId,
        odName: options.userName,
      });
    };

    const onDisconnect = () => {
      console.log('Matchmaking disconnected');
      setIsConnected(false);
      setIsSearching(false);
      setQueuePosition(null);
    };

    const onMatchmakingJoined = (data: { position: number }) => {
      console.log('Joined matchmaking queue:', data);
      setQueuePosition(data.position);
    };

    const onMatchmakingLeft = () => {
      console.log('Left matchmaking queue');
      setIsSearching(false);
      setQueuePosition(null);
      setSearchTime(0);
      if (searchTimerRef.current) {
        clearInterval(searchTimerRef.current);
      }
    };

    const onGameMatched = (game: MatchedGame) => {
      console.log('Game matched:', game);
      setMatchedGame(game);
      setIsSearching(false);
      setQueuePosition(null);
      setSearchTime(0);
      if (searchTimerRef.current) {
        clearInterval(searchTimerRef.current);
      }
      options.onGameMatched?.(game);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('matchmaking-joined', onMatchmakingJoined);
    socket.on('matchmaking-left', onMatchmakingLeft);
    socket.on('game-matched', onGameMatched);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('matchmaking-joined', onMatchmakingJoined);
      socket.off('matchmaking-left', onMatchmakingLeft);
      socket.off('game-matched', onGameMatched);
      socket.disconnect();
      if (searchTimerRef.current) {
        clearInterval(searchTimerRef.current);
      }
    };
  }, [options.userId, options.userName, options.serverUrl]);

  // Start searching for a game
  const startSearching = useCallback((timeControl: TimeControl) => {
    if (!socketRef.current || !isConnected) return;

    setIsSearching(true);
    setSearchTime(0);
    setMatchedGame(null);

    // Start search timer
    searchTimerRef.current = setInterval(() => {
      setSearchTime((prev) => prev + 1);
    }, 1000);

    socketRef.current.emit('join-matchmaking', {
      odId: options.userId,
      odName: options.userName,
      rating: options.userRating,
      timeControl,
    });
  }, [isConnected, options.userId, options.userName, options.userRating]);

  // Stop searching
  const stopSearching = useCallback(() => {
    if (!socketRef.current) return;

    socketRef.current.emit('leave-matchmaking');
    setIsSearching(false);
    setQueuePosition(null);
    setSearchTime(0);
    if (searchTimerRef.current) {
      clearInterval(searchTimerRef.current);
    }
  }, []);

  // Format search time
  const formatSearchTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    isConnected,
    isSearching,
    queuePosition,
    searchTime,
    formattedSearchTime: formatSearchTime(searchTime),
    matchedGame,
    startSearching,
    stopSearching,
  };
}


