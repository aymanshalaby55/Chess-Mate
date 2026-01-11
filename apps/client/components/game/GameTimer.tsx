'use client';

import { useEffect, useState, useCallback } from 'react';
import { Clock } from 'lucide-react';

interface GameTimerProps {
  timeLeft: number; // in milliseconds
  isActive: boolean;
  playerName: string;
  playerRating?: number;
  playerPicture?: string;
  isCurrentPlayer?: boolean;
  onTimeout?: () => void;
}

export default function GameTimer({
  timeLeft,
  isActive,
  playerName,
  playerRating,
  playerPicture,
  isCurrentPlayer = false,
  onTimeout,
}: GameTimerProps) {
  const [displayTime, setDisplayTime] = useState(timeLeft);

  useEffect(() => {
    setDisplayTime(timeLeft);
  }, [timeLeft]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setDisplayTime((prev) => {
        const newTime = Math.max(0, prev - 100);
        if (newTime === 0 && onTimeout) {
          onTimeout();
        }
        return newTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, onTimeout]);

  const formatTime = useCallback((ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const tenths = Math.floor((ms % 1000) / 100);

    if (minutes >= 1) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return `0:${seconds.toString().padStart(2, '0')}.${tenths}`;
  }, []);

  const isLowTime = displayTime < 30000; // Less than 30 seconds
  const isCriticalTime = displayTime < 10000; // Less than 10 seconds

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg transition-all ${
        isActive
          ? isCriticalTime
            ? 'bg-red-900/50 border border-red-500'
            : isLowTime
              ? 'bg-yellow-900/30 border border-yellow-600'
              : 'bg-zinc-800 border border-green-500'
          : 'bg-zinc-900 border border-zinc-700'
      }`}
    >
      <div className="flex items-center gap-3">
        {playerPicture ? (
          <img
            src={playerPicture}
            alt={playerName}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-lg font-bold">
            {playerName?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        <div>
          <p className={`font-medium ${isCurrentPlayer ? 'text-green-400' : 'text-white'}`}>
            {playerName}
          </p>
          {playerRating && (
            <p className="text-sm text-zinc-400">{playerRating}</p>
          )}
        </div>
      </div>

      <div
        className={`flex items-center gap-2 font-mono text-2xl font-bold ${
          isCriticalTime
            ? 'text-red-400 animate-pulse'
            : isLowTime
              ? 'text-yellow-400'
              : 'text-white'
        }`}
      >
        <Clock className={`w-5 h-5 ${isActive ? 'animate-spin-slow' : ''}`} />
        {formatTime(displayTime)}
      </div>
    </div>
  );
}


