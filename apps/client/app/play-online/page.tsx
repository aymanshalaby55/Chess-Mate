'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Chessboard } from 'react-chessboard';

export default function PlayOnline() {
  const router = useRouter();

  const handleStartMatch = () => {
    const roomId = `room-${Math.floor(Math.random() * 10000)}`;
    router.push(`/play-online/room/${roomId}`);
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
            Test your skills against other players
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 mb-6">
              {/* Chess board with larger size */}
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
          <div className="h-fit bg-zinc-900 p-6 rounded-lg border border-zinc-800">
            <Button
              onClick={handleStartMatch}
              className="w-full bg-green-600 hover:bg-green-700 text-white cursor-pointer"
            >
              Start Match
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
