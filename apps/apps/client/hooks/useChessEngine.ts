"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Engine from "@/utils/Engine";
import { Chess, Square } from "chess.js";
import { ChessMove, UseChessEngineProps, ChessEngineState } from "@/types";

export default function useChessEngine({
  gameRef,
  playerColor,
  setGame,
  setIsPlayerTurn,
  handleGameOver,
}: UseChessEngineProps): ChessEngineState {
  const engineRef = useRef<Engine | null>(null);
  const [isEngineThinking, setIsEngineThinking] = useState(false);
  const [engineReady, setEngineReady] = useState(false);

  const makeEngineMove = useCallback(
    (moveUci: string) => {
      console.log("Engine attempting move:", moveUci);
      const move: ChessMove = {
        from: moveUci.substring(0, 2) as Square,
        to: moveUci.substring(2, 4) as Square,
        promotion:
          moveUci.length > 4
            ? (moveUci.substring(4, 5) as "q" | "r" | "b" | "n")
            : undefined,
      };

      setTimeout(() => {
        setGame((currentGame) => {
          const newGame = new Chess(currentGame.fen());

          try {
            const moveResult = newGame.move(move);

            if (moveResult) {
              console.log("Engine move applied:", moveResult);
              gameRef.current = newGame;
              setIsPlayerTurn(playerColor === newGame.turn());
              if (newGame.isGameOver()) {
                console.log("Engine move caused game over");
                // Call handleGameOver(newGame) if you pass it via props or context
                handleGameOver(newGame);
              }
              return newGame;
            } else {
              console.error("Invalid engine move:", move);
              return currentGame;
            }
          } catch (error) {
            console.error("Error applying engine move:", error);
            return currentGame;
          } finally {
            setIsEngineThinking(false);
          }
        });
      }, 300);
    },
    [gameRef, setGame, setIsPlayerTurn, playerColor]
  );

  const askEngineMove = useCallback(
    (fen: string) => {
      if (!engineRef.current) {
        console.error("Engine not initialized");
        return;
      }

      console.log("Requesting engine move for FEN:", fen);
      setIsEngineThinking(true);

      const moveCount = gameRef.current.history().length;
      let minDelay = 1000;
      let maxDelay = 2000;

      if (moveCount > 10 && moveCount < 30) {
        minDelay = 2000;
        maxDelay = 4000;
      } else if (moveCount >= 30) {
        minDelay = 1500;
        maxDelay = 3000;
      }

      const thinkingTime =
        Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

      setTimeout(() => {
        engineRef.current?.evaluatePosition(fen, 10);
      }, thinkingTime);
    },
    [gameRef]
  );

  useEffect(() => {
    let mounted = true;
    let bestMoveUnsubscribe: (() => void) | null = null;

    const initializeEngine = async () => {
      try {
        if (typeof window === "undefined") return;

        if (engineRef.current) {
          if (bestMoveUnsubscribe) bestMoveUnsubscribe();
          engineRef.current.terminate();
          engineRef.current = null;
        }

        console.log("Initializing engine...");
        const engine = new Engine();
        engineRef.current = engine;

        engine.onReady(() => {
          if (!mounted) return;
          console.log("Engine ready");
          setEngineReady(true);
          setIsEngineThinking(false);

          if (playerColor === "b" && gameRef.current.turn() === "w") {
            console.log("Player is black, triggering white's first move");
            setIsPlayerTurn(false);
            setTimeout(() => {
              askEngineMove(gameRef.current.fen());
            }, 1000);
          } else {
            setIsPlayerTurn(true);
          }
        });

        bestMoveUnsubscribe = engine.onBestMove((bestMove) => {
          if (!mounted) return;
          makeEngineMove(bestMove);
        });
      } catch (error) {
        console.error("Error initializing Stockfish engine:", error);
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
  }, [playerColor, makeEngineMove, askEngineMove, gameRef, setIsPlayerTurn]);

  return {
    isEngineThinking,
    engineReady,
    askEngineMove,
  };
}
