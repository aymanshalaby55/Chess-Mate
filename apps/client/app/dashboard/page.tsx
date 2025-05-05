'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';
import { UserData } from '@/lib/types';
import { Chessboard } from 'react-chessboard';
// import Activity from './components/Activity';
// import Stats from './components/Stats';
// import Tournaments from './components/Tournaments';
import PlayNow from './components/PlayNow';

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const router = useRouter();

  console.log(userData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/user/info');
        if (!data) {
          router.push('/login');
          toast.error('You need to login first', {
            style: { color: 'black', backgroundColor: 'white' },
          });
          return;
        }
        setUserData(data);
      } catch {
        router.push('/login');
      }
    };
    fetchData();
  }, [router]);

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
            Welcome, <span className="text-green-400">{userData?.name}</span>
          </h1>
          <p className="text-zinc-400 mt-2">Ready to play some chess?</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 mb-6">
              <h2 className="text-xl font-bold mb-4">Current Game</h2>
              <Chessboard
                customDarkSquareStyle={{ backgroundColor: '#8aad6a' }}
                customLightSquareStyle={{ backgroundColor: '#f0e9c5' }}
                arePiecesDraggable={false}
                position="start"
              />
            </div>
            {/* <Activity /> */}
          </div>
          <div>
            {/* <Stats /> */}
            <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-6">
              <PlayNow />
              {/* <Tournaments /> */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
