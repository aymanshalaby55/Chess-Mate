import { Chess } from "chess.js";
import React from "react";

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
    <div className="border rounded-md p-3 bg-slate-50 shadow-sm h-full overflow-auto">
      {history.length === 0 ? (
        <div className="text-gray-500 text-center py-4">No moves yet</div>
      ) : (
        <div className="flex flex-col">
          {history.map((move, index) => {
            const isWhite = move.color === 'w';
            const moveNumber = Math.floor(index / 2) + 1;
            const isSelected = index === currentMoveIndex;
            
            return (
              <div 
                key={index}
                // onClick={() => onMoveClick?.(index)}
                className={`py-1 px-2 border-b border-gray-100 cursor-pointer text-black ${
                  isSelected ? 'bg-blue-100 font-bold' : 'hover:bg-gray-100'
                }`}
              >
                {`${moveNumber}. ${isWhite ? 'White' : 'Black'}: ${moveNotation[index]}`}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
    return (
        <div className="border rounded-md p-3 bg-slate-50 shadow-sm h-full overflow-auto">
            {history.length === 0 ? (
                <div className="text-gray-500 text-center py-4">
                    No moves yet
                </div>
            ) : (
                <div className="flex flex-col">
                    {history.map((move, index) => {
                        const isWhite = move.color === "w";
                        const moveNumber = Math.floor(index / 2) + 1;
                        const isSelected = index === currentMoveIndex;

                        return (
                            <div
                                key={index}
                                onClick={() => onMoveClick?.(index)}
                                className={`py-1 px-2 border-b border-gray-100 cursor-pointer text-black ${
                                    isSelected
                                        ? "bg-blue-100 font-bold"
                                        : "hover:bg-gray-100"
                                }`}
                            >
                                {`${moveNumber}. ${isWhite ? "White" : "Black"}: ${moveNotation[index]}`}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FullMoveHistory;
