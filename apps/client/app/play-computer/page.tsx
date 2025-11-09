"use client";

import { useDeferredValue, memo, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess, Square } from "chess.js";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import useComputerGame from "@/hooks/useComputerGame";
import FullMoveHistory from "@/components/shared/TimelineMoveHistory";
import { usePossiableMoves } from "@/hooks/usePossiableMoves";
import { toast } from "sonner";

// Wrap the Chessboard component in React.memo to prevent unnecessary re-renders
const MemoizedChessboard = memo(Chessboard);

// Isolate the chessboard in its own component to minimize re-renders
const ChessboardContainer = memo(
  ({
    position,
    orientation,
    onPieceDrop,
    boardStyles,
    selectedSquare,
    possibleMoves,
    onSquareClick,
    game,
  }: {
    position: string;
    orientation: "white" | "black";
    onPieceDrop: (sourceSquare: Square, targetSquare: Square) => boolean;
    boardStyles: {
      customDarkSquareStyle: { backgroundColor: string };
      customLightSquareStyle: { backgroundColor: string };
      animationDuration: number;
    };
    selectedSquare: Square | null;
    possibleMoves: Record<string, Square[]>;
    onSquareClick: (square: Square) => void;
    game: Chess;
  }) => {
    const highlightStyles = {};

    if (selectedSquare) {
      highlightStyles[selectedSquare] = { backgroundColor: "#FFFF99" }; // Yellow highlight for selected square
    }

    // Wrap the onPieceDrop to include toast notification
    const handlePieceDrop = (sourceSquare: Square, targetSquare: Square) => {
      const isValidMove = onPieceDrop(sourceSquare, targetSquare);
      if (isValidMove) {
        toast.success(`Moved piece from ${sourceSquare} to ${targetSquare}!`);
      }
      return isValidMove;
    };

    return (
      <div className="w-full aspect-square relative border-b-4 border-yellow-100">
        <MemoizedChessboard
          position={position}
          onPieceDrop={handlePieceDrop} // Use the wrapped function
          customDarkSquareStyle={boardStyles.customDarkSquareStyle}
          customLightSquareStyle={boardStyles.customLightSquareStyle}
          boardOrientation={orientation}
          animationDuration={boardStyles.animationDuration}
          onSquareClick={onSquareClick}
          customSquareStyles={highlightStyles}
        />

        {/* Overlay for possible move indicators */}
        {selectedSquare && (
          <div className="absolute inset-0 pointer-events-none">
            {(possibleMoves[selectedSquare] || []).map((square) => {
              const file = square.charCodeAt(0) - 97;
              const rank = 8 - parseInt(square[1]);
              const left =
                orientation === "white"
                  ? `${(file + 0.5) * 12.5}%`
                  : `${(7 - file + 0.5) * 12.5}%`;
              const top =
                orientation === "white"
                  ? `${(rank + 0.5) * 12.5}%`
                  : `${(7 - rank + 0.5) * 12.5}%`;

              const piece = game.get(square);
              const isOpponentPiece = piece && piece.color !== game.turn();
              return (
                <div
                  key={square}
                  className={`absolute z-10 w-8 h-8 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${
                    square === selectedSquare ? "bg-transparent" : ""
                  }`}
                  style={{
                    left,
                    top,
                    backgroundColor:
                      square === selectedSquare
                        ? "transparent"
                        : "rgb(99, 128, 70, 0.5)",
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

// Optional: Add display name for debugging
ChessboardContainer.displayName = "ChessboardContainer";

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
    onGameOver: (winner: string) => {
      console.log("Game Over:", winner);

      if (winner === "draw") {
        toast.info("Game ended in a draw!", {
          style: {
            color: "#333",
            backgroundColor: "#f0f0f0",
            border: "1px solid #ccc",
          },
        });
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

  const { possibleMoves, handleSquareClick, selectedSquare } =
    usePossiableMoves({ onDrop, game });

  // Override boardStyles to match the image's colors
  const customBoardStyles = {
    ...boardStyles,
    customDarkSquareStyle: { backgroundColor: "#83a85d" }, // Greenish
    customLightSquareStyle: { backgroundColor: "#EBECD0" }, // Beige
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
                    Play as {playerColor === "w" ? "Black" : "White"}
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
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-zinc-500 cursor-not-allowed"
                    } text-white rounded-md transition-colors`}
                  >
                    Return to Current
                  </button>
                </div>
              </div>

              {/* Chess board with larger size */}
              <div className="w-[90%] max-w-[800px] mx-auto">
                <ChessboardContainer
                  position={deferredBoardPosition}
                  orientation={playerColor === "w" ? "white" : "black"}
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
