'use client';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Chessboard } from 'react-chessboard';

const Hero = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if the user is logged in by verifying the presence of a token or user data
    const token = document.cookie.includes('accesstoken');
    setIsLoggedIn(token);
  }, []);

  const handlePlayNowClick = () => {
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="flex flex-col min-h-screen justify-start text-white">
      <section className="container mx-auto max-w-7xl px-4 py-16">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
              Master the Game of <span className="text-green-400">Kings</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
              Elevate your chess skills with our modern platform. Play, learn,
              and compete with players from around the world.
            </p>
            <Button
              size="lg"
              onClick={handlePlayNowClick}
              // disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white cursor-pointer text-lg flex gap-1 items-center"
            >
              <span>Play Now </span>
              <ChevronRight size={18} />
            </Button>
          </div>
          <div className="relative h-[350px] md:h-[450px] w-full">
            <Chessboard
              customDarkSquareStyle={{ backgroundColor: '#8aad6a' }}
              customLightSquareStyle={{ backgroundColor: '#f0e9c5' }}
              arePiecesDraggable={false}
              position="start"
              customBoardStyle={{
                width: '100%',
                height: '100%',
                maxWidth: '450px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
