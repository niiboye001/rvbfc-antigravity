import { Match, Player, Team } from '../types';

export const MOCK_TEAMS: Team[] = [
    { id: 't1', name: 'Red Team', initials: 'RED', color: '#ef4444' },
    { id: 't2', name: 'Blue Team', initials: 'BLU', color: '#3b82f6' },
    { id: 't3', name: 'Green Team', initials: 'GRN', color: '#10b981' },
    { id: 't4', name: 'Yellow Team', initials: 'YEL', color: '#f59e0b' },
];

export const MOCK_PLAYERS: Player[] = [
    { id: 'p1', name: 'Sarge', teamId: 't1', goals: 5, assists: 2, yellowCards: 1, redCards: 0 },
    { id: 'p2', name: 'Simmons', teamId: 't1', goals: 3, assists: 4, yellowCards: 0, redCards: 0 },
    { id: 'p3', name: 'Grif', teamId: 't1', goals: 1, assists: 1, yellowCards: 2, redCards: 0 },
    { id: 'p4', name: 'Donut', teamId: 't1', goals: 2, assists: 0, yellowCards: 0, redCards: 0 },
    { id: 'p5', name: 'Church', teamId: 't2', goals: 6, assists: 1, yellowCards: 0, redCards: 0 },
    { id: 'p6', name: 'Tucker', teamId: 't2', goals: 4, assists: 3, yellowCards: 1, redCards: 0 },
    { id: 'p7', name: 'Caboose', teamId: 't2', goals: 0, assists: 1, yellowCards: 0, redCards: 1 }, // Team kill?
    { id: 'p8', name: 'Tex', teamId: 't2', goals: 8, assists: 0, yellowCards: 2, redCards: 1 },
];

export const generateMockMatches = (seasonId: string): Match[] => {
    const matches: Match[] = [];
    const now = new Date();

    // Past Match 1
    matches.push({
        id: 'm1',
        seasonId,
        date: new Date(now.getTime() - 86400000 * 7).toISOString(), // 7 days ago
        homeTeamId: 't1',
        awayTeamId: 't2',
        homeScore: 2,
        awayScore: 3,
        isFinished: true,
        events: [
            { id: 'e1', type: 'GOAL', teamId: 't1', playerId: 'p1', minute: 15 },
            { id: 'e2', type: 'GOAL', teamId: 't2', playerId: 'p5', minute: 32 },
            { id: 'e3', type: 'GOAL', teamId: 't2', playerId: 'p6', minute: 55 },
            { id: 'e4', type: 'GOAL', teamId: 't1', playerId: 'p2', minute: 70 },
            { id: 'e5', type: 'GOAL', teamId: 't2', playerId: 'p8', minute: 88 },
        ]
    });

    // Past Match 2
    matches.push({
        id: 'm2',
        seasonId,
        date: new Date(now.getTime() - 86400000 * 3).toISOString(), // 3 days ago
        homeTeamId: 't3',
        awayTeamId: 't4',
        homeScore: 1,
        awayScore: 1,
        isFinished: true,
        events: []
    });

    return matches;
};
