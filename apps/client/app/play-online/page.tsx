'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Link2, Loader2, Clock, Zap, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Chessboard } from 'react-chessboard';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { TimeControl, TIME_CONTROL_LABELS } from '@/types';
import useMatchmaking from '@/hooks/useMatchmaking';

type GameMode = 'matchmaking' | 'private' | null;

const TIME_CONTROLS: { value: TimeControl; label: string; icon: React.ReactNode }[] = [
  { value: 'bullet_1min', label: '1 min', icon: <Zap className="w-4 h-4" /> },
  { value: 'bullet_2min', label: '2 min', icon: <Zap className="w-4 h-4" /> },
  { value: 'blitz_3min', label: '3 min', icon: <Clock className="w-4 h-4" /> },
  { value: 'blitz_5min', label: '5 min', icon: <Clock className="w-4 h-4" /> },
  { value: 'rapid_10min', label: '10 min', icon: <Timer className="w-4 h-4" /> },
  { value: 'rapid_15min', label: '15 min', icon: <Timer className="w-4 h-4" /> },
];

export default function PlayOnline() {
  const router = useRouter();
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [selectedTimeControl, setSelectedTimeControl] = useState<TimeControl>('blitz_5min');
  const [selectedColor, setSelectedColor] = useState<'white' | 'black' | 'random'>('random');
  const [isMounted, setIsMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get user data
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ['userData'],
    queryFn: () => api.get('/user/info'),
    enabled: isMounted,
  });

  const user = userData?.data;

  // Matchmaking hook
  const {
    isSearching,
    formattedSearchTime,
    startSearching,
    stopSearching,
  } = useMatchmaking({
    userId: user?.id || 0,
    userName: user?.name || 'Guest',
    userRating: user?.rating || 1200,
    onGameMatched: (game) => {
      router.push(`/play-online/room/${game.gameId}`);
    },
  });

  // Create private game mutation
  const createPrivateGame = useMutation({
    mutationFn: async () => {
      // Use a deterministic value instead of Math.random() during render
      const response = await api.post('/games/private', {
        side: selectedColor,
        timeControl: selectedTimeControl,
      });
      return response.data;
    },
    onSuccess: (data) => {
      router.push(`/play-online/room/${data.id}?invite=${data.inviteCode}`);
    },
  });

  const handleStartMatchmaking = () => {
    startSearching(selectedTimeControl);
  };

  const handleCreatePrivateGame = () => {
    createPrivateGame.mutate();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-green-400 flex items-center hover:underline text-sm"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>

          <h1 className="text-3xl font-bold mt-4">Play Online</h1>
          <p className="text-zinc-400 mt-2">
            Challenge players from around the world
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chess board preview */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 mb-6">
              <Chessboard
                customDarkSquareStyle={{ backgroundColor: '#739552' }}
                customLightSquareStyle={{ backgroundColor: '#EBECD0' }}
                arePiecesDraggable={false}
                position="start"
                boardOrientation={selectedColor === 'black' ? 'black' : 'white'}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
