import { ReactNode } from 'react';
import { Chess, Square, Color } from 'chess.js';

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface UserContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export interface UserData {
  name: string;
  email: string;
  picture?: string;
}

// Feature Card
export interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

// Chess Board Styles
export interface BoardStyles {
  customDarkSquareStyle: { backgroundColor: string };
  customLightSquareStyle: { backgroundColor: string };
  animationDuration: number;
}

// Piece types
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

export interface PieceIconProps {
  piece: string; // Format: 'wP', 'bK', etc.
  className?: string;
  size?: number;
}

// Chess Move
export interface ChessMove {
  from: Square;
  to: Square;
  promotion?: 'q' | 'r' | 'b' | 'n';
}

// Move Record
export interface MoveRecord {
  fen: string;
  timestamp: number;
  moveNotation?: string;
  from?: Square;
  to?: Square;
  promotion?: 'q' | 'r' | 'b' | 'n';
}

export interface FullMoveHistoryProps {
  game: MoveRecord[];
  onMoveClick?: (moveIndex: number) => void;
  currentMoveIndex?: number;
}
// Chess Game State
export interface ChessGameState {
  game: Chess;
  gameRef: React.MutableRefObject<Chess>;
  boardPosition: string;
  setBoardPosition: React.Dispatch<React.SetStateAction<string>>;
  playerColor: Color;
  setPlayerColor: React.Dispatch<React.SetStateAction<Color>>;
  isPlayerTurn: boolean;
  setIsPlayerTurn: React.Dispatch<React.SetStateAction<boolean>>;
  setGame: any;
}

// Online Game Options
export interface UseOnlineGameOptions {
  onGameOver?: (winner: 'white' | 'black' | 'draw') => void;
  gameId?: string;
  playerId?: string;
  serverUrl?: string;
}

// Computer Game Options
export interface UseComputerGameOptions {
  onGameOver?: (winner: 'white' | 'black' | 'draw') => void;
}

// Move History
export interface UseMoveHistoryProps {
  game: Chess;
  gameRef: React.MutableRefObject<Chess>;
  viewingHistory: boolean;
  setBoardPosition: React.Dispatch<React.SetStateAction<string>>;
  setGameMoves: React.Dispatch<React.SetStateAction<MoveRecord[]>>;
}

export interface MoveHistoryState {
  gameMoves: MoveRecord[];
  viewingHistory: boolean;
  viewingMoveIndex: number;
  handleMoveClick: (moveIndex: number) => void;
  returnToCurrentPosition: () => void;
  gameMovesRef: React.MutableRefObject<MoveRecord[]>;
}

// Move Handler
export interface UseMoveHandlerProps {
  gameRef: React.MutableRefObject<Chess>;
  setGame: React.Dispatch<React.SetStateAction<Chess>>;
  playerColor: Color;
  isEngineThinking: boolean;
  engineReady: boolean;
  askEngineMove: (fen: string) => void;
  viewingHistory: boolean;
  isPlayerTurn: boolean;
  setIsPlayerTurn: React.Dispatch<React.SetStateAction<boolean>>;
  onGameOver?: (winner: 'white' | 'black' | 'draw') => void;
  handleGameOver: (game: Chess) => void;
}

export interface MoveHandlerState {
  onDrop: (sourceSquare: Square, targetSquare: Square) => boolean;
}

// Game Controls
export interface UseGameControlsProps {
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

export interface GameControlsState {
  resetGame: () => void;
  switchColor: () => void;
  exportGameMoves: () => string;
}

// Chess Engine
export interface UseChessEngineProps {
  gameRef: React.MutableRefObject<Chess>;
  playerColor: 'w' | 'b';
  setGame: React.Dispatch<React.SetStateAction<Chess>>;
  setIsPlayerTurn: React.Dispatch<React.SetStateAction<boolean>>;
  handleGameOver: (game: Chess) => void;
}

export interface ChessEngineState {
  isEngineThinking: boolean;
  engineReady: boolean;
  askEngineMove: (fen: string) => void;
}

// Engine Message
export type EngineMessage = {
  uciMessage: string;
  bestMove?: string;
  ponder?: string;
  positionEvaluation?: string;
  possibleMate?: string;
  pv?: string;
  depth?: number;
};

export interface ChessboardContainerProps {
  position: string;
  orientation: 'white' | 'black';
  onPieceDrop: (sourceSquare: Square, targetSquare: Square) => boolean;
  boardStyles: BoardStyles;
  selectedSquare: Square | null;
  possibleMoves: Record<string, Square[]>;
  onSquareClick: (square: Square) => void;
  game: Chess;
}
