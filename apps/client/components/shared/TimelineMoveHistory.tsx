import { Chess } from 'chess.js';
import React from 'react';

interface FullMoveHistoryProps {
  game: Chess;
  onMoveClick?: (moveIndex: number) => void;
  currentMoveIndex?: number;
}

const FullMoveHistory: React.FC<FullMoveHistoryProps> = ({
  game,
  onMoveClick,
  currentMoveIndex = -1,
}) => {
  const history = game.history({ verbose: true });
  const moveNotation = game.history();

  return (
    <div className="h-full overflow-auto bg-zinc-950 text-white">
      {history.length === 0 ? (
        <div className="text-zinc-500 text-center py-4">No moves yet</div>
      ) : (
        <div className="flex flex-col">
          {history.map((move, index) => {
            const isWhite = move.color === 'w';
            const moveNumber = Math.floor(index / 2) + 1;
            const isSelected = index === currentMoveIndex;

            return (
              <div
                key={index}
                onClick={() => onMoveClick?.(index)}
                className={`py-3 px-4 border-b border-zinc-800 cursor-pointer flex items-center ${
                  isSelected ? 'bg-zinc-800 font-bold' : 'hover:bg-zinc-900'
                }`}
              >
                <div className="flex-shrink-0 w-8 text-zinc-500">{moveNumber}.</div>
                <div className="flex-shrink-0 w-14 text-zinc-400">{isWhite ? 'White' : 'Black'}</div>
                <div className="text-green-400 font-mono">{moveNotation[index]}</div>
                {isSelected && (
                  <div className="ml-auto">
                    <span className="bg-green-600 text-xs px-2 py-1 rounded-full">Current</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FullMoveHistory;