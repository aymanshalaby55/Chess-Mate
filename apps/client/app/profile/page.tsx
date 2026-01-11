'use client';

import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import UserProfile from '@/components/profile/UserProfile';

export default function ProfilePage() {
  // Get user data
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['userData'],
    queryFn: () => api.get('/user/info'),
  });

  // Get user stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['userStats'],
    queryFn: () => api.get('/games/stats/me'),
    enabled: !!userData?.data?.id,
  });

  const user = userData?.data;
  const stats = statsData?.data;

  const isLoading = userLoading || statsLoading;

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-green-400 flex items-center hover:underline text-sm"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>

          <h1 className="text-3xl font-bold mt-4">My Profile</h1>
          <p className="text-zinc-400 mt-2">
            View your stats and game history
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-green-400" />
          </div>
        ) : user && stats ? (
          <UserProfile
            stats={stats}
            userName={user.name}
            userPicture={user.picture}
          />
        ) : (
          <div className="text-center py-20">
            <p className="text-zinc-400">Unable to load profile data</p>
          </div>
        )}
      </main>
    </div>
  );
}


