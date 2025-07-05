"use client";

import { useState, useRef } from "react";
import { Chess, Color } from "chess.js";
import { ChessGameState } from "@/types";

export default function useChessGame(): ChessGameState {
  const [game, setGame] = useState(() => new Chess());
  const gameRef = useRef<Chess>(new Chess());
  const [boardPosition, setBoardPosition] = useState(new Chess().fen());
  const [playerColor, setPlayerColor] = useState<Color>("w");
  const [isPlayerTurn, setIsPlayerTurn] = useState(playerColor === "w");

  return {
    game,
    gameRef,
    boardPosition,
    setBoardPosition,
    setGame,
    playerColor,
    setPlayerColor,
    isPlayerTurn,
    setIsPlayerTurn,
  };
}
