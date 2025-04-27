'use client';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HeroChessboard from './HeroChessBoard';
import { Button } from '../ui/button';

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
    <div className="flex flex-col min-h-screen justify-center text-white bg-gradient-to-b from-black via-gray-900 to-black">
        <section className="container mx-auto max-w-7xl px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
                Master the Game of <span className="text-green-400">Kings</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
                Elevate your chess skills with our modern platform. Play, learn,
                and compete with players from around the world.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 pt-6">
                <Button
                  size="lg"
                  onClick={handlePlayNowClick}
                  // disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white cursor-pointer text-lg"
                >
                  Play Now <ChevronRight className="ml-3 h-5 w-5 font-bold" />
                </Button>
              </div>
            </div>
            <div className="relative h-[350px] md:h-[450px] w-full">
              <HeroChessboard />
            </div>
          </div>
        </section>
    </div>
  );
};

export default Hero;
