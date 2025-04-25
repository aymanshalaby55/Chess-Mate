import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
// import { Button } from '@/components/ui/button';
import HeroChessboard from './HeroChessBoard';

const Hero = () => {
  return (
    <div className="flex flex-col min-h-screen justify-center text-white bg-gradient-to-b from-black via-gray-900 to-black">
      <section className="relative py-56 md:py-56 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#4ade80_0,transparent_80%)]" />
        </div>
        <div className="container mx-auto max-w-7xl relative z-10">
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
                <Link
                  href="/login"
                  className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 px-8 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Play Now <ChevronRight className="ml-3 h-5 w-5" />
                </Link>
                {/* <Button
                  size="lg"
                  variant="outline"
                  className="border-green-600 text-green-400 hover:bg-green-950"
                >
                  Learn More
                </Button> */}
              </div>
            </div>
            <div className="relative h-[350px] md:h-[450px] w-full">
              <HeroChessboard />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
