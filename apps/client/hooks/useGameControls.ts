"use client";

import { useCallback } from "react";
import { Chess, Color } from "chess.js";
import { MoveRecord } from "./useMoveHistory";

interface UseGameControlsProps {
  gameRef: React.MutableRefObject<Chess>;
  setGame: React.Dispatch<React.SetStateAction<Chess>>;
  setBoardPosition: React.Dispatch<React.SetStateAction<string>>;
  playerColor: Color;
  setPlayerColor: React.Dispatch<React.SetStateAction<Color>>;
  engineReady: boolean;
  askEngineMove: (fen: string) => void;
  setIsPlayerTurn: React.Dispatch<React.SetStateAction<boolean>>;
  gameMovesRef: React.MutableRefObject<MoveRecord[]>;
  setGameMoves: React.Dispatch<React.SetStateAction<MoveRecord[]>>;
}

interface GameControlsState {
  resetGame: () => void;
  switchColor: () => void;
  exportGameMoves: () => string;
}

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
