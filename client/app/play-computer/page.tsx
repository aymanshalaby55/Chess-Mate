'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
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

export default function PlayComputer() {
  const [game, setGame] = useState(() => new Chess());
  const gameRef = useRef<Chess>(new Chess());
  const engineRef = useRef<Engine | null>(null);
  const [isEngineThinking, setIsEngineThinking] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const [playerColor, setPlayerColor] = useState<Color>('w'); // Default to white
  const [boardPosition, setBoardPosition] = useState(new Chess().fen());
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

  // Make engine move
  const makeEngineMove = useCallback((moveUci: string) => {
    console.log('Applying engine move:', moveUci);
    
    const move: ChessMove = {
      from: moveUci.substring(0, 2) as Square,
      to: moveUci.substring(2, 4) as Square,
      promotion: moveUci.length > 4 ? moveUci.substring(4, 5) as 'q' | 'r' | 'b' | 'n' : undefined,
    };

    // Create a new game instance with the current position
    const currentFen = gameRef.current.fen();
    const newGame = new Chess(currentFen);
    
    try {
      console.log('Current position:', currentFen);
      console.log('Attempting move:', move);
      
      const moveResult = newGame.move(move);
      
      if (moveResult) {
        console.log('Move successful:', moveResult);
        gameRef.current = newGame;
        
        // Update game state
        setGame(newGame);
        
        // Check for game over after engine move
        if (newGame.isGameOver()) {
          handleGameOver(newGame);
        }
      } else {
        console.error('Invalid engine move (rejected by chess.js):', move);
        console.error('Current position FEN:', currentFen);
        console.error('Current turn:', newGame.turn());
        console.error('Valid moves:', newGame.moves({ verbose: true }));
      }
    } catch (error) {
      console.error('Error making engine move:', error);
      console.error('Move that caused error:', move);
      console.error('Current FEN:', currentFen);
    } finally {
      setIsEngineThinking(false);
    }
  }, []);

  // Ask engine to make a move
  const askEngineMove = useCallback((fen: string) => {
    if (!engineRef.current) {
      console.error('Engine not initialized');
      return;
    }

    setIsEngineThinking(true);
    console.log('Asking engine to move from position:', fen);
    engineRef.current.evaluatePosition(fen, 10); // Depth 10 is good balance
  }, []);

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
            setTimeout(() => {
              askEngineMove(gameRef.current.fen());
            }, 500);
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
  }, [playerColor, makeEngineMove, askEngineMove]);

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

    try {
      let promotion: 'q' | 'r' | 'b' | 'n' | undefined = undefined;
      const newGame = new Chess(gameRef.current.fen());
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
        return false;
      }

      console.log('Player move successful:', result);
      gameRef.current = newGame;
      
      // Update game state
      setGame(newGame);
      
      // Check for game over after player move
      if (newGame.isGameOver()) {
        handleGameOver(newGame);
        return true;
      }

      if (engineReady && engineRef.current) {
        setTimeout(() => {
          askEngineMove(newGame.fen());
        }, 300);
      }

      return true;
    } catch (error) {
      console.error('Error making player move:', error);
      return false;
    }
  }, [isEngineThinking, playerColor, engineReady, askEngineMove, handleGameOver, viewingHistory]);

  // Memoize board props to prevent unnecessary re-renders
  const boardProps = useMemo(() => ({
    position: boardPosition,
    onPieceDrop: onDrop,
    customDarkSquareStyle: { backgroundColor: '#8aad6a' },
    customLightSquareStyle: { backgroundColor: '#f0e9c5' },
    boardOrientation: playerColor === 'w' ? 'white' : 'black' as 'white' | 'black',
    animationDuration: 200, // Smooth animation for better UX
  }), [boardPosition, playerColor, onDrop]);

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
              
              {/* Chessboard with props */}
              <div className="w-full aspect-square relative">
                <Chessboard
                  {...boardProps}
                />
                {isEngineThinking && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-md">
                    <div className="bg-zinc-900 p-4 rounded-md shadow-lg flex items-center border border-zinc-700">
                      <Loader2 className="w-5 h-5 text-green-400 animate-spin mr-2" />
                      <span className="text-white">Computer is thinking...</span>
                    </div>
                  </div>
                )}
              </div>
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