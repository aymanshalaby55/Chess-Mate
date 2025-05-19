'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Chess, Square, Color } from 'chess.js';
import Engine from '@/utils/Engine';

// Define a simpler move type for our use case
interface ChessMove {
  from: Square;
  to: Square;
  promotion?: 'q' | 'r' | 'b' | 'n';
}

// New interface for move history with timestamps
interface MoveRecord {
  fen: string;
  timestamp: number;
  moveNotation?: string;
  from?: Square;  // Make from optional
  to?: Square;    // Make to optional
  promotion?: 'q' | 'r' | 'b' | 'n';
}

export interface UseComputerGameOptions {
  onGameOver?: (winner: 'white' | 'black' | 'draw') => void;
}

export default function useComputerGame(options?: UseComputerGameOptions) {
  const [game, setGame] = useState(() => new Chess());
  const gameRef = useRef<Chess>(new Chess());
  const engineRef = useRef<Engine | null>(null);
  const [isEngineThinking, setIsEngineThinking] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const [playerColor, setPlayerColor] = useState<Color>('w'); // Default to white
  const [boardPosition, setBoardPosition] = useState(new Chess().fen());
  const [viewingHistory, setViewingHistory] = useState(false);
  const [viewingMoveIndex, setViewingMoveIndex] = useState(-1);

  // Keep a history of all game positions with timestamps
  const gameMovesRef = useRef<MoveRecord[]>([
    {
      fen: new Chess().fen(),
      timestamp: Date.now(),
      moveNotation: undefined,
      from: undefined,
      to: undefined,
      promotion: undefined,
    },
  ]);

  // Expose the game moves history as a state value
  const [gameMoves, setGameMoves] = useState<MoveRecord[]>(
    gameMovesRef.current
  );

  // Update the game ref whenever game state changes
  useEffect(() => {
    gameRef.current = game;
    // Add position to history if it's a new move
    const currentFen = game.fen();

    if (
      gameMovesRef.current.length === 0 ||
      gameMovesRef.current[gameMovesRef.current.length - 1].fen !== currentFen
    ) {
      const history = game.history({ verbose: true });
      const lastMove = history.length > 0 ? history[history.length - 1] : null;
      const moveNotation = lastMove ? lastMove.san : undefined;

      const newMoveRecord: MoveRecord = {
        fen: currentFen,
        timestamp: Date.now(),
        moveNotation,
        from: lastMove?.from,
        to: lastMove?.to,
        promotion: lastMove?.promotion as 'q' | 'r' | 'b' | 'n' | undefined
      };

      gameMovesRef.current.push(newMoveRecord);
      setGameMoves([...gameMovesRef.current]);
    }

    // Only update the board position if we're not viewing history
    if (!viewingHistory) {
      setBoardPosition(currentFen);
    }
  }, [game, viewingHistory]);

  // Handle game over conditions
  const handleGameOver = useCallback(
    (game: Chess) => {
      if (game.isCheckmate()) {
        const winner = game.turn() === 'w' ? 'black' : 'white';
        options?.onGameOver?.(winner);
      } else if (game.isDraw() || game.isStalemate()) {
        options?.onGameOver?.('draw');
      }
    },
    [options]
  );

  // Make engine move
  const makeEngineMove = useCallback(
    (moveUci: string) => {
      // console.log('Applying engine move:', moveUci);

      const move: ChessMove = {
        from: moveUci.substring(0, 2) as Square,
        to: moveUci.substring(2, 4) as Square,
        promotion:
          moveUci.length > 4
            ? (moveUci.substring(4, 5) as 'q' | 'r' | 'b' | 'n')
            : undefined,
      };

      // Add a small delay before applying the move to make it feel like a piece is being grabbed
      setTimeout(() => {
        // Use a functional update to avoid stale state
        setGame((currentGame) => {
          // Create a new game instance with the current position
          const newGame = new Chess(currentGame.fen());

          try {
            // console.log('Current position:', newGame.fen());
            // console.log('Attempting move:', move);

            const moveResult = newGame.move(move);

            if (moveResult) {
              // console.log('Move successful:', moveResult);
              gameRef.current = newGame;

              // Check for game over after engine move
              if (newGame.isGameOver()) {
                // Schedule gameOver check to happen after state update
                setTimeout(() => handleGameOver(newGame), 0);
              }

              return newGame;
            } else {
              console.error(
                'Invalid engine move (rejected by chess.js):',
                move
              );
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
    },
    [handleGameOver]
  );

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
    const thinkingTime =
      Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

    // console.log(
    //   `Computer thinking for ${thinkingTime}ms before calculating move...`
    // );

    setTimeout(() => {
      // console.log('Asking engine to move from position:', fen);
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

        // console.log('Initializing engine...');
        const engine = new Engine();
        engineRef.current = engine;

        engine.onReady(() => {
          if (!mounted) return;

          // console.log('Engine is ready for play');
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
          // console.log('Engine best move callback:', bestMove);
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
  const onDrop = useCallback(
    (sourceSquare: Square, targetSquare: Square): boolean => {
      // Don't allow moves when viewing history
      if (viewingHistory) {
        return false;
      }

      // Check if it's player's turn
      if (isEngineThinking || gameRef.current.turn() !== playerColor) {
        // console.log("Not player's turn or engine is thinking");
        return false;
      }

      let promotion: 'q' | 'r' | 'b' | 'n' | undefined = undefined;

      // Use functional update to avoid stale state
      setGame((currentGame) => {
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

          // console.log('Player attempting move:', move);
          const result = newGame.move(move);

          if (result === null) {
            // console.log('Invalid player move');
            return currentGame; // Return unchanged
          }

          // console.log('Player move successful:', result);
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
    },
    [
      isEngineThinking,
      playerColor,
      engineReady,
      askEngineMove,
      handleGameOver,
      viewingHistory,
    ]
  );

  // Reset the game
  const resetGame = useCallback(() => {
    const newGame = new Chess();
    gameRef.current = newGame;
    setGame(newGame);
    setBoardPosition(newGame.fen());
    setIsEngineThinking(false);
    setViewingHistory(false);
    setViewingMoveIndex(-1);

    // Reset game moves history
    gameMovesRef.current = [{
      fen: newGame.fen(),
      timestamp: Date.now(),
      moveNotation: undefined,
      from: undefined,
      to: undefined,
      promotion: undefined
    }];
    setGameMoves([...gameMovesRef.current]);

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
        promotion: history[i].promotion,
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

  // Export game moves to JSON
  const exportGameMoves = useCallback(() => {
    return JSON.stringify(gameMovesRef.current);
  }, []);

  // Create board styling for consistent appearance
  const boardStyles = useMemo(
    () => ({
      customDarkSquareStyle: { backgroundColor: '#8aad6a' },
      customLightSquareStyle: { backgroundColor: '#f0e9c5' },
      animationDuration: 200, // Smooth animation for better UX
    }),
    []
  );

  console.log('gameMoves',gameMoves);
  

  return {
    game,
    boardPosition,
    isEngineThinking,
    playerColor,
    viewingHistory,
    viewingMoveIndex,
    boardStyles,
    gameMoves, // Expose the game moves with timestamps
    onDrop,
    resetGame,
    switchColor,
    handleMoveClick,
    returnToCurrentPosition,
    exportGameMoves, // New function to export game history
  };
}
