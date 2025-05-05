import React from 'react';
import PieceIcon from './PieceIcon';

interface MoveDisplayProps {
  move: {
    from: string;
    to: string;
    piece: string;
    color: 'w' | 'b';
    captured?: string;
    promotion?: string;
    san: string;
  };
  selected?: boolean;
  onClick?: () => void;
}

const MoveDisplay: React.FC<MoveDisplayProps> = ({ move, selected = false, onClick }) => {
  const { piece, color, captured, promotion, san, from, to } = move;
  
  // Determine the piece type - uppercase for display
  const pieceType = piece.toUpperCase();
  const pieceCode = `${color}${pieceType}`;
  
  // Determine captured piece code if any
  const capturedCode = captured ? `${color === 'w' ? 'b' : 'w'}${captured.toUpperCase()}` : null;
  
  // Determine promotion piece code if any
  const promotionCode = promotion ? `${color}${promotion.toUpperCase()}` : null;

  return (
    <div 
      className={`
        flex items-center rounded py-1 px-2 cursor-pointer 
        transition-colors duration-150
        ${selected ? 'bg-blue-200' : 'hover:bg-blue-100'}
      `}
      onClick={onClick}
      title={`${from}-${to}`}
    >
      <div className="mr-1">
        <PieceIcon piece={pieceCode} size={18} />
      </div>
      
      <div className="font-mono text-sm">
        {san}
      </div>
      
      {captured && (
        <div className="flex items-center ml-1.5 opacity-70">
          <span className="text-xs mx-0.5">×</span>
          <PieceIcon piece={capturedCode!} size={14} />
        </div>
      )}
      
      {promotion && (
        <div className="flex items-center ml-1.5">
          <span className="text-xs mx-0.5">→</span>
          <PieceIcon piece={promotionCode!} size={16} />
        </div>
      )}
    </div>
  );
};

export default MoveDisplay; 