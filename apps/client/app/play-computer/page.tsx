'use client';

import { useDeferredValue, memo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Square } from 'chess.js';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import TimelineMoveHistory from '@/components/shared/TimelineMoveHistory';
import useComputerGame from '@/hooks/useComputerGame';

// Wrap the ChessBoard component in React.memo to prevent unnecessary re-renders
const MemoizedChessboard = memo(Chessboard);

// Isolate the chessboard in its own component to minimize re-renders
const ChessboardContainer = memo(
  ({
    position,
    orientation,
    onPieceDrop,
    boardStyles,
  }: {
    position: string;
    orientation: 'white' | 'black';
    onPieceDrop: (sourceSquare: Square, targetSquare: Square) => boolean;
    boardStyles: {
      customDarkSquareStyle: { backgroundColor: string };
      customLightSquareStyle: { backgroundColor: string };
      animationDuration: number;
    };
  }) => {
    return (
      <div className="w-full aspect-square relative">
        <MemoizedChessboard
          position={position}
          onPieceDrop={onPieceDrop}
          customDarkSquareStyle={boardStyles.customDarkSquareStyle}
          customLightSquareStyle={boardStyles.customLightSquareStyle}
          boardOrientation={orientation}
          animationDuration={boardStyles.animationDuration}
        />
      </div>
    );
  }
);

// Optional: Add display name for debugging
ChessboardContainer.displayName = 'ChessboardContainer';

export default function PlayComputer() {
  const {
    game,
    boardPosition,
    // isEngineThinking,
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
        alert(`Checkmate! ${winner} wins!`);
      }
    },
  });

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

          <h1 className="text-3xl font-bold mt-4">Play Against Computer</h1>
          <p className="text-zinc-400 mt-2">
            Test your skills against the Stockfish chess engine
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 mb-6">
              {/* Game controls */}
              <div className="flex flex-wrap justify-between items-center mb-4">
                <div className="space-x-2 mb-2 sm:mb-0">
                  <button
                    onClick={resetGame}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md transition-colors"
                  >
                    New Game
                  </button>
                  <button
                    onClick={switchColor}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md transition-colors"
                  >
                    Play as {playerColor === 'w' ? 'Black' : 'White'}
                  </button>
                </div>

                <div className="space-x-2">
                  <button
                    onClick={returnToCurrentPosition}
                    disabled={!viewingHistory}
                    className={`px-4 py-2 ${
                      viewingHistory
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-zinc-700 cursor-not-allowed'
                    } text-white rounded-md transition-colors`}
                  >
                    Return to Current
                  </button>
                </div>
              </div>

              {/* Chess board */}
              <ChessboardContainer
                position={deferredBoardPosition}
                orientation={playerColor === 'w' ? 'white' : 'black'}
                onPieceDrop={onDrop}
                boardStyles={boardStyles}
              />
            </div>
          </div>
          {/* Sidebar */}
          <div className="w-full">
            <div className="bg-zinc-900 p-0 rounded-lg border border-zinc-800 mb-6 overflow-hidden">
              <div className="border-b border-zinc-800">
                <p className="px-4 py-3 text-base font-medium flex-1 w-full text-start transition-colors text-zinc-400">
                  Timeline
                </p>
              </div>
              <div className="h-[500px] bg-zinc-950">
                <TimelineMoveHistory
                  game={game}
                  onMoveClick={handleMoveClick}
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
