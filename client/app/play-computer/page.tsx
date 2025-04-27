'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo, useDeferredValue } from 'react';
import { Chess, Square, Color } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import Engine from '@/utils/Engine';
import MoveHistory from '@/components/MoveHistory';
import DetailedMoveHistory from '@/components/DetailedMoveHistory';
import TimelineMoveHistory from '@/components/TimelineMoveHistory';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

// Define a simpler move type for our use case
interface ChessMove {
  from: Square;
  to: Square;
  promotion?: 'q' | 'r' | 'b' | 'n';
}

type MoveViewType = 'table' | 'list' | 'timeline';

// Wrap the ChessBoard component in React.memo to prevent unnecessary re-renders
const MemoizedChessboard = React.memo(Chessboard);

// Isolate the chessboard in its own component to minimize re-renders
const ChessboardContainer = React.memo(({ 
  position, 
  orientation, 
  onPieceDrop, 
  isThinking 
}: { 
  position: string; 
  orientation: 'white' | 'black'; 
  onPieceDrop: (sourceSquare: Square, targetSquare: Square) => boolean;
  isThinking: boolean;
}) => {
  const boardProps = useMemo(() => ({
    position,
    onPieceDrop,
    customDarkSquareStyle: { backgroundColor: '#8aad6a' },
    customLightSquareStyle: { backgroundColor: '#f0e9c5' },
    boardOrientation: orientation,
    animationDuration: 200, // Smooth animation for better UX
  }), [position, orientation, onPieceDrop]);

  return (
    <div className="w-full aspect-square relative">
      <MemoizedChessboard
        {...boardProps}
      />

    </div>
  );
});

// Optional: Add display name for debugging
ChessboardContainer.displayName = 'ChessboardContainer';

export default function PlayComputer() {
  const [game, setGame] = useState(() => new Chess());
  const gameRef = useRef<Chess>(new Chess());
  const engineRef = useRef<Engine | null>(null);
  const [isEngineThinking, setIsEngineThinking] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const [playerColor, setPlayerColor] = useState<Color>('w'); // Default to white
  const [boardPosition, setBoardPosition] = useState(new Chess().fen());
  // Use deferred value to reduce rendering pressure
  const deferredBoardPosition = useDeferredValue(boardPosition);
  const [viewingHistory, setViewingHistory] = useState(false);
  const [viewingMoveIndex, setViewingMoveIndex] = useState(-1);
  const [moveView, setMoveView] = useState<MoveViewType>('table');

  // Keep a history of all game positions
  const gamePositionsRef = useRef<string[]>([new Chess().fen()]);

  // Update the game ref whenever game state changes
  useEffect(() => {
    gameRef.current = game;
    // Add position to history if it's a new move
    const currentFen = game.fen();
    if (gamePositionsRef.current[gamePositionsRef.current.length - 1] !== currentFen) {
      gamePositionsRef.current.push(currentFen);
    }
    
    // Only update the board position if we're not viewing history
    if (!viewingHistory) {
      setBoardPosition(currentFen);
    }
  }, [game, viewingHistory]);

  // Handle game over conditions
  const handleGameOver = useCallback((game: Chess) => {
    if (game.isCheckmate()) {
      alert(`Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`);
    } else if (game.isDraw()) {
      alert('Game ended in a draw');
    } else if (game.isStalemate()) {
      alert('Game ended in stalemate');
    }
  }, []);

  // Make engine move
  const makeEngineMove = useCallback((moveUci: string) => {
    console.log('Applying engine move:', moveUci);
    
    const move: ChessMove = {
      from: moveUci.substring(0, 2) as Square,
      to: moveUci.substring(2, 4) as Square,
      promotion: moveUci.length > 4 ? moveUci.substring(4, 5) as 'q' | 'r' | 'b' | 'n' : undefined,
    };

    // Add a small delay before applying the move to make it feel like a piece is being grabbed
    setTimeout(() => {
      // Use a functional update to avoid stale state
      setGame(currentGame => {
        // Create a new game instance with the current position
        const newGame = new Chess(currentGame.fen());
        
        try {
          console.log('Current position:', newGame.fen());
          console.log('Attempting move:', move);
          
          const moveResult = newGame.move(move);
          
          if (moveResult) {
            console.log('Move successful:', moveResult);
            gameRef.current = newGame;
            
            // Check for game over after engine move
            if (newGame.isGameOver()) {
              // Schedule gameOver check to happen after state update
              setTimeout(() => handleGameOver(newGame), 0);
            }
            
            return newGame;
          } else {
            console.error('Invalid engine move (rejected by chess.js):', move);
            console.error('Current position FEN:', newGame.fen());
            console.error('Current turn:', newGame.turn());
            console.error('Valid moves:', newGame.moves({ verbose: true }));
            return currentGame; // Return the current game state unchanged
          }
        } catch (error) {
          console.error('Error making engine move:', error);
          console.error('Move that caused error:', move);
          console.error('Current FEN:', newGame.fen());
          return currentGame; // Return the current game state unchanged
        } finally {
          setIsEngineThinking(false);
        }
      });
    }, 300); // 300ms delay simulates grabbing a piece
  }, [handleGameOver]);

  // Ask engine to make a move
  const askEngineMove = useCallback((fen: string) => {
    if (!engineRef.current) {
      console.error('Engine not initialized');
      return;
    }

    setIsEngineThinking(true);
    
    // Add a realistic delay before starting engine calculation
    // This makes the computer appear more human-like
    const moveCount = gameRef.current.history().length;
    
    // Calculate a varying delay based on game phase
    // Opening: faster moves (1-2 seconds)
    // Middle game: more thinking (2-4 seconds) 
    // End game: careful calculation (1.5-3 seconds)
    let minDelay = 1000; // minimum 1 second
    let maxDelay = 2000; // default max 2 seconds
    
    if (moveCount > 10 && moveCount < 30) {
      // Middle game - more complex positions need more "thinking time"
      minDelay = 2000;
      maxDelay = 4000;
    } else if (moveCount >= 30) {
      // End game - critical decisions
      minDelay = 1500;
      maxDelay = 3000;
    }
    
    // Generate a random delay within the range to seem more natural
    const thinkingTime = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    
    console.log(`Computer thinking for ${thinkingTime}ms before calculating move...`);
    
    setTimeout(() => {
      console.log('Asking engine to move from position:', fen);
      engineRef.current?.evaluatePosition(fen, 10); // Depth 10 is good balance
    }, thinkingTime);
  }, []);

  // Initialize the engine
  useEffect(() => {
    let mounted = true;
    let bestMoveUnsubscribe: (() => void) | null = null;
    
    const initializeEngine = async () => {
      try {
        if (typeof window === 'undefined') return;
        
        // Clean up previous engine if it exists
        if (engineRef.current) {
          if (bestMoveUnsubscribe) bestMoveUnsubscribe();
          engineRef.current.terminate();
          engineRef.current = null;
        }
        
        console.log('Initializing engine...');
        const engine = new Engine();
        engineRef.current = engine;

        engine.onReady(() => {
          if (!mounted) return;
          
          console.log('Engine is ready for play');
          setEngineReady(true);
          setIsEngineThinking(false);
          
          // If player is black, engine (white) makes first move
          if (playerColor === 'b' && gameRef.current.turn() === 'w') {
            // Add initial delay before first move
            setTimeout(() => {
              askEngineMove(gameRef.current.fen());
            }, 1000); // First move delay
          }
        });

        // Register for best move events
        bestMoveUnsubscribe = engine.onBestMove((bestMove) => {
          if (!mounted) return;
          console.log('Engine best move callback:', bestMove);
          makeEngineMove(bestMove);
        });
      } catch (error) {
        console.error('Error initializing Stockfish engine:', error);
      }
    };

    initializeEngine();

    return () => {
      mounted = false;
      if (bestMoveUnsubscribe) bestMoveUnsubscribe();
      if (engineRef.current) {
        engineRef.current.terminate();
      }
    };
  }, [playerColor, askEngineMove, makeEngineMove]);

  // Handle player move
  const onDrop = useCallback((sourceSquare: Square, targetSquare: Square): boolean => {
    // Don't allow moves when viewing history
    if (viewingHistory) {
      return false;
    }
    
    // Check if it's player's turn
    if (isEngineThinking || gameRef.current.turn() !== playerColor) {
      console.log("Not player's turn or engine is thinking");
      return false;
    }

    let promotion: 'q' | 'r' | 'b' | 'n' | undefined = undefined;
    
    // Use functional update to avoid stale state
    setGame(currentGame => {
      try {
        const newGame = new Chess(currentGame.fen());
        const piece = newGame.get(sourceSquare);
  
        if (piece && piece.type === 'p') {
          const isPromotion =
            (piece.color === 'w' && targetSquare.charAt(1) === '8') ||
            (piece.color === 'b' && targetSquare.charAt(1) === '1');
  
          if (isPromotion) {
            promotion = 'q'; // Default to queen
          }
        }
  
        const move: ChessMove = {
          from: sourceSquare,
          to: targetSquare,
          promotion: promotion,
        };
  
        console.log('Player attempting move:', move);
        const result = newGame.move(move);
  
        if (result === null) {
          console.log('Invalid player move');
          return currentGame; // Return unchanged
        }
  
        console.log('Player move successful:', result);
        gameRef.current = newGame;
        
        // Schedule game over check
        if (newGame.isGameOver()) {
          setTimeout(() => handleGameOver(newGame), 0);
        } else if (engineReady && engineRef.current) {
          // Add a natural pause before the computer starts thinking
          // This simulates a real opponent observing your move before thinking
          setTimeout(() => {
            askEngineMove(newGame.fen());
          }, 100);
        }
  
        return newGame;
      } catch (error) {
        console.error('Error making player move:', error);
        return currentGame; // Return unchanged on error
      }
    });
    
    return true;
  }, [isEngineThinking, playerColor, engineReady, askEngineMove, handleGameOver, viewingHistory]);

  // Reset the game
  const resetGame = useCallback(() => {
    const newGame = new Chess();
    gameRef.current = newGame;
    setGame(newGame);
    setBoardPosition(newGame.fen());
    setIsEngineThinking(false);
    setViewingHistory(false);
    setViewingMoveIndex(-1);
    gamePositionsRef.current = [newGame.fen()];
    
    // If player is black, engine (white) makes first move
    if (playerColor === 'b' && engineReady) {
      setTimeout(() => {
        askEngineMove(newGame.fen());
      }, 500);
    }
  }, [playerColor, engineReady, askEngineMove]);

  // Switch player color
  const switchColor = useCallback(() => {
    const newColor = playerColor === 'w' ? 'b' : 'w';
    setPlayerColor(newColor);
    
    // Reset the game with the new color
    setTimeout(() => {
      resetGame();
    }, 0);
  }, [playerColor, resetGame]);

  // Handle move click in history
  const handleMoveClick = useCallback((moveIndex: number) => {
    // Create a new chess instance and play back moves up to the selected index
    const chess = new Chess();
    const history = gameRef.current.history({ verbose: true });
    
    for (let i = 0; i <= moveIndex && i < history.length; i++) {
      chess.move({ 
        from: history[i].from, 
        to: history[i].to, 
        promotion: history[i].promotion 
      });
    }
    
    setBoardPosition(chess.fen());
    setViewingHistory(true);
    setViewingMoveIndex(moveIndex);
  }, []);

  // Return to current position
  const returnToCurrentPosition = useCallback(() => {
    setBoardPosition(gameRef.current.fen());
    setViewingHistory(false);
    setViewingMoveIndex(-1);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-green-400 flex items-center hover:underline text-sm"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>

          <h1 className="text-3xl font-bold mt-4">Play Against Computer</h1>
          <p className="text-zinc-400 mt-2">Test your skills against the Stockfish chess engine</p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 mb-6">
              {/* Game controls */}
              <div className="flex flex-wrap justify-between items-center mb-4">
                <div className="space-x-2 mb-2 sm:mb-0">
                  <button 
                    onClick={resetGame} 
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md transition-colors"
                  >
                    New Game
                  </button>
                  <button
                    onClick={switchColor}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md transition-colors"
                  >
                    Play as {playerColor === 'w' ? 'Black' : 'White'}
                  </button>
                </div>
                
                <div className="space-x-2">
                  <button
                    onClick={returnToCurrentPosition}
                    disabled={!viewingHistory}
                    className={`px-4 py-2 ${
                      viewingHistory 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-zinc-700 cursor-not-allowed'
                    } text-white rounded-md transition-colors`}
                  >
                    Return to Current
                  </button>
                </div>
              </div>
              
              {/* Replace the direct Chessboard with the container component */}
              <ChessboardContainer
                position={deferredBoardPosition}
                orientation={playerColor === 'w' ? 'white' : 'black'}
                onPieceDrop={onDrop}
                isThinking={isEngineThinking}
              />
            </div>
            
            {/* Game status */}
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
              <h2 className="text-xl font-bold mb-4">Game Status</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-950 p-3 rounded-lg">
                  <p><span className="font-medium text-green-400">Turn:</span> {game.turn() === 'w' ? 'White' : 'Black'}</p>
                  <p><span className="font-medium text-green-400">Your Color:</span> {playerColor === 'w' ? 'White' : 'Black'}</p>
                </div>
                <div className="bg-zinc-950 p-3 rounded-lg">
                  <p>
                    <span className="font-medium text-green-400">Status:</span>{' '}
                    {game.isCheckmate()
                      ? 'Checkmate!'
                      : game.isDraw()
                      ? 'Draw'
                      : game.isCheck()
                      ? 'Check'
                      : 'Ongoing'}
                  </p>
                  <p>
                    <span className="font-medium text-green-400">Result:</span>{' '}
                    {game.isCheckmate()
                      ? `${game.turn() === 'w' ? 'Black' : 'White'} wins`
                      : game.isDraw()
                      ? 'Draw'
                      : 'In progress'}
                  </p>
                </div>
              </div>
              
              {viewingHistory && (
                <div className="mt-4 p-2 bg-zinc-950 rounded-lg text-center">
                  <p className="text-green-400">
                    Viewing historical position (Move {viewingMoveIndex + 1})
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="w-full">
            <div className="bg-zinc-900 p-0 rounded-lg border border-zinc-800 mb-6 overflow-hidden">
              <div className="border-b border-zinc-800">
                <nav className="flex">
                  <button
                    onClick={() => setMoveView('table')}
                    className={`px-4 py-3 text-sm font-medium flex-1 ${
                      moveView === 'table'
                        ? 'text-green-400 border-b-2 border-green-400 bg-zinc-800'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                    } transition-colors`}
                  >
                    Table View
                  </button>
                  <button
                    onClick={() => setMoveView('list')}
                    className={`px-4 py-3 text-sm font-medium flex-1 ${
                      moveView === 'list'
                        ? 'text-green-400 border-b-2 border-green-400 bg-zinc-800'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                    } transition-colors`}
                  >
                    List View
                  </button>
                  <button
                    onClick={() => setMoveView('timeline')}
                    className={`px-4 py-3 text-sm font-medium flex-1 ${
                      moveView === 'timeline'
                        ? 'text-green-400 border-b-2 border-green-400 bg-zinc-800'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                    } transition-colors`}
                  >
                    Timeline
                  </button>
                </nav>
              </div>
              
              <div className="h-[500px] bg-zinc-950">
                {moveView === 'table' && (
                  <MoveHistory
                    game={game}
                    onMoveClick={handleMoveClick}
                    currentMoveIndex={viewingMoveIndex}
                  />
                )}
                {moveView === 'list' && (
                  <DetailedMoveHistory
                    game={game}
                    onMoveClick={handleMoveClick}
                    currentMoveIndex={viewingMoveIndex}
                  />
                )}
                {moveView === 'timeline' && (
                  <TimelineMoveHistory
                    game={game}
                    onMoveClick={handleMoveClick}
                    currentMoveIndex={viewingMoveIndex}
                  />
                )}
              </div>
            </div>
            
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
              <h2 className="text-xl font-bold mb-2">Computer Settings</h2>
              <div className="bg-zinc-950 p-3 rounded-lg">
                <p className="text-zinc-400 mb-2">Playing against Stockfish engine</p>
                <div className={`text-sm ${engineReady ? 'text-green-400' : 'text-yellow-400'}`}>
                  {engineReady ? 'Engine ready' : 'Engine initializing...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}