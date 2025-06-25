"use client";

import { useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { io } from 'socket.io-client';

// Initialize socket connection
const socket = io('http://localhost:4040');

// Wrap the ChessBoard component in React.memo to prevent unnecessary re-renders
const MemoizedChessboard = Chessboard;

export default function PlayOnline() {
  const [game, setGame] = useState(new Chess());
  const [socketConnected, setSocketConnected] = useState(false);
  const [gameId] = useState("test-game-123");

  // Handle chess moves
  const handleMove = (move: { from: string; to: string; promotion?: string }) => {
    const gameCopy = new Chess(game.fen());
    try {
      const result = gameCopy.move(move);
      if (result) {
        setGame(gameCopy);
        sendChessMove({
          move: result.san,
          fen: gameCopy.fen()
        });
      }
    } catch (error) {
      console.error('Invalid move:', error);
      return null;
    }
  };

  // Socket functions
  const testSocketConnection = () => {
    socket.emit('test-message', {
      playerId: "player-1",
      message: 'Hello from chess client!',
      gameId: gameId
    });
  };

  const sendChessMove = (moveData: { move: string, fen: string }) => {
    socket.emit('chess-move', {
      gameId: gameId,
      playerId: "player-1",
      move: moveData.move,
      fen: moveData.fen
    });
  };

  const joinGameRoom = () => {
    socket.emit('join-room', gameId);
  };

  // Socket event listeners
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setSocketConnected(false);
    });

    socket.on('test-response', (data) => {
      console.log('Test response:', data);
      alert(`Server responded: ${data.message}`);
    });

    socket.on('move-update', (data) => {
      console.log('Move update received:', data);
      const gameCopy = new Chess(data.fen);
      setGame(gameCopy);
    });

    socket.on('joined-room', (data) => {
      console.log('Joined room:', data);
      alert(`Joined room: ${data.roomId}`);
    });

    socket.on('player-joined', (data) => {
      console.log('Player joined:', data);
      alert(`Player joined the room: ${data.socketId}`);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('test-response');
      socket.off('move-update');
      socket.off('joined-room');
      socket.off('player-joined');
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-green-400 flex items-center hover:underline text-sm"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>

          <h1 className="text-3xl font-bold mt-4">Play Online</h1>
          <p className="text-zinc-400 mt-2">
            Test your skills against other players
          </p>
          
          <div className="mt-2 text-sm">
            Socket: <span className={socketConnected ? "text-green-400" : "text-red-400"}>
              {socketConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 mb-6">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <div className="space-x-2 mb-2 sm:mb-0">
              <button 
                onClick={testSocketConnection}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 rounded text-white"
              >
                Test Socket
              </button>
              
              <button 
                onClick={joinGameRoom}
                className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 rounded text-white"
              >
                Join Room
              </button>
            </div>
          </div>

          <div className="w-[90%] max-w-[800px] mx-auto">
            <MemoizedChessboard
              position={game.fen()}
              onPieceDrop={(sourceSquare, targetSquare, piece) => {
                const move = handleMove({
                  from: sourceSquare,
                  to: targetSquare,
                  promotion: piece[1].toLowerCase() ?? 'q'
                });
                return move !== null;
              }}
              customDarkSquareStyle={{ backgroundColor: "#739552" }}
              customLightSquareStyle={{ backgroundColor: "#EBECD0" }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}