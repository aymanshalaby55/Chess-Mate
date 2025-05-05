import React from 'react';
import { Chess } from 'chess.js';
import MoveDisplay from '../shared/MoveDisplay';

interface DetailedMoveHistoryProps {
  game: Chess;
  onMoveClick?: (moveIndex: number) => void;
  currentMoveIndex?: number;
}

const DetailedMoveHistory: React.FC<DetailedMoveHistoryProps> = ({
  game,
  onMoveClick,
  currentMoveIndex = -1,
}) => {
  // Get history from chess.js
  const history = game.history({ verbose: true });
  
  return (
    <div className="border rounded-md p-4 bg-white shadow-sm h-full overflow-auto">
      <h3 className="text-lg font-semibold mb-4 text-center border-b pb-2">Move List</h3>
      
      {history.length === 0 ? (
        <div className="text-gray-500 text-center pt-4 pb-4">No moves yet</div>
      ) : (
        <div className="space-y-2 overflow-y-auto max-h-[400px] p-1">
          {history.map((move, index) => {
            // Calculate move number
            const moveNumber = Math.floor(index / 2) + 1;
            // Determine if it's white's or black's move
            const isWhiteMove = index % 2 === 0;
            
            return (
              <div key={index} className="flex items-center">
                {isWhiteMove && (
                  <div className="w-8 text-sm text-gray-500 font-medium">
                    {moveNumber}.
                  </div>
                )}
                {!isWhiteMove && (
                  <div className="w-8 text-sm text-gray-500 font-medium opacity-0">
                    {moveNumber}.
                  </div>
                )}
                
                <div className={`flex-1 ${isWhiteMove ? 'text-left' : 'text-left'}`}>
                  <MoveDisplay
                    move={{
                      from: move.from,
                      to: move.to,
                      piece: move.piece,
                      color: move.color,
                      captured: move.captured,
                      promotion: move.promotion,
                      san: game.history()[index],
                    }}
                    selected={currentMoveIndex === index}
                    onClick={() => onMoveClick?.(index)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Current game status */}
      <div className="mt-4 pt-3 border-t text-sm">
        {game.isCheckmate() ? (
          <div className="text-red-600 font-semibold text-center">Checkmate</div>
        ) : game.isDraw() ? (
          <div className="text-blue-600 font-semibold text-center">Draw</div>
        ) : game.isStalemate() ? (
          <div className="text-orange-600 font-semibold text-center">Stalemate</div>
        ) : game.isCheck() ? (
          <div className="text-purple-600 font-semibold text-center">Check</div>
        ) : (
          <div className="text-gray-600 flex items-center justify-between">
            <span>Turn: {game.turn() === 'w' ? 'White' : 'Black'}</span>
            <span>Fullmove: {Math.floor(game.history().length / 2) + 1}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailedMoveHistory; 