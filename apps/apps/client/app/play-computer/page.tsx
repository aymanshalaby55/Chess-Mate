'use client';

import { useDeferredValue, useState } from 'react';
import { Square } from 'chess.js';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import useComputerGame from '@/hooks/useComputerGame';
import FullMoveHistory from '@/components/shared/TimelineMoveHistory';
import ChessboardContainer from '@/components/shared/ChessBoardContainer';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export default function PlayComputer() {
  const {
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
  } = useComputerGame({
    onGameOver: (winner) => {
      if (winner === 'draw') {
        alert('Game ended in a draw');
      } else {
        toast.success(`${winner === "w" ? "White" : "Black"} wins the game!`, {
          style: {
            color: "#fff",
            backgroundColor: winner === playerColor ? "#4caf50" : "#50a36c", // green or red
            border: "1px solid #333",
          },
        });
      }
    },
  });
  const { data: userData } = useQuery({
    queryKey: ['userData'],
    queryFn: () => api.get('/user/info'),
  });
  // Override boardStyles to match the image's colors
  const customBoardStyles = {
    ...boardStyles,
    customDarkSquareStyle: { backgroundColor: '#739552' }, // Greenish
    customLightSquareStyle: { backgroundColor: '#EBECD0' }, // Beige
  };

  // Use deferred value to reduce rendering pressure
  const deferredBoardPosition = useDeferredValue(boardPosition);

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

          <h1 className="text-3xl font-bold mt-4 ">
            <span className="text-green-400">{userData?.data?.name}</span> vs{' '}
            <span className="text-white">Stockfish</span>
          </h1>
          <p className="text-zinc-400 mt-2">
            Test your skills against the Stockfish chess engine
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="flex flex-wrap justify-between items-center mb-4">
              <div className="space-x-2 mb-2 sm:mb-0">
                <button
                  onClick={() => {
                    resetGame();
                    setSelectedSquare(null);
                    setPossibleMoves({});
                  }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md transition-colors"
                >
                  New Game
                </button>
                <button
                  onClick={() => {
                    switchColor();
                    setSelectedSquare(null);
                    setPossibleMoves({});
                  }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md transition-colors"
                >
                  Play as {playerColor === 'w' ? 'Black' : 'White'}
                </button>
              </div>

              <div className="space-x-2">
                <button
                  onClick={() => {
                    returnToCurrentPosition();
                    setSelectedSquare(null);
                    setPossibleMoves({});
                  }}
                  disabled={!viewingHistory}
                  className={`px-4 py-2 ${
                    viewingHistory
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-zinc-500 cursor-not-allowed'
                  } text-white rounded-md transition-colors`}
                >
                  Return to Current
                </button>
              </div>
            </div>
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 mb-6">
              {/* Chess board with larger size */}
              <div className="w-[100%] mx-auto">
                <ChessboardContainer
                  position={deferredBoardPosition}
                  orientation={playerColor === 'w' ? 'white' : 'black'}
                  onPieceDrop={onDrop}
                  boardStyles={customBoardStyles}
                  selectedSquare={selectedSquare}
                  possibleMoves={possibleMoves}
                  onSquareClick={handleSquareClick}
                  game={game}
                />
              </div>
            </div>
          </div>
          {/* Sidebar */}
          <div className="w-full">
            <div className="bg-zinc-900 p-0 rounded-lg border border-zinc-800 mb-6 overflow-hidden">
              <div className="border-b border-zinc-800">
                <p className="px-4 py-3 text-base font-medium flex-1 w-full text-start transition-colors text-zinc-400">
                  Move History
                </p>
              </div>
              <div className="h-[500px]">
                {/* Move history component */}
                <FullMoveHistory
                  game={gameMoves}
                  onMoveClick={(index) => {
                    handleMoveClick(index);
                  }}
                  currentMoveIndex={viewingMoveIndex}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
