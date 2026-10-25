export type PlayerName = string;

export type PlayerMatchHistory = {
  name: string;
  matchesPlayed: number;
  byes: number;
  points: number;
  gamesWon: number;
  gamesLost: number;
  wins: number;
  ties: number;
  losses: number;
};

export type MatchResult = {
  teamA: [string, string];
  teamB: [string, string];
  scoreA: number;
  scoreB: number;
};

export type RoundRecord = {
  roundNumber: number;
  byes: string[];
  matches: MatchResult[];
  submitted: boolean;
};

export type RoundHistory = {
  byeCounts: Record<string, number>;
  lastByeRound: Record<string, number>;
  lastByeTimestamp: Record<string, number>;
  partnerCounts: Record<string, number>;
  opponentCounts: Record<string, number>;
  courtCounts: Record<string, number>;
  playerStats?: Record<string, PlayerMatchHistory>;
};

export type TournamentState = {
  players: string[];
  started: boolean;
  startedAt?: number;
  currentRound: number;
  rounds: RoundRecord[];
  preview?: RoundRecord;
  winner?: string | null;
  demoMode: boolean;
};

export type StorageAdapter = {
  read: () => Promise<TournamentState | null>;
  write: (state: TournamentState) => Promise<void>;
  clear: () => Promise<void>;
};
