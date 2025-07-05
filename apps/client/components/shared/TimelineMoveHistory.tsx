'use client';

import { FullMoveHistoryProps } from '@/types';
import React from 'react';



const FullMoveHistory: React.FC<FullMoveHistoryProps> = ({
  game,
  onMoveClick,
  currentMoveIndex = -1,
}) => {
  // Skip the first record since it's the initial position
  const moves = game.slice(1);

  // console.log('game',game);
  

  return (
    <div className="overflow-y-auto h-full">
      {moves.length === 0 ? (
        <div className="py-3 px-4 text-zinc-500">No moves yet</div>
      ) : (
        <div>
          {moves.map((move, index) => {
            // Calculate actual move number (1-based)
            const moveNumber = Math.floor(index / 2) + 1;
            
            // Determine if white or black move (even indices are white, odd are black)
            const isWhiteMove = index % 2 === 0;
            
            // Display move number only for white moves
            const shouldShowMoveNumber = isWhiteMove;
            
            // Check if this move is currently selected
            const isSelected = index === currentMoveIndex;
            
            return (
              <div
                key={`move-${index}`}
                onClick={() => onMoveClick?.(index)}
                className={`py-3 px-4 border-b border-zinc-800 cursor-pointer flex items-center justify-between ${
                  isSelected ? 'bg-zinc-800 font-bold' : 'hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center">
                  {shouldShowMoveNumber && <span className="mr-2 text-zinc-500">{moveNumber}.</span>}
                  <span className={isWhiteMove ? "text-white" : "text-gray-400"}>
                    {move.moveNotation || '?'}
                  </span>
                </div>
                
                {isSelected && (
                  <span className="text-xs text-green-400">Current</span>
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