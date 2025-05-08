import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

const Tournaments = () => {
    return (
        <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 hover:border-green-800 transition-colors">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">Tournaments</h2>
                <Trophy className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-zinc-400 text-sm mb-4">
                Join competitive tournaments and win prizes
            </p>
            <Button
                variant="outline"
                className="w-full border-green-600 text-green-400 hover:bg-green-950"
            >
                Browse Tournaments
            </Button>
        </div>
    );
};

export default Tournaments;
