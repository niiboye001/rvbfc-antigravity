export interface Team {
    id: string;
    seasonId?: string; // Optional for backward compatibility, but recommended
    name: string;
    initials: string; // Logo
    color: string;
    logoUrl?: string;
}

export interface Player {
    id: string;
    name: string;
    teamId: string;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
}

export type MatchEventType = 'GOAL' | 'ASSIST' | 'YELLOW_CARD' | 'RED_CARD' | 'FOUL' | 'PENALTY_GOAL';

export interface MatchEvent {
    id: string;
    type: MatchEventType;
    playerId: string;
    teamId: string;
    assistantId?: string;
    minute?: number;
}

export interface Match {
    id: string;
    seasonId: string;
    date: string; // ISO String
    homeTeamId: string;
    awayTeamId: string;
    homeScore: number;
    awayScore: number;
    isFinished: boolean;
    events: MatchEvent[];
}

export interface Season {
    id: string;
    name: string; // e.g., "Season 1 2025"
    year: number;
    sequence: number; // 1 or 2
    isCurrent: boolean;
}

export interface LeagueTableEntry {
    teamId: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
}
