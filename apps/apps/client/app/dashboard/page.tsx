'use client';
import api from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Chessboard } from 'react-chessboard';
import PlayNow from './components/PlayNow';
import { useQuery } from '@tanstack/react-query';

export default function DashboardPage() {
const { data: userData } = useQuery({
    queryKey: ['userData'],
    queryFn: () => api.get('/user/info'),
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="text-green-400 flex items-center hover:underline text-sm"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold mt-4">
            Welcome, <span className="text-green-400">{userData?.data?.name}</span>
          </h1>
          <p className="text-zinc-400 mt-2">Ready to play some chess?</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 mb-6">
              <Chessboard
                customDarkSquareStyle={{
                  backgroundColor: '#8aad6a',
                }}
                customLightSquareStyle={{
                  backgroundColor: '#f0e9c5',
                }}
                arePiecesDraggable={false}
                position="start"
              />
            </div>
          </div>
          <div>
            <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-6">
              <PlayNow />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
