'use client';

import React, { useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChessKing,
  faChessQueen,
  faChessRook,
  faChessBishop,
  faChessKnight,
  faChessPawn,
} from '@fortawesome/free-solid-svg-icons';
import { JSX } from 'react';

// Chess piece icons for move notation
const pieceIcons: { [key: string]: JSX.Element } = {
  K: <FontAwesomeIcon icon={faChessKing} />,
  Q: <FontAwesomeIcon icon={faChessQueen} />,
  R: <FontAwesomeIcon icon={faChessRook} />,
  B: <FontAwesomeIcon icon={faChessBishop} />,
  N: <FontAwesomeIcon icon={faChessKnight} />,
  P: <FontAwesomeIcon icon={faChessPawn} />,
  k: <FontAwesomeIcon icon={faChessKing} />,
  q: <FontAwesomeIcon icon={faChessQueen} />,
  r: <FontAwesomeIcon icon={faChessRook} />,
  b: <FontAwesomeIcon icon={faChessBishop} />,
  n: <FontAwesomeIcon icon={faChessKnight} />,
  p: <FontAwesomeIcon icon={faChessPawn} />,
};

// Format move notation to include piece icons
const formatMoveNotation = (notation: string | undefined): React.ReactNode => {
  if (!notation) return <span className="text-zinc-500">?</span>;

  const pieceSymbol = pieceIcons[notation[0]];
  if (pieceSymbol) {
    return (
      <>
        {pieceSymbol} {notation.slice(1)}
      </>
    );
  }

  return notation;
};

interface MoveRecord {
  fen: string;
  timestamp: number;
  moveNotation?: string;
}

interface FullMoveHistoryProps {
  game: MoveRecord[];
  onMoveClick?: (moveIndex: number) => void;
  currentMoveIndex?: number;
}

const FullMoveHistory: React.FC<FullMoveHistoryProps> = ({
  game,
  onMoveClick,
  currentMoveIndex = -1,
}) => {
  const moves = game.slice(1); // Skip initial position
  const scrollRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onMoveClick?.(index);
      }
    },
    [onMoveClick]
  );

  // Auto-scroll to the latest move or selected move
  React.useEffect(() => {
    if (scrollRef.current) {
      const selectedElement = scrollRef.current.querySelector(
        `[data-move-index="${currentMoveIndex}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (moves.length > 0) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [currentMoveIndex, moves.length]);

  // Memoize move pairs for performance
  const movePairs = React.useMemo(() => {
    return moves.reduce((rows, move, index) => {
      const moveNumber = Math.floor(index / 2) + 1;
      if (index % 2 === 0) {
        rows.push({
          moveNumber,
          whiteMove: move,
          blackMove: moves[index + 1] || null,
          whiteIndex: index,
          blackIndex: index + 1,
        });
      }
      return rows;
    }, [] as Array<{ moveNumber: number; whiteMove: MoveRecord; blackMove: MoveRecord | null; whiteIndex: number; blackIndex: number }>);
  }, [moves]);

  return (
    <div
      className="bg-zinc-900 rounded-lg shadow-lg h-96 overflow-y-auto text-sm font-mono text-zinc-200"
      ref={scrollRef}
      role="region"
      aria-label="Chess move history"
    >
      {moves.length === 0 ? (
        <div className="py-4 px-6 text-zinc-500 text-center">No moves yet</div>
      ) : (
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="bg-zinc-800 text-zinc-400 text-xs sticky top-0">
              <th className="w-12 py-2 px-3 text-left">Move</th>
              <th className="w-1/2 py-2 px-3 text-left">White</th>
              <th className="w-1/2 py-2 px-3 text-left">Black</th>
            </tr>
          </thead>
          <tbody>
            {movePairs.map(
              ({ moveNumber, whiteMove, blackMove, whiteIndex, blackIndex }) => (
                <tr
                  key={`move-pair-${moveNumber}`}
                  className="border-b border-zinc-800 last:border-0"
                >
                  <td className="w-12 py-2 px-3 text-zinc-500 align-top">
                    {moveNumber}.
                  </td>
                  <td
                    className={`w-1/2 py-2 px-3 cursor-pointer transition-colors ${
                      whiteIndex === currentMoveIndex
                        ? 'bg-zinc-700 font-bold'
                        : 'hover:bg-zinc-800'
                    }`}
                    onClick={() => onMoveClick?.(whiteIndex)}
                    onKeyDown={(e) => handleKeyDown(e, whiteIndex)}
                    tabIndex={0}
                    role="button"
                    aria-label={`White move ${moveNumber}: ${whiteMove.moveNotation || 'select'}`}
                    data-move-index={whiteIndex}
                  >
                    {formatMoveNotation(whiteMove.moveNotation)}
                    {whiteIndex === currentMoveIndex && (
                      <span className="ml-2 text-xs text-green-400">[Current]</span>
                    )}
                  </td>
                  <td
                    className={`w-1/2 py-2 px-3 cursor-pointer transition-colors ${
                      blackMove && blackIndex === currentMoveIndex
                        ? 'bg-zinc-700 font-bold'
                        : blackMove
                        ? 'hover:bg-zinc-800'
                        : ''
                    }`}
                    onClick={() => blackMove && onMoveClick?.(blackIndex)}
                    onKeyDown={(e) => blackMove && handleKeyDown(e, blackIndex)}
                    tabIndex={blackMove ? 0 : -1}
                    role={blackMove ? 'button' : 'cell'}
                    aria-label={
                      blackMove
                        ? `Black move ${moveNumber}: ${blackMove.moveNotation || 'select'}`
                        : 'No black move'
                    }
                    data-move-index={blackMove ? blackIndex : undefined}
                  >
                    {blackMove ? (
                      <>
                        {formatMoveNotation(blackMove.moveNotation)}
                        {blackIndex === currentMoveIndex && (
                          <span className="ml-2 text-xs text-green-400">[Current]</span>
                        )}
                      </>
                    ) : (
                      <span className="text-zinc-600">-</span>
                    )}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FullMoveHistory;