'use client';

import { useEffect, useState } from 'react';
import { Trophy, Minus, Clock, Flag, UserX } from 'lucide-react';
import { GameOverEvent, RatingChange } from '@/types';

interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewGame?: () => void;
  onRematch?: () => void;
  gameOverData: GameOverEvent | null;
  currentUserId: number;
  player1Id: number;
  player2Id: number | null;
}

export default function GameOverModal({
  isOpen,
  onClose,
  onNewGame,
  onRematch,
  gameOverData,
  currentUserId,
  player1Id,
  player2Id,
}: GameOverModalProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShowContent(true), 100);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  if (!isOpen || !gameOverData) return null;

  const isWinner = gameOverData.winnerId === currentUserId;
  const isDraw = gameOverData.winnerId === null && gameOverData.reason === 'draw';
  const isLoser = !isWinner && !isDraw;

  const getReasonText = () => {
    switch (gameOverData.reason) {
      case 'checkmate':
        return 'by checkmate';
      case 'timeout':
        return 'on time';
      case 'resigned':
        return 'by resignation';
      case 'abandoned':
        return 'by abandonment';
      case 'draw':
        return '';
      default:
        return '';
    }
  };

  const getReasonIcon = () => {
    switch (gameOverData.reason) {
      case 'checkmate':
        return <Trophy className="w-6 h-6" />;
      case 'timeout':
        return <Clock className="w-6 h-6" />;
      case 'resigned':
        return <Flag className="w-6 h-6" />;
      case 'abandoned':
        return <UserX className="w-6 h-6" />;
      case 'draw':
        return <Minus className="w-6 h-6" />;
      default:
        return null;
    }
  };

  const getRatingChange = (): RatingChange | null => {
    if (!gameOverData.ratingChanges) return null;
    if (currentUserId === player1Id) {
      return gameOverData.ratingChanges.player1;
    }
    if (currentUserId === player2Id) {
      return gameOverData.ratingChanges.player2;
    }
    return null;
  };

  const ratingChange = getRatingChange();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-zinc-900 rounded-xl border border-zinc-700 p-6 w-full max-w-md mx-4 transform transition-all duration-300 ${
          showContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Result Icon */}
        <div
          className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
            isWinner
              ? 'bg-green-500/20 text-green-400'
              : isDraw
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-red-500/20 text-red-400'
          }`}
        >
          {getReasonIcon()}
        </div>

        {/* Result Text */}
        <h2
          className={`text-2xl font-bold text-center mb-2 ${
            isWinner
              ? 'text-green-400'
              : isDraw
                ? 'text-yellow-400'
                : 'text-red-400'
          }`}
        >
          {isWinner ? 'Victory!' : isDraw ? 'Draw!' : 'Defeat'}
        </h2>

        <p className="text-center text-zinc-400 mb-4">
          {isDraw ? 'The game ended in a draw' : `You ${isWinner ? 'won' : 'lost'} ${getReasonText()}`}
        </p>

        {/* Rating Change */}
        {ratingChange && (
          <div className="bg-zinc-800 rounded-lg p-4 mb-6">
            <p className="text-center text-zinc-400 text-sm mb-1">Rating Change</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-zinc-500">{ratingChange.oldRating}</span>
              <span className="text-xl">→</span>
              <span className="text-white font-bold">{ratingChange.newRating}</span>
              <span
                className={`text-sm font-medium ${
                  ratingChange.change > 0
                    ? 'text-green-400'
                    : ratingChange.change < 0
                      ? 'text-red-400'
                      : 'text-zinc-400'
                }`}
              >
                ({ratingChange.change > 0 ? '+' : ''}
                {ratingChange.change})
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {onRematch && (
            <button
              onClick={onRematch}
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Rematch
            </button>
          )}
          {onNewGame && (
            <button
              onClick={onNewGame}
              className="flex-1 px-4 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors"
            >
              New Game
            </button>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}


