import { Side } from '@prisma/client';

export interface PlayerInfo {
  odId: number;
  odName: string;
  color: Side;
  timeLeft: number;
}

export interface GameRoom {
  gameId: number;
  players: Map<string, PlayerInfo>;
  spectators: Set<string>;
  currentTurn: Side;
  timerInterval?: NodeJS.Timeout;
  lastMoveTime?: number;
}

export interface MatchmakingPlayer {
  odId: number;
  odName: string;
  rating: number;
  timeControl: string;
  joinedAt: number;
}

export interface AuthenticatePayload {
  odId: number;
  odName: string;
}

export interface JoinMatchmakingPayload {
  odId: number;
  odName: string;
  rating: number;
  timeControl: string;
}

export interface JoinGamePayload {
  gameId: number;
  odId: number;
  odName: string;
}

export interface JoinByInvitePayload {
  inviteCode: string;
  odId: number;
  odName: string;
}

export interface MakeMovePayload {
  gameId: number;
  from: string;
  to: string;
  promotion?: string;
}

export interface ResignPayload {
  gameId: number;
}

export interface DrawPayload {
  gameId: number;
}

export interface SendMessagePayload {
  gameId: number;
  message: string;
}

export interface GetMessagesPayload {
  gameId: number;
  limit?: number;
}

export interface CreatePrivateGamePayload {
  odId: number;
  odName: string;
  timeControl: string;
  color?: string;
}

export interface SpectatePayload {
  gameId: number;
}

