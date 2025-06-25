import { Square } from "chess.js";
import { useState } from "react";

export function usePossiableMoves({ game, onDrop }) {
  // State for tracking selected square and possible moves
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Record<string, Square[]>>(
    {}
  );
  // Handle square click to show possible moves
  const handleSquareClick = (square: Square) => {
    // If we're viewing history, don't allow interaction
    // if (viewingHistory) return;

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
  return {
    possibleMoves,
    handleSquareClick,
    selectedSquare,
  };
}
