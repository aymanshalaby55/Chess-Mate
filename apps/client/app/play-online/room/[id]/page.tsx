'use client';

import { useDeferredValue, useState, useEffect, use } from 'react';
import { Square } from 'chess.js';
import Link from 'next/link';
import { ArrowLeft, Flag, Handshake, Copy, Check } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import useOnlineGame from '@/hooks/useOnlineGame';
import FullMoveHistory from '@/components/shared/TimelineMoveHistory';
import ChessboardContainer from '@/components/shared/ChessBoardContainer';
import GameTimer from '@/components/game/GameTimer';
import GameChat from '@/components/game/GameChat';
import InviteLink from '@/components/game/InviteLink';
import GameOverModal from '@/components/game/GameOverModal';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

interface RoomPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  // Unwrap the params Promise using React.use()
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get('invite');
  const gameId = parseInt(resolvedParams.id);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get user data
  const { data: userData } = useQuery({
    queryKey: ['userData'],
    queryFn: () => api.get('/user/info'),
    enabled: isMounted,
  });

  const user = userData?.data;

  const {
    game,
    boardPosition,
    gameMoves,
    playerColor,
    viewingHistory,
    viewingMoveIndex,
    boardStyles,
    onDrop,
    handleMoveClick,
    returnToCurrentPosition,
    isConnected,
    isMyTurn,
    gameStarted,
    opponent,
    whiteTimeLeft,
    blackTimeLeft,
    chatMessages,
    gameOverData,
    sendMessage,
    resign,
    offerDraw,
  } = useOnlineGame({
    onGameOver: () => {
      setShowGameOver(true);
    },
    gameId: gameId,
    inviteCode: inviteCode, // Pass invite code for joining via invite
    userId: user?.id,
    userName: user?.name,
    serverUrl: 'http://localhost:4040',
  });

  const [showGameOver, setShowGameOver] = useState(false);
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // State for tracking selected square and possible moves
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Record<string, Square[]>>({});

  // Handle square click to show possible moves
  const handleSquareClick = (square: Square) => {
    if (viewingHistory || !isMyTurn || !gameStarted) return;

    if (selectedSquare === square) {
      setSelectedSquare(null);
      setPossibleMoves({});
      return;
    }

    const piece = game.get(square);

    if (piece && piece.color === game.turn()) {
      const moves: Square[] = [];
      const legalMoves = game.moves({ square, verbose: true });
      legalMoves.forEach((move) => moves.push(move.to));

      setSelectedSquare(square);
      setPossibleMoves({ [square]: moves });
    } else if (selectedSquare) {
      const validDestinations = possibleMoves[selectedSquare] || [];
      if (validDestinations.includes(square)) {
        onDrop(selectedSquare, square);
        setSelectedSquare(null);
        setPossibleMoves({});
      } else {
        setSelectedSquare(null);
        setPossibleMoves({});
      }
    }
  };

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return;
    const link = `${window.location.origin}/play-online/room/${gameId}${inviteCode ? `?invite=${inviteCode}` : ''}`;
    await navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleResign = () => {
    resign();
    setShowResignConfirm(false);
  };

  const deferredBoardPosition = useDeferredValue(boardPosition);

  const customBoardStyles = {
    ...boardStyles,
    customDarkSquareStyle: { backgroundColor: '#739552' },
    customLightSquareStyle: { backgroundColor: '#EBECD0' },
  };

  // Determine player info
  const myInfo = {
    name: user?.name || 'You',
    rating: user?.rating,
    picture: user?.picture,
  };

  const opponentInfo = opponent || {
    name: 'Waiting...',
    rating: undefined,
    picture: undefined,
  };

  const whitePlayer = playerColor === 'w' ? myInfo : opponentInfo;
  const blackPlayer = playerColor === 'b' ? myInfo : opponentInfo;

  // Generate invite link safely (only on client)
  const inviteLinkUrl = isMounted && typeof window !== 'undefined'
    ? `${window.location.origin}/play-online/room/${gameId}?invite=${inviteCode}`
    : '';

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-green-400 flex items-center hover:underline text-sm"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Lobby
          </Link>

          <div className="flex items-center justify-between mt-4">
            <div>
              <h1 className="text-2xl font-bold">
                {gameStarted ? (
                  <>
                    <span className={playerColor === 'w' ? 'text-green-400' : 'text-white'}>
                      {whitePlayer.name}
                    </span>
                    {' vs '}
                    <span className={playerColor === 'b' ? 'text-green-400' : 'text-white'}>
                      {blackPlayer.name}
                    </span>
                  </>
                ) : (
                  'Waiting for opponent...'
                )}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-sm text-zinc-400">
                  {isConnected ? 'Connected' : 'Connecting...'}
                </span>
                {gameStarted && (
                  <span className={`text-sm ${isMyTurn ? 'text-green-400' : 'text-zinc-500'}`}>
                    {isMyTurn ? "Your turn" : "Opponent's turn"}
                  </span>
                )}
              </div>
            </div>

            {/* Game actions */}
            {gameStarted && !gameOverData && (
              <div className="flex gap-2">
                <Button
                  onClick={offerDraw}
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 hover:bg-zinc-800"
                >
                  <Handshake className="w-4 h-4 mr-1" />
                  Offer Draw
                </Button>
                <Button
                  onClick={() => setShowResignConfirm(true)}
                  variant="outline"
                  size="sm"
                  className="border-red-900 text-red-400 hover:bg-red-900/20"
                >
                  <Flag className="w-4 h-4 mr-1" />
                  Resign
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Opponent timer (top) */}
            <GameTimer
              timeLeft={playerColor === 'w' ? blackTimeLeft : whiteTimeLeft}
              isActive={gameStarted && !gameOverData && !isMyTurn}
              playerName={playerColor === 'w' ? blackPlayer.name : whitePlayer.name}
              playerRating={playerColor === 'w' ? blackPlayer.rating : whitePlayer.rating}
              playerPicture={playerColor === 'w' ? blackPlayer.picture : whitePlayer.picture}
            />

            {/* Chess board */}
            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
              <div className="w-full max-w-[700px] mx-auto">
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
                    <div className="text-center p-6">
                      <div className="text-6xl mb-4">♔</div>
                      <div className="text-xl text-zinc-300 mb-2">
                        Waiting for opponent...
                      </div>
                      <div className="text-sm text-zinc-500 mb-4">
                        Share the link below to invite a friend
                      </div>
                      <button
                        onClick={handleCopyLink}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                      >
                        {linkCopied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy Invite Link
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Your timer (bottom) */}
            <GameTimer
              timeLeft={playerColor === 'w' ? whiteTimeLeft : blackTimeLeft}
              isActive={gameStarted && !gameOverData && isMyTurn}
              playerName={playerColor === 'w' ? whitePlayer.name : blackPlayer.name}
              playerRating={playerColor === 'w' ? whitePlayer.rating : blackPlayer.rating}
              playerPicture={playerColor === 'w' ? whitePlayer.picture : blackPlayer.picture}
              isCurrentPlayer
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Invite link (only show when waiting and mounted) */}
            {!gameStarted && inviteCode && isMounted && (
              <InviteLink
                inviteCode={inviteCode}
                inviteLink={inviteLinkUrl}
                gameId={gameId}
              />
            )}

            {/* Move history */}
            <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
              <div className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-400">Move History</span>
                {viewingHistory && (
                  <button
                    onClick={() => {
                      returnToCurrentPosition();
                      setSelectedSquare(null);
                      setPossibleMoves({});
                    }}
                    className="text-xs text-green-400 hover:underline"
                  >
                    Return to current
                  </button>
                )}
              </div>
              <div className="h-[300px]">
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

            {/* Chat */}
            <div className="h-[300px]">
              <GameChat
                messages={chatMessages}
                onSendMessage={sendMessage}
                currentUserId={user?.id || 0}
                disabled={!gameStarted}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Resign confirmation dialog */}
      {showResignConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowResignConfirm(false)} />
          <div className="relative bg-zinc-900 rounded-xl border border-zinc-700 p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">Resign Game?</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Are you sure you want to resign? Your opponent will win the game.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowResignConfirm(false)}
                variant="outline"
                className="flex-1 border-zinc-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleResign}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Resign
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Game over modal */}
      <GameOverModal
        isOpen={showGameOver}
        onClose={() => setShowGameOver(false)}
        onNewGame={() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/dashboard';
          }
        }}
        gameOverData={gameOverData}
        currentUserId={user?.id || 0}
        player1Id={playerColor === 'w' ? user?.id || 0 : opponent?.id || 0}
        player2Id={playerColor === 'b' ? user?.id || 0 : opponent?.id || 0}
      />
    </div>
  );
}
