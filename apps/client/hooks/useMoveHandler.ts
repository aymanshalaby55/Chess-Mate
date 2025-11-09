"use client";

import { useCallback } from "react";
import { Chess, Square, Color } from "chess.js";
import { ChessMove, UseMoveHandlerProps, MoveHandlerState } from "@/types";

export default function useMoveHandler({
  gameRef,
  setGame,
  playerColor,
  isEngineThinking,
  engineReady,
  askEngineMove,
  viewingHistory,
  isPlayerTurn,
  setIsPlayerTurn,
  handleGameOver
}: UseMoveHandlerProps): MoveHandlerState {
  

  const onDrop = useCallback(
    (sourceSquare: Square, targetSquare: Square): boolean => {
      console.log(
        `onDrop called: source=${sourceSquare}, target=${targetSquare}, playerColor=${playerColor}, turn=${gameRef.current.turn()}, isPlayerTurn=${isPlayerTurn}, isEngineThinking=${isEngineThinking}`
      );

      if (viewingHistory) {
        console.log("Move blocked: Viewing history");
        return false;
      }

      if (!isPlayerTurn || isEngineThinking || gameRef.current.turn() !== playerColor) {
        console.log(
          `Move blocked: isPlayerTurn=${isPlayerTurn}, isEngineThinking=${isEngineThinking}, turn=${gameRef.current.turn()}, playerColor=${playerColor}`
        );
        return false;
      }

      let promotion: "q" | "r" | "b" | "n" | undefined = undefined;

      setGame((currentGame) => {
        try {
          const newGame = new Chess(currentGame.fen());
          const piece = newGame.get(sourceSquare);

          if (piece && piece.type === "p") {
            const isPromotion =
              (piece.color === "w" && targetSquare.charAt(1) === "8") ||
              (piece.color === "b" && targetSquare.charAt(1) === "1");
            if (isPromotion) {
              promotion = "q";
            }
          }

          const move: ChessMove = {
            from: sourceSquare,
            to: targetSquare,
            promotion: promotion,
          };

          console.log("Player attempting move:", move);
          const result = newGame.move(move);

          if (result === null) {
            console.log("Invalid player move:", move);
            return currentGame;
          }

          console.log("Player move applied:", result);
          gameRef.current = newGame;
          setIsPlayerTurn(false);

          if (newGame.isDraw() || newGame.isStalemate() || newGame.isThreefoldRepetition() || newGame.isInsufficientMaterial()) {
            console.log("Game is over, calling handleGameOver");
            handleGameOver(newGame); // Call directly instead of setTimeout
          } else if (engineReady) {
            console.log("Triggering engine move after player move");
            setTimeout(() => {
              askEngineMove(newGame.fen());
            }, 100);
          }

          return newGame;
        } catch (error) {
          console.error("Error making player move:", error);
          return currentGame;
        }
      });

      return true;
    },
    [
      viewingHistory,
      isPlayerTurn,
      isEngineThinking,
      playerColor,
      gameRef,
      setGame,
      engineReady,
      askEngineMove,
      handleGameOver,
      setIsPlayerTurn,
    ]
  );

  return { onDrop };
}