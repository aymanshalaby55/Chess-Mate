import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trophy, Users, Bell } from "lucide-react"
import HeroChessboard from "@/components/shared/HeroChessBoard"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-xl font-bold text-white">
                Chess<span className="text-green-400">Masters</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative text-zinc-400 hover:text-white">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 text-[10px] flex items-center justify-center">
                  3
                </span>
              </Button>
              <div className="hidden md:flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                  G
                </div>
                <span className="text-sm">Guest User</span>
              </div>
              <Button variant="outline" size="sm" className="border-zinc-700 hover:bg-zinc-800">
                <Link href="/">Sign Out</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-green-400 flex items-center hover:underline text-sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Home
          </Link>

          <h1 className="text-3xl font-bold mt-4">Welcome to your Dashboard</h1>
          <p className="text-zinc-400 mt-2">Ready to play some chess?</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 mb-6">
              <h2 className="text-xl font-bold mb-4">Current Game</h2>
              <HeroChessboard />
            </div>

            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold">
                      B
                    </div>
                    <div>
                      <div className="font-medium">vs. BlackMaster</div>
                      <div className="text-xs text-zinc-400">Won • 32 moves • 15 min ago</div>
                    </div>
                  </div>
                  <div className="text-green-400 font-bold">+15</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-black font-bold">
                      W
                    </div>
                    <div>
                      <div className="font-medium">vs. ChessWizard</div>
                      <div className="text-xs text-zinc-400">Lost • 28 moves • 2 hours ago</div>
                    </div>
                  </div>
                  <div className="text-red-400 font-bold">-12</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold">
                      B
                    </div>
                    <div>
                      <div className="font-medium">vs. GrandMaster42</div>
                      <div className="text-xs text-zinc-400">Draw • 45 moves • Yesterday</div>
                    </div>
                  </div>
                  <div className="text-zinc-400 font-bold">+2</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Your Stats</h2>
                <span className="text-xs text-green-400 font-medium px-2 py-1 bg-green-900/30 rounded">
                  Rating: 1920
                </span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-950 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-white">42</div>
                    <div className="text-xs text-zinc-400">Games Played</div>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-400">68%</div>
                    <div className="text-xs text-zinc-400">Win Rate</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-zinc-950 p-2 rounded-lg text-center">
                    <div className="text-lg font-bold text-green-400">24</div>
                    <div className="text-xs text-zinc-400">Wins</div>
                  </div>
                  <div className="bg-zinc-950 p-2 rounded-lg text-center">
                    <div className="text-lg font-bold text-red-400">11</div>
                    <div className="text-xs text-zinc-400">Losses</div>
                  </div>
                  <div className="bg-zinc-950 p-2 rounded-lg text-center">
                    <div className="text-lg font-bold text-zinc-400">7</div>
                    <div className="text-xs text-zinc-400">Draws</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-6">
              <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 hover:border-green-800 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg">Play Now</h2>
                  <Users className="h-5 w-5 text-green-400" />
                </div>
                <p className="text-zinc-400 text-sm mb-4">Find an opponent and start a new game</p>
                <Button className="w-full bg-green-600 hover:bg-green-700">Find Match</Button>
              </div>

              <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 hover:border-green-800 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg">Tournaments</h2>
                  <Trophy className="h-5 w-5 text-green-400" />
                </div>
                <p className="text-zinc-400 text-sm mb-4">Join competitive tournaments and win prizes</p>
                <Button variant="outline" className="w-full border-green-600 text-green-400 hover:bg-green-950">
                  Browse Tournaments
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
