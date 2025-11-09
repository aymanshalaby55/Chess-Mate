"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Chess, Square, Color } from "chess.js";
import Engine from "@/utils/Engine";
import { ChessMove, MoveRecord, UseComputerGameOptions } from "@/types";

export interface ComputerGameState {
  game: any; // Chess instance
  boardPosition: string;
  isEngineThinking: boolean;
  playerColor: Color;
  viewingHistory: boolean;
  viewingMoveIndex: number;
  boardStyles: {
    customDarkSquareStyle: { backgroundColor: string };
    customLightSquareStyle: { backgroundColor: string };
    animationDuration: number;
  };
  gameMoves: Array<{
    fen: string;
    timestamp: number;
    moveNotation?: string;
    from?: Square;
    to?: Square;
    promotion?: "q" | "r" | "b" | "n";
  }>;
  onDrop: (sourceSquare: Square, targetSquare: Square) => boolean;
  resetGame: () => void;
  switchColor: () => void;
  handleMoveClick: (moveIndex: number) => void;
  returnToCurrentPosition: () => void;
  exportGameMoves: () => string;
}

export default function useComputerGame(
  options?: UseComputerGameOptions
): ComputerGameState {
  const onGameOver = options?.onGameOver;
  const [viewingHistory, setViewingHistory] = useState(false);
  const handleGameOver = useCallback(
    (game: Chess) => {
      if (!onGameOver) {
        console.log("handleGameOver: No onGameOver callback provided");
        return;
      }

      console.log("handleGameOver: Checking game-over conditions", {
        isCheckmate: game.isCheckmate(),
        isDraw: game.isDraw(),
        isStalemate: game.isStalemate(),
        isThreefoldRepetition: game.isThreefoldRepetition(),
        isInsufficientMaterial: game.isInsufficientMaterial(),
        fen: game.fen(),
      });

      if (game.isCheckmate()) {
        const winner = game.turn() === "w" ? "black" : "white";
        console.log(`Game Over: Checkmate, winner=${winner}`);
        onGameOver(winner);
      } else if (
        game.isDraw() ||
        game.isStalemate() ||
        game.isThreefoldRepetition() ||
        game.isInsufficientMaterial()
      ) {
        console.log("Game Over: Draw");
        onGameOver("draw");
      } else {
        console.log("handleGameOver: No game-over condition met");
      }
    },
    [onGameOver]
  );
  const {
    game,
    gameRef,
    boardPosition,
    setGame,
    setBoardPosition,
    playerColor,
    setPlayerColor,
    isPlayerTurn,
    setIsPlayerTurn,
  } = useChessGame();

  const { isEngineThinking, engineReady, askEngineMove } = useChessEngine({
    gameRef,
    playerColor,
    setGame,
    setIsPlayerTurn,
    handleGameOver,
  });

  const { onDrop } = useMoveHandler({
    gameRef,
    setGame,
    playerColor,
    isEngineThinking,
    engineReady,
    askEngineMove,
    viewingHistory,
    isPlayerTurn,
    setIsPlayerTurn,
    onGameOver: options?.onGameOver,
    handleGameOver
  });

  const {
    gameMoves,
    viewingMoveIndex,
    handleMoveClick,
    returnToCurrentPosition,
    gameMovesRef,
    setGameMoves,
  } = useMoveHistory({
    game,
    gameRef,
    viewingHistory,
    setBoardPosition,
  });

  const { resetGame, switchColor, exportGameMoves } = useGameControls({
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
  });

  // console.log("gameMoves", gameMoves);

  return {
    game,
    boardPosition,
    isEngineThinking,
    playerColor,
    viewingHistory,
    viewingMoveIndex,
    boardStyles,
    gameMoves,
    onDrop,
    resetGame,
    switchColor,
    handleMoveClick,
    returnToCurrentPosition,
    exportGameMoves,
  };
}
