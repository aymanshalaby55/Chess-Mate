import { ChessboardContainerProps } from '@/types';
import { Square } from 'chess.js';
import { memo } from 'react';
import { Chessboard } from 'react-chessboard';
import { toast } from 'sonner';

const MemoizedChessboard = memo(Chessboard);

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
  }: ChessboardContainerProps) => {
    const highlightStyles: Record<string, { backgroundColor: string }> = {};

    if (selectedSquare) {
      highlightStyles[selectedSquare] = { backgroundColor: '#FFFF99' };
    }

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
          onPieceDrop={handlePieceDrop}
          customDarkSquareStyle={boardStyles.customDarkSquareStyle}
          customLightSquareStyle={boardStyles.customLightSquareStyle}
          boardOrientation={orientation}
          animationDuration={boardStyles.animationDuration}
          onSquareClick={onSquareClick}
          customSquareStyles={highlightStyles}
        />

        {selectedSquare && (
          <div className="absolute inset-0 pointer-events-none">
            {(possibleMoves[selectedSquare] || []).map((square) => {
              const file = square.charCodeAt(0) - 97;
              const rank = 8 - parseInt(square[1]);
              const left =
                orientation === 'white'
                  ? `${(file + 0.5) * 12.5}%`
                  : `${(7 - file + 0.5) * 12.5}%`;
              const top =
                orientation === 'white'
                  ? `${(rank + 0.5) * 12.5}%`
                  : `${(7 - rank + 0.5) * 12.5}%`;

              return (
                <div
                  key={square}
                  className={`absolute z-10 w-8 h-8 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${
                    square === selectedSquare ? 'bg-transparent' : ''
                  }`}
                  style={{
                    left,
                    top,
                    backgroundColor:
                      square === selectedSquare
                        ? 'transparent'
                        : 'rgb(99, 128, 70, 0.5)',
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

ChessboardContainer.displayName = 'ChessboardContainer';

export default ChessboardContainer;
