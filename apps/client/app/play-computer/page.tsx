"use client";

import { useDeferredValue, memo, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess, Square } from "chess.js";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import useComputerGame from "@/hooks/useComputerGame";
import FullMoveHistory from "@/components/shared/TimelineMoveHistory";

// Wrap the ChessBoard component in React.memo to prevent unnecessary re-renders
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

    return (
      <div className="w-full aspect-square relative border-b-4 border-yellow-100">
        <MemoizedChessboard
          position={position}
          onPieceDrop={onPieceDrop}
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
              // Calculate position based on square name (e.g., "a1", "e4")
              const file = square.charCodeAt(0) - 97; // 'a' is 97 in ASCII
              const rank = 8 - parseInt(square[1]);

              // Calculate percentage positions to center the circle in the square
              const left =
                orientation === "white"
                  ? `${(file + 0.5) * 12.5}%`
                  : `${(7 - file + 0.5) * 12.5}%`;
              const top =
                orientation === "white"
                  ? `${(rank + 0.5) * 12.5}%`
                  : `${(7 - rank + 0.5) * 12.5}%`;

              // Check if the square has a piece and if it's an opponent's piece
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
                        : "rgb(99, 128, 70, 0.5)", // Semi-transparent grayish background
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
    onGameOver: (winner) => {
      if (winner === "draw") {
        alert("Game ended in a draw");
      } else {
        alert(`Checkmate! ${winner} wins!`);
      }
    },
  });

  // Override boardStyles to match the image's colors
  const customBoardStyles = {
    ...boardStyles,
    customDarkSquareStyle: { backgroundColor: "#739552" }, // Greenish
    customLightSquareStyle: { backgroundColor: "#EBECD0" }, // Beige
  };

  // State for tracking selected square and possible moves
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Record<string, Square[]>>(
    {}
  );

  // Handle square click to show possible moves
  const handleSquareClick = (square: Square) => {
    // If we're viewing history, don't allow interaction
    if (viewingHistory) return;

    // If we already selected this square, deselect it
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setPossibleMoves({});
      return;
    }

    // Check if the clicked square has a piece that belongs to the current player
    const piece = game.get(square);

    // If there's a piece and it belongs to the current player
    if (piece && piece.color === game.turn()) {
      // Get all possible moves for this piece
      const moves: Square[] = [];
      const legalMoves = game.moves({ square, verbose: true });

      // Extract target squares from legal moves
      legalMoves.forEach((move) => moves.push(move.to));

      // Update state with selected square and its possible circles
      setSelectedSquare(square);
      setPossibleMoves({ [square]: moves });
    } else if (selectedSquare) {
      // If we have a selected square and clicked on a valid destination
      const validDestinations = possibleMoves[selectedSquare] || [];
      if (validDestinations.includes(square)) {
        // Try to make the move
        onDrop(selectedSquare, square);
        // Reset selection
        setSelectedSquare(null);
        setPossibleMoves({});
      } else {
        // Clicked on an invalid square, reset selection
        setSelectedSquare(null);
        setPossibleMoves({});
      }
    }
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
                    setSelectedSquare(null);
                    setPossibleMoves({});
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