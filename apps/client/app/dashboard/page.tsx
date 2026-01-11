"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Link2,
  Loader2,
  Clock,
  Zap,
  Timer,
} from "lucide-react";
import { Chessboard } from "react-chessboard";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { TimeControl, TIME_CONTROL_LABELS } from "@/types";
import Image from "next/image";

// Define type for game mode
type GameMode = "matchmaking" | "private" | null;

const TIME_CONTROLS: {
  value: TimeControl;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "bullet_1min", label: "1 min", icon: <Zap className="w-4 h-4" /> },
  { value: "bullet_2min", label: "2 min", icon: <Zap className="w-4 h-4" /> },
  { value: "blitz_3min", label: "3 min", icon: <Clock className="w-4 h-4" /> },
  { value: "blitz_5min", label: "5 min", icon: <Clock className="w-4 h-4" /> },
  {
    value: "rapid_10min",
    label: "10 min",
    icon: <Timer className="w-4 h-4" />,
  },
  {
    value: "rapid_15min",
    label: "15 min",
    icon: <Timer className="w-4 h-4" />,
  },
];

// Dummy implementation for matchmaking state, replace with actual implementation or logic
function useMatchmaking({
  onGameMatched,
}: {
  onGameMatched: (game: { gameId: number }) => void;
}) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchStart, setSearchStart] = useState<Date | null>(null);

  // Used to count seconds since search started
  const [formattedSearchTime, setFormattedSearchTime] = useState("00:00");
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isSearching && searchStart) {
      interval = setInterval(() => {
        const diff = Math.floor((Date.now() - searchStart.getTime()) / 1000);
        const min = String(Math.floor(diff / 60)).padStart(2, "0");
        const sec = String(diff % 60).padStart(2, "0");
        setFormattedSearchTime(`${min}:${sec}`);
      }, 1000);
    } else {
      setFormattedSearchTime("00:00");
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSearching, searchStart]);

  function startSearching() {
    setIsSearching(true);
    setSearchStart(new Date());
    // Simulate a match found after 3s
    setTimeout(() => {
      setIsSearching(false);
      setSearchStart(null);
      onGameMatched?.({ gameId: 1 });
    }, 300000); // 5 min, adjust or remove for real code
  }
  function stopSearching() {
    setIsSearching(false);
    setSearchStart(null);
    setFormattedSearchTime("00:00");
  }
  return { isSearching, formattedSearchTime, startSearching, stopSearching };
}

export default function DashboardPage() {
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [selectedTimeControl, setSelectedTimeControl] =
    useState<TimeControl>("blitz_5min");
  const [selectedColor, setSelectedColor] = useState<
    "white" | "black" | "random"
  >("random");
  const [isMounted, setIsMounted] = useState(false);

  // Hydration fix to avoid mismatch between server/client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get user info
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ["userData"],
    queryFn: () => api.get("/user/info"),
    enabled: isMounted,
  });
  const user = userData?.data;

  // Matchmaking hook
  const { isSearching, formattedSearchTime, startSearching, stopSearching } =
    useMatchmaking({
      onGameMatched: () => {
        // For now, just alert, but on actual app, redirect to game
        // router.push(`/play-online/room/${game.gameId}`);
        alert("You have been matched! (Replace with navigation logic)");
      },
    });

  // Private game creation mutation
  const createPrivateGame = useMutation({
    mutationFn: (gameData: {
      timeControl: TimeControl;
      color: "white" | "black" | "random";
    }) => api.post("/games/create-private", gameData),
  });

  // Create private game handler
  const handleCreatePrivateGame = () => {
    createPrivateGame.mutate({
      timeControl: selectedTimeControl,
      color: selectedColor,
    });
  };

  // Start matchmaking handler
  const handleStartMatchmaking = () => {
    startSearching();
  };

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
            Welcome,{" "}
            {isMounted && userData?.data?.name ? (
              <span className="text-green-400">{userData.data.name}</span>
            ) : (
              <span className="text-green-400">...</span>
            )}
          </h1>
          <p className="text-zinc-400 mt-2">Ready to play some chess?</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 mb-6">
              <Chessboard
                customDarkSquareStyle={{
                  backgroundColor: "#8aad6a",
                }}
                customLightSquareStyle={{
                  backgroundColor: "#f0e9c5",
                }}
                arePiecesDraggable={false}
                position="start"
              />
            </div>
          </div>
          <div>
            <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-6">
              {/* <PlayNow /> */}
              <div className="space-y-4">
                {/* User info - only render after mount to avoid hydration mismatch */}
                {isMounted && user && (
                  <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                    <div className="flex items-center gap-3">
                      {user.picture ? (
                        <Image
                          src={user.picture}
                          alt={user.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center text-xl font-bold">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-sm text-zinc-400">
                          Rating: {user.rating || 1200}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading state for user info */}
                {isMounted && isUserLoading && (
                  <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-zinc-700 animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-zinc-700 rounded animate-pulse" />
                        <div className="h-3 w-16 bg-zinc-700 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Game mode selection */}
                {!gameMode && !isSearching && (
                  <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 space-y-4">
                    <h2 className="text-lg font-semibold">Choose Game Mode</h2>

                    <button
                      onClick={() => setGameMode("matchmaking")}
                      className="w-full cursor-pointer p-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center gap-4 transition-colors"
                    >
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Quick Match</p>
                        <p className="text-sm text-zinc-400">
                          Find an opponent automatically
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => setGameMode("private")}
                      className="w-full cursor-pointer p-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center gap-4 transition-colors"
                    >
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Link2 className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Play with Friend</p>
                        <p className="text-sm text-zinc-400">
                          Create a private game link
                        </p>
                      </div>
                    </button>
                    <Link
                      href="/play-computer"
                      className="w-full p-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center gap-4 transition-colors"
                    >
                      <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
                        <span
                          role="img"
                          aria-label="Offline"
                          className="text-xl"
                        >
                          🧑‍💻
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Offline Game</p>
                        <p className="text-sm text-zinc-400">
                          Practice against computer
                        </p>
                      </div>
                    </Link>
                  </div>
                )}

                {/* Time control selection */}
                {gameMode && !isSearching && (
                  <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">Time Control</h2>
                      <button
                        onClick={() => setGameMode(null)}
                        className="text-sm text-zinc-400 hover:text-white"
                      >
                        ← Back
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {TIME_CONTROLS.map((tc) => (
                        <button
                          key={tc.value}
                          onClick={() => setSelectedTimeControl(tc.value)}
                          className={`p-3 rounded-lg flex items-center gap-2 transition-colors ${
                            selectedTimeControl === tc.value
                              ? "bg-green-600 text-white"
                              : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                          }`}
                        >
                          {tc.icon}
                          <span>{tc.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Color selection for private games */}
                    {gameMode === "private" && (
                      <>
                        <h3 className="text-sm font-medium text-zinc-400 mt-4">
                          Play as
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                          {(["white", "random", "black"] as const).map(
                            (color) => (
                              <button
                                key={color}
                                onClick={() => setSelectedColor(color)}
                                className={`p-3 rounded-lg capitalize transition-colors ${
                                  selectedColor === color
                                    ? "bg-green-600 text-white"
                                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                                }`}
                              >
                                {color === "random"
                                  ? "🎲 Random"
                                  : color === "white"
                                    ? "⬜ White"
                                    : "⬛ Black"}
                              </button>
                            )
                          )}
                        </div>
                      </>
                    )}

                    {/* Action button */}
                    <Button
                      onClick={
                        gameMode === "matchmaking"
                          ? handleStartMatchmaking
                          : handleCreatePrivateGame
                      }
                      disabled={createPrivateGame.isPending}
                      className="w-full bg-green-600 hover:bg-green-700 text-white mt-4"
                    >
                      {createPrivateGame.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : gameMode === "matchmaking" ? (
                        "Find Match"
                      ) : (
                        "Create Game"
                      )}
                    </Button>
                  </div>
                )}

                {/* Searching state */}
                {isSearching && (
                  <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-600/20 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
                    </div>
                    <h2 className="text-lg font-semibold mb-2">
                      Finding Opponent...
                    </h2>
                    <p className="text-zinc-400 mb-1">
                      {TIME_CONTROL_LABELS[selectedTimeControl]}
                    </p>
                    <p className="text-2xl font-mono text-green-400 mb-4">
                      {formattedSearchTime}
                    </p>
                    <Button
                      onClick={stopSearching}
                      variant="outline"
                      className="border-zinc-700 hover:bg-zinc-800"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
