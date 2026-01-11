"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Chess } from "chess.js";
import { MoveRecord, UseMoveHistoryProps, MoveHistoryState } from "@/types";

export default function useMoveHistory({
  game,
  gameRef,
  viewingHistory,
  setBoardPosition,
}: UseMoveHistoryProps): MoveHistoryState {
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

  const [gameMoves, setGameMoves] = useState<MoveRecord[]>(
    gameMovesRef.current
  );
  const [viewingMoveIndex, setViewingMoveIndex] = useState(-1);

  useEffect(() => {
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
        promotion: lastMove?.promotion as "q" | "r" | "b" | "n" | undefined,
      };

      gameMovesRef.current.push(newMoveRecord);
      setGameMoves([...gameMovesRef.current]);
    }

    if (!viewingHistory) {
      setBoardPosition(currentFen);
    }
  }, [game, viewingHistory, setBoardPosition]);

  const handleMoveClick = useCallback(
    (moveIndex: number) => {
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
      setViewingMoveIndex(moveIndex);
    },
    [gameRef, setBoardPosition]
  );

  const returnToCurrentPosition = useCallback(() => {
    setBoardPosition(gameRef.current.fen());
    setViewingMoveIndex(-1);
  }, [gameRef, setBoardPosition]);

  return {
    gameMoves,
    viewingHistory,
    viewingMoveIndex,
    handleMoveClick,
    returnToCurrentPosition,
    gameMovesRef,
  };
}
