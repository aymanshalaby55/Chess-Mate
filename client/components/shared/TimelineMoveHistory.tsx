import React from 'react';
import { Chess } from 'chess.js';
import MoveDisplay from './MoveDisplay';
import PieceIcon from './PieceIcon';

interface TimelineMoveHistoryProps {
  game: Chess;
  onMoveClick?: (moveIndex: number) => void;
  currentMoveIndex?: number;
}

const TimelineMoveHistory: React.FC<TimelineMoveHistoryProps> = ({
  game,
  onMoveClick,
  currentMoveIndex = -1,
}) => {
  // Get history from chess.js
  const history = game.history({ verbose: true });
  
  // Get game state information
  const gameStateColor = getGameStateColor(game);
  const gameStateIcon = getGameStateIcon(game);
  const gameStateText = getGameStateText(game);
  
  return (
    <div className="border rounded-md p-3 bg-slate-50 shadow-sm h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-3 text-center border-b pb-2">Game Timeline</h3>
      
      {history.length === 0 ? (
        <div className="text-gray-500 text-center pt-4 pb-4 flex-grow">No moves yet</div>
      ) : (
        <div className="pt-1 pb-1 relative flex-grow overflow-auto">
          <div className="min-h-full h-auto">
            {/* Timeline vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200 z-0"></div>
            
            {/* Starting position */}
            <div className="flex mb-4 relative z-10">
              <div className="w-16 flex justify-center">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-400 to-slate-700 border-2 border-slate-300 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">♔♚</span>
                </div>
              </div>
              <div className="flex-1 bg-gradient-to-r from-emerald-50 to-slate-100 rounded-md p-2 ml-3 shadow-sm">
                <div className="text-sm font-medium text-slate-700">Starting Position</div>
                <div className="text-xs text-slate-500">Game initialized</div>
              </div>
            </div>

            {/* Moves timeline */}
            <div className="space-y-3 mb-4">
              {history.map((move, index) => {
                // Calculate move number
                const moveNumber = Math.floor(index / 2) + 1;
                const isWhiteMove = index % 2 === 0;
                const isSelected = currentMoveIndex === index;
                
                return (
                  <div key={index} className="flex relative z-10">
                    {/* Timeline node */}
                    <div className="w-16 flex justify-center">
                      <div 
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isSelected
                            ? 'bg-blue-200 border-2 border-blue-500' 
                            : isWhiteMove 
                              ? 'bg-emerald-500 border-2 border-emerald-400' 
                              : 'bg-slate-700 border-2 border-slate-600'
                        }`}
                      >
                        <PieceIcon 
                          piece={`${move.color}${move.piece.toUpperCase()}`} 
                          size={14} 
                          className={isWhiteMove ? 'text-white' : 'text-white'}
                        />
                      </div>
                    </div>
                    
                    {/* Move info card */}
                    <div 
                      className={`flex-1 rounded-md p-2 ml-3 shadow-sm cursor-pointer transition-colors duration-150 ${
                        isSelected
                          ? 'bg-blue-50 border border-blue-200' 
                          : isWhiteMove
                            ? 'bg-emerald-50 border border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-slate-100 border border-slate-200 hover:bg-slate-200'
                      }`}
                      onClick={() => onMoveClick?.(index)}
                    >
                      {/* Move header */}
                      <div className="flex justify-between items-center mb-1">
                        <div className={`font-medium text-sm ${isWhiteMove ? 'text-emerald-700' : 'text-slate-700'}`}>
                          {isWhiteMove ? 'White' : 'Black'} move {moveNumber}{isWhiteMove ? '' : '.5'}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {move.from} → {move.to}
                        </div>
                      </div>
                      
                      {/* Move details */}
                      <div className="flex items-center">
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
                          selected={false}
                          onClick={() => onMoveClick?.(index)}
                        />
                      </div>
                      
                      {/* Additional info if there's a capture or promotion */}
                      {(move.captured || move.promotion) && (
                        <div className="mt-1 text-xs">
                          {move.captured && (
                            <span className="text-red-600">
                              Captured {move.color === 'w' ? 'black' : 'white'}'s {getPieceName(move.captured)}
                            </span>
                          )}
                          {move.promotion && (
                            <span className="text-emerald-600">
                              {move.captured && " • "}
                              Promoted to {getPieceName(move.promotion)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Current game state */}
            <div className="flex relative z-10">
              <div className="w-16 flex justify-center">
                <div className={getGameStateNodeClass(game)}>
                  <span className="text-white text-xs font-bold">
                    {gameStateIcon}
                  </span>
                </div>
              </div>
              <div className={getGameStateCardClass(game)}>
                <div className="text-sm font-medium text-gray-800">{gameStateText}</div>
                <div className="text-xs text-gray-600">
                  Next move: {game.turn() === 'w' ? 'White' : 'Black'} • 
                  Move {Math.floor(game.history().length / 2) + 1}
                  {game.turn() === 'b' ? '.5' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
function getPieceName(piece: string): string {
  const pieceNames = {
    p: 'pawn',
    n: 'knight',
    b: 'bishop',
    r: 'rook',
    q: 'queen',
    k: 'king'
  };
  return pieceNames[piece as keyof typeof pieceNames] || piece;
}

function getGameStateColor(game: Chess): string {
  if (game.isCheckmate()) return 'red-500';
  if (game.isStalemate()) return 'orange-500';
  if (game.isDraw()) return 'blue-500';
  if (game.isCheck()) return 'purple-500';
  return 'emerald-500';
}

function getGameStateNodeClass(game: Chess): string {
  let baseClass = "w-6 h-6 rounded-full flex items-center justify-center ";
  
  if (game.isCheckmate()) {
    return baseClass + "bg-red-500 border-2 border-red-400";
  }
  if (game.isStalemate()) {
    return baseClass + "bg-orange-500 border-2 border-orange-400";
  }
  if (game.isDraw()) {
    return baseClass + "bg-blue-500 border-2 border-blue-400";
  }
  if (game.isCheck()) {
    return baseClass + "bg-purple-500 border-2 border-purple-400";
  }
  return baseClass + "bg-emerald-500 border-2 border-emerald-400";
}

function getGameStateCardClass(game: Chess): string {
  let baseClass = "flex-1 rounded-md p-2 ml-3 shadow-sm border ";
  
  if (game.isCheckmate()) {
    return baseClass + "bg-red-50 border-red-200";
  }
  if (game.isStalemate()) {
    return baseClass + "bg-orange-50 border-orange-200";
  }
  if (game.isDraw()) {
    return baseClass + "bg-blue-50 border-blue-200";
  }
  if (game.isCheck()) {
    return baseClass + "bg-purple-50 border-purple-200";
  }
  return baseClass + "bg-emerald-50 border-emerald-200";
}

function getGameStateIcon(game: Chess): string {
  if (game.isCheckmate()) return '♚✓';
  if (game.isStalemate()) return '⊝';
  if (game.isDraw()) return '⊜';
  if (game.isCheck()) return '⚠';
  return '⏳';
}

function getGameStateText(game: Chess): string {
  if (game.isCheckmate()) return `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins`;
  if (game.isStalemate()) return 'Stalemate - Game drawn';
  if (game.isDraw()) return 'Game drawn';
  if (game.isCheck()) return `${game.turn() === 'w' ? 'White' : 'Black'} is in check`;
  return 'Game in progress';
}

export default TimelineMoveHistory; 