"use client";

import { useCallback } from "react";
import { Chess } from "chess.js";
import { UseGameControlsProps, GameControlsState } from "@/types";

export default function useGameControls({
  gameRef,
  setGame,
  setBoardPosition,
  playerColor,
  setPlayerColor,
  engineReady,
  askEngineMove,
  setIsPlayerTurn,
  gameMovesRef,
  setGameMoves,
}: UseGameControlsProps): GameControlsState {
  const resetGame = useCallback(() => {
    console.log("Resetting game...");
    const newGame = new Chess();
    gameRef.current = newGame;
    setGame(newGame);
    setBoardPosition(newGame.fen());
    setIsPlayerTurn(playerColor === "w");

    gameMovesRef.current = [
      {
        fen: newGame.fen(),
        timestamp: Date.now(),
        moveNotation: undefined,
        from: undefined,
        to: undefined,
        promotion: undefined,
      },
    ];
    setGameMoves([...gameMovesRef.current]);

    if (playerColor === "b" && engineReady) {
      console.log("Player is black, triggering white's first move after reset");
      setIsPlayerTurn(false);
      setTimeout(() => {
        askEngineMove(newGame.fen());
      }, 1000);
    }
  }, [
    gameRef,
    setGame,
    setBoardPosition,
    playerColor,
    engineReady,
    askEngineMove,
    setIsPlayerTurn,
    gameMovesRef,
    setGameMoves,
  ]);

  const switchColor = useCallback(() => {
    const newColor = playerColor === "w" ? "b" : "w";
    console.log("Switching to color:", newColor);
    setPlayerColor(newColor);
    setTimeout(() => {
      resetGame();
    }, 0);
  }, [playerColor, setPlayerColor, resetGame]);

  const exportGameMoves = useCallback(() => {
    return JSON.stringify(gameMovesRef.current);
  }, [gameMovesRef]);

  return {
    resetGame,
    switchColor,
    exportGameMoves,
  };
}
