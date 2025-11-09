'use client';

import { useDeferredValue, useState } from 'react';
import { Square } from 'chess.js';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import useOnlineGame from '@/hooks/useOnlineGame';
import FullMoveHistory from '@/components/shared/TimelineMoveHistory';
import ChessboardContainer from '@/components/shared/ChessBoardContainer';
import { Button } from '@/components/ui/button';

interface RoomPageProps {
  params: {
    id: string;
  };
}

export default function RoomPage({ params }: RoomPageProps) {
  const {
    game,
    boardPosition,
    gameMoves,
    playerColor,
    viewingHistory,
    viewingMoveIndex,
    boardStyles,
    onDrop,
    resetGame,
    switchColor,
    handleMoveClick,
    returnToCurrentPosition,
    isConnected,
    isMyTurn,
    opponentConnected,
    gameStarted,
  } = useOnlineGame({
    onGameOver: (winner) => {
      if (winner === 'draw') {
        alert('Game ended in a draw');
      } else {
        alert(`Checkmate! ${winner} wins!`);
      }
    },
    gameId: params.id,
    playerId: `player-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    serverUrl: 'http://localhost:4040',
  });

  // Override boardStyles to match the image's colors
  const customBoardStyles = {
    ...boardStyles,
    customDarkSquareStyle: { backgroundColor: '#739552' }, // Greenish
    customLightSquareStyle: { backgroundColor: '#EBECD0' }, // Beige
  };

  // State for tracking selected square and possible moves
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Record<string, Square[]>>(
    {}
  );

  // Handle square click to show possible moves
  const handleSquareClick = (square: Square) => {
    // If we're viewing history, don't allow interaction
    if (viewingHistory) return;

    // If we already selected this square, deselect it
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setPossibleMoves({});
      return;
    }

    // Check if the clicked square has a piece that belongs to the current player
    const piece = game.get(square);

    // If there's a piece and it belongs to the current player
    if (piece && piece.color === game.turn()) {
      // Get all possible moves for this piece
      const moves: Square[] = [];
      const legalMoves = game.moves({ square, verbose: true });

      // Extract target squares from legal moves
      legalMoves.forEach((move) => moves.push(move.to));

      // Update state with selected square and its possible circles
      setSelectedSquare(square);
      setPossibleMoves({ [square]: moves });
    } else if (selectedSquare) {
      // If we have a selected square and clicked on a valid destination
      const validDestinations = possibleMoves[selectedSquare] || [];
      if (validDestinations.includes(square)) {
        // Try to make the move
        onDrop(selectedSquare, square);
        // Reset selection
        setSelectedSquare(null);
        setPossibleMoves({});
      } else {
        // Clicked on an invalid square, reset selection
        setSelectedSquare(null);
        setPossibleMoves({});
      }
    }
  };

  // Use deferred value to reduce rendering pressure
  const deferredBoardPosition = useDeferredValue(boardPosition);

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <Link
            href="/play-online"
            className="text-green-400 flex items-center hover:underline text-sm"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>

          <h1 className="text-3xl font-bold mt-4">Game Room: {params.id}</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-zinc-400">
              {isConnected ? 'Connected to server' : 'Connecting...'}
            </p>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            {opponentConnected && (
              <p className="text-green-400 text-sm">Opponent connected</p>
            )}
          </div>
        </div>

        {/* Player Names Section */}
        <div className="mb-6">
          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="text-lg font-semibold text-white">
                  {playerColor === 'w' ? 'You (White)' : 'Opponent (White)'}
                </div>
                <div className="text-sm text-zinc-400">White Pieces</div>
                <div className={`text-xs ${isMyTurn && playerColor === 'w' ? 'text-green-400' : 'text-zinc-500'}`}>
                  {isMyTurn && playerColor === 'w' ? 'Your Turn' : 'Waiting...'}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-zinc-600">VS</div>
                <div className="text-xs text-zinc-500 mt-1">
                  {gameStarted ? 'Game Started' : 'Waiting for opponent...'}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-white">
                  {playerColor === 'b' ? 'You (Black)' : 'Opponent (Black)'}
                </div>
                <div className="text-sm text-zinc-400">Black Pieces</div>
                <div className={`text-xs ${isMyTurn && playerColor === 'b' ? 'text-green-400' : 'text-zinc-500'}`}>
                  {isMyTurn && playerColor === 'b' ? 'Your Turn' : 'Waiting...'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 mb-6">
              {/* Chess board with larger size */}
              <div className="w-[100%] max-w-[800px] mx-auto">
                {gameStarted ? (
                  <ChessboardContainer
                    position={deferredBoardPosition}
                    orientation={playerColor === 'w' ? 'white' : 'black'}
                    onPieceDrop={onDrop}
                    boardStyles={customBoardStyles}
                    selectedSquare={selectedSquare}
                    possibleMoves={possibleMoves}
                    onSquareClick={handleSquareClick}
                    game={game}
                  />
                ) : (
                  <div className="aspect-square bg-zinc-800 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">♔</div>
                      <div className="text-xl text-zinc-400 mb-2">Waiting for opponent...</div>
                      <div className="text-sm text-zinc-500">
                        Share this room link with another player
                      </div>
                      <div className="text-xs text-zinc-600 mt-2">
                        Room ID: {params.id}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Move history component */}
          <div className="w-full">
            <div className="bg-zinc-900 p-0 rounded-lg border border-zinc-800 mb-6 overflow-hidden">
              <div className="border-b border-zinc-800">
                <p className="px-4 py-3 text-base font-medium flex-1 w-full text-start transition-colors text-zinc-400">
                  Move History
                </p>
              </div>
              <div className="h-[500px]">
                <FullMoveHistory
                  game={gameMoves}
                  onMoveClick={(index) => {
                    handleMoveClick(index);
                    setSelectedSquare(null);
                    setPossibleMoves({});
                  }}
                  currentMoveIndex={viewingMoveIndex}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 