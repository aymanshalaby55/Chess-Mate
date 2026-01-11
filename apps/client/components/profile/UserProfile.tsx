'use client';

import { useMemo } from 'react';
import {
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Gamepad2,
  Award,
} from 'lucide-react';
import { UserStats, Game } from '@/types';

interface UserProfileProps {
  stats: UserStats;
  userName: string;
  userPicture?: string;
}

export default function UserProfile({
  stats,
  userName,
  userPicture,
}: UserProfileProps) {
  const winRateColor = useMemo(() => {
    if (stats.winRate >= 60) return 'text-green-400';
    if (stats.winRate >= 50) return 'text-yellow-400';
    return 'text-red-400';
  }, [stats.winRate]);

  const getRatingTrend = () => {
    if (stats.ratingHistory.length < 2) return 0;
    const recent = stats.ratingHistory.slice(0, 5);
    const totalChange = recent.reduce((sum, entry) => sum + entry.change, 0);
    return totalChange;
  };

  const ratingTrend = getRatingTrend();

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <div className="flex items-center gap-4 mb-6">
          {userPicture ? (
            <img
              src={userPicture}
              alt={userName}
              className="w-20 h-20 rounded-full border-2 border-green-500"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-zinc-700 flex items-center justify-center text-3xl font-bold border-2 border-green-500">
              {userName?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{userName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Award className="w-4 h-4 text-yellow-400" />
              <span className="text-xl font-bold text-white">{stats.rating}</span>
              {ratingTrend !== 0 && (
                <span
                  className={`text-sm flex items-center ${
                    ratingTrend > 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {ratingTrend > 0 ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {ratingTrend > 0 ? '+' : ''}
                  {ratingTrend}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Gamepad2 className="w-5 h-5" />}
            label="Games Played"
            value={stats.gamesPlayed}
            color="text-blue-400"
          />
          <StatCard
            icon={<Trophy className="w-5 h-5" />}
            label="Wins"
            value={stats.wins}
            color="text-green-400"
          />
          <StatCard
            icon={<Target className="w-5 h-5" />}
            label="Losses"
            value={stats.losses}
            color="text-red-400"
          />
          <StatCard
            icon={<Minus className="w-5 h-5" />}
            label="Draws"
            value={stats.draws}
            color="text-yellow-400"
          />
        </div>

        {/* Win Rate Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-zinc-400">Win Rate</span>
            <span className={winRateColor}>{stats.winRate.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
              style={{ width: `${stats.winRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Rating History Chart */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Rating History</h2>
        <RatingChart history={stats.ratingHistory} />
      </div>

      {/* Recent Games */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Games</h2>
        <div className="space-y-3">
          {stats.recentGames.length === 0 ? (
            <p className="text-zinc-500 text-center py-4">No games played yet</p>
          ) : (
            stats.recentGames.map((game) => (
              <RecentGameCard key={game.id} game={game} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-zinc-800 rounded-lg p-4">
      <div className={`${color} mb-2`}>{icon}</div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-zinc-400">{label}</p>
    </div>
  );
}

function RatingChart({
  history,
}: {
  history: { rating: number; createdAt: string }[];
}) {
  if (history.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-zinc-500">
        No rating history yet
      </div>
    );
  }

  const reversed = [...history].reverse();
  const ratings = reversed.map((h) => h.rating);
  const maxRating = Math.max(...ratings);
  const minRating = Math.min(...ratings);
  const range = maxRating - minRating || 100;

  return (
    <div className="h-40 flex items-end gap-1">
      {reversed.slice(-20).map((entry, index) => {
        const height = ((entry.rating - minRating) / range) * 100 + 10;
        const isLatest = index === reversed.slice(-20).length - 1;
        return (
          <div
            key={index}
            className="flex-1 group relative"
            style={{ height: '100%' }}
          >
            <div
              className={`absolute bottom-0 w-full rounded-t transition-all ${
                isLatest ? 'bg-green-500' : 'bg-zinc-600 hover:bg-zinc-500'
              }`}
              style={{ height: `${height}%` }}
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-zinc-700 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {entry.rating}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RecentGameCard({ game }: { game: Game }) {
  const getResultText = () => {
    switch (game.status) {
      case 'white_won':
        return 'White won';
      case 'black_won':
        return 'Black won';
      case 'draw':
        return 'Draw';
      case 'resigned':
        return 'Resigned';
      case 'timeout':
        return 'Timeout';
      case 'abandoned':
        return 'Abandoned';
      default:
        return game.status;
    }
  };

  const getResultColor = () => {
    if (game.status === 'draw') return 'text-yellow-400';
    if (game.status === 'white_won' || game.status === 'black_won') {
      return 'text-green-400';
    }
    return 'text-zinc-400';
  };

  return (
    <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg hover:bg-zinc-750 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-zinc-700 flex items-center justify-center">
          {game.isComputer ? '🤖' : '👤'}
        </div>
        <div>
          <p className="text-white font-medium">
            {game.isComputer
              ? 'vs Computer'
              : `vs ${game.player2?.name || 'Unknown'}`}
          </p>
          <p className="text-xs text-zinc-500">
            {new Date(game.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <span className={`text-sm font-medium ${getResultColor()}`}>
        {getResultText()}
      </span>
    </div>
  );
}


