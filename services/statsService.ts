import { Match, Player, Season, Team } from '../types';

export const statsService = {
    /**
     * Calculates the top scorer and top assister for a given season.
     */
    calculatePlayerStats: (players: Player[], matches: Match[], seasonId: string | undefined) => {
        if (!seasonId) return { topScorerData: null, topAssisterData: null };

        const seasonMatches = matches.filter(m => m.seasonId === seasonId);
        const playerStats: Record<string, { goals: number, assists: number }> = {};

        seasonMatches.forEach(match => {
            match.events?.forEach(event => {
                if (!playerStats[event.playerId]) {
                    playerStats[event.playerId] = { goals: 0, assists: 0 };
                }
                if (event.type === 'GOAL') {
                    playerStats[event.playerId].goals++;
                    if (event.assistantId) {
                        if (!playerStats[event.assistantId]) {
                            playerStats[event.assistantId] = { goals: 0, assists: 0 };
                        }
                        playerStats[event.assistantId].assists++;
                    }
                } else if (event.type === 'ASSIST') {
                    // Start tracking explicitly tracked assists if we want, 
                    // though usually ASSIST event is enough. 
                    // The original code counted explicit ASSIST events OR inferred from GOAL with assistantId.
                    // Let's match the original logic: "infer from GOAL" AND "count explicit ASSIST events"?
                    // Original code:
                    // else if (event.type === 'ASSIST') { playerStats[event.playerId].assists++; }

                    // Note: This double counting might happen if data has both. 
                    // Assuming data is clean or we just follow previous implementation.
                    playerStats[event.playerId].assists++;
                }
            });
        });

        const playerListWithStats = players.map(p => ({
            ...p,
            goals: playerStats[p.id]?.goals || 0,
            assists: playerStats[p.id]?.assists || 0
        }));

        const maxGoals = Math.max(...playerListWithStats.map(p => p.goals));
        const maxAssists = Math.max(...playerListWithStats.map(p => p.assists));

        const topScorers = playerListWithStats.filter(p => p.goals === maxGoals && maxGoals > 0);
        const topAssisters = playerListWithStats.filter(p => p.assists === maxAssists && maxAssists > 0);

        return {
            topScorerData: topScorers.length > 0 ? {
                player: topScorers[0],
                extraCount: topScorers.length - 1
            } : null,
            topAssisterData: topAssisters.length > 0 ? {
                player: topAssisters[0],
                extraCount: topAssisters.length - 1
            } : null
        };
    },

    /**
     * Calculates the historical points chart data for all seasons in the current season's year.
     */
    calculateHistoricalStats: (teams: Team[], matches: Match[], seasons: Season[], currentSeason: Season | null) => {
        if (!currentSeason || teams.length === 0 || seasons.length === 0) {
            return { chartData: [{ value: 0, label: '-', frontColor: '#ccc' }], sortedSeasons: [] };
        }

        const sortedSeasons = seasons
            .filter(s => s.year === currentSeason.year)
            .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

        if (sortedSeasons.length === 0) {
            return { chartData: [{ value: 0, label: '-', frontColor: '#ccc' }], sortedSeasons: [] };
        }

        const sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name));

        // 1. Pre-calculate points per team per season
        const pointsMap: Record<string, Record<string, number>> = {}; // { seasonId: { teamId: points } }

        matches.forEach(m => {
            if (!m.isFinished) return;

            if (!pointsMap[m.seasonId]) pointsMap[m.seasonId] = {};
            const seasonPoints = pointsMap[m.seasonId];

            if (!seasonPoints[m.homeTeamId]) seasonPoints[m.homeTeamId] = 0;
            if (!seasonPoints[m.awayTeamId]) seasonPoints[m.awayTeamId] = 0;

            if (m.homeScore > m.awayScore) {
                seasonPoints[m.homeTeamId] += 3;
            } else if (m.awayScore > m.homeScore) {
                seasonPoints[m.awayTeamId] += 3;
            } else {
                seasonPoints[m.homeTeamId] += 1;
                seasonPoints[m.awayTeamId] += 1;
            }
        });

        // 2. Build Chart Data
        const groupedData: any[] = [];
        const palette = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#6366f1'];

        sortedSeasons.forEach((season) => {
            // Get teams specific to this season
            const seasonTeams = teams
                .filter(t => t.seasonId === season.id)
                .sort((a, b) => a.name.localeCompare(b.name));

            seasonTeams.forEach((team, tIdx) => {
                const points = pointsMap[season.id]?.[team.id] || 0;

                const isFirstInGroup = tIdx === 0;
                const isLastInGroup = tIdx === seasonTeams.length - 1;

                // Use palette to ensure every team has a different color
                const barColor = palette[tIdx % palette.length];

                groupedData.push({
                    value: points,
                    frontColor: barColor,
                    spacing: isLastInGroup ? 24 : 8, // Breathing room between groups
                    borderTopLeftRadius: 6,
                    borderTopRightRadius: 6,
                    topLabelComponent: undefined, // Passed as undefined, component logic handled in UI if needed, but previously inline. 
                    // To keep it pure data service, we should probably return data.
                    // However, 'react-native-gifted-charts' expects component instances or functions in data.
                    // For separation of concerns, let's keep UI components out of service if possible.
                    // But to match the "copy logic" approach, we'll return the raw data structure 
                    // and let the hook/component add the UI functions? 
                    // Or just return the raw numbers and let the UI build the chart data object?
                    // The implementation plan said "Returns chart data".
                    // Let's return a richer data object that the UI can map to chart data.
                    // Actually, simple strings/colors are executing fine here.
                    // The 'topLabelComponent' and 'labelComponent' contained JSX. 
                    // Service cannot return JSX easily without importing React.
                    // Let's refactor: returning "Formatted Data" but WITHOUT the React Components.
                    teamInitial: team.initials,
                    seasonSequence: season.sequence,
                    isFirst: isFirstInGroup,
                    isLast: isLastInGroup,
                    seasonTeamCount: seasonTeams.length,

                    // Standard chart props
                    minHeight: points > 0 ? 6 : 0,
                });
            });
        });

        return { chartData: groupedData, sortedSeasons };
    }
};
