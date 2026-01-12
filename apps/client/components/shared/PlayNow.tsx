import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Users } from 'lucide-react';
import Link from 'next/link';

const PlayNow = () => {
    return (
        <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 hover:border-green-800 transition-colors">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">Play Now</h2>
                <Users className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-zinc-400 text-sm mb-4">
                Find an opponent and start a new game
            </p>
            <Dialog>
                <DialogTrigger className="w-full">
                    <Button className="w-full bg-green-600 hover:bg-green-700 cursor-pointer">
                        Start Match
                    </Button>
                </DialogTrigger>
                <DialogContent className="bg-white text-black ">
                    <DialogHeader className="flex flex-col gap-4">
                        <DialogTitle className="flex items-center justify-center">
                            Play Chess
                        </DialogTitle>
                        <Link href={"/play-computer"}>
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white cursor-pointer">
                                Play Vs Computer
                            </Button>
                        </Link>
                        <Link href={"/play-online"}>
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white cursor-pointer">
                                Play Online
                            </Button>
                        </Link>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PlayNow;
