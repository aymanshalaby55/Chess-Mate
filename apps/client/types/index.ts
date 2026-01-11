import { ReactNode } from 'react';
import { Chess, Square, Color } from 'chess.js';

// User types
export interface User {
  id: number;
  email: string;
  name: string;
  picture?: string;
  rating?: number;
  gamesPlayed?: number;
  wins?: number;
  losses?: number;
  draws?: number;
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
  timeSpent?: number;
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

// Time Control
export type TimeControl =
  | 'bullet_1min'
  | 'bullet_2min'
  | 'blitz_3min'
  | 'blitz_5min'
  | 'rapid_10min'
  | 'rapid_15min'
  | 'rapid_30min'
  | 'classical_60min';

export const TIME_CONTROL_LABELS: Record<TimeControl, string> = {
  bullet_1min: '1 min (Bullet)',
  bullet_2min: '2 min (Bullet)',
  blitz_3min: '3 min (Blitz)',
  blitz_5min: '5 min (Blitz)',
  rapid_10min: '10 min (Rapid)',
  rapid_15min: '15 min (Rapid)',
  rapid_30min: '30 min (Rapid)',
  classical_60min: '60 min (Classical)',
};

export const TIME_CONTROL_MS: Record<TimeControl, number> = {
  bullet_1min: 60000,
  bullet_2min: 120000,
  blitz_3min: 180000,
  blitz_5min: 300000,
  rapid_10min: 600000,
  rapid_15min: 900000,
  rapid_30min: 1800000,
  classical_60min: 3600000,
};

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
  gameId?: number;
  timeControl?: TimeControl;
}

// Game from API
export interface Game {
  id: number;
  player1_id: number;
  player2_id: number | null;
  player1?: User;
  player2?: User;
  isComputer: boolean;
  computerSide?: 'white' | 'black';
  winnerId?: number;
  status: GameStatus;
  boardStatus: string;
  inviteCode?: string;
  isPrivate: boolean;
  timeControl?: TimeControl;
  initialTime?: number;
  increment?: number;
  player1TimeLeft?: number;
  player2TimeLeft?: number;
  createdAt: string;
  lastMoveAt: string;
  moves?: Move[];
}

export type GameStatus =
  | 'waiting'
  | 'ongoing'
  | 'white_won'
  | 'black_won'
  | 'draw'
  | 'resigned'
  | 'timeout'
  | 'abandoned';

export interface Move {
  id: number;
  gameId: number;
  moveNumber: number;
  from: string;
  to: string;
  piece: string;
  promotion?: string;
  capture: boolean;
  check: boolean;
  checkmate: boolean;
  fen: string;
  timeSpent?: number;
  createdAt: string;
}

// Chat Message
export interface ChatMessage {
  id: number;
  gameId: number;
  userId: number;
  user: {
    id: number;
    name: string;
    picture?: string;
  };
  message: string;
  createdAt: string;
}

// Rating Change
export interface RatingChange {
  oldRating: number;
  newRating: number;
  change: number;
}

// Game Over Event
export interface GameOverEvent {
  winnerId: number | null;
  reason: 'checkmate' | 'timeout' | 'resigned' | 'abandoned' | 'draw';
  status: GameStatus;
  ratingChanges?: {
    player1: RatingChange;
    player2: RatingChange;
  };
}

// Player Info for matchmaking
export interface MatchmakingPlayer {
  odId: number;
  odName: string;
  rating: number;
  timeControl: TimeControl;
}

// Move History
export interface UseMoveHistoryProps {
  game: Chess;
  gameRef: React.MutableRefObject<Chess>;
  viewingHistory: boolean;
  setBoardPosition: React.Dispatch<React.SetStateAction<string>>;
}

export interface MoveHistoryState {
  gameMoves: MoveRecord[];
  viewingHistory: boolean;
  viewingMoveIndex: number;
  handleMoveClick: (moveIndex: number) => void;
  returnToCurrentPosition: () => void;
  gameMovesRef: React.MutableRefObject<MoveRecord[]>;
  setGameMoves: React.Dispatch<React.SetStateAction<MoveRecord[]>>;
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

// User Stats
export interface UserStats {
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  recentGames: Game[];
  ratingHistory: RatingHistoryEntry[];
}

export interface RatingHistoryEntry {
  id: number;
  userId: number;
  rating: number;
  gameId?: number;
  change: number;
  createdAt: string;
}
