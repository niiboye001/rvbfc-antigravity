import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useLeague } from '../context/LeagueContext';
import { statsService } from '../services/statsService';

export const useLeagueStats = () => {
    const { teams, players, matches, seasons, currentSeason } = useLeague();

    // 1. Top Performers
    const { topScorerData, topAssisterData } = useMemo(() =>
        statsService.calculatePlayerStats(players, matches, currentSeason?.id),
        [players, matches, currentSeason?.id]
    );

    // 2. Historical Points (Chart Data)
    const chartData = useMemo(() => {
        const { chartData: rawData } = statsService.calculateHistoricalStats(teams, matches, seasons, currentSeason);

        // Map raw data to UI components (Gifted Charts format)
        return rawData.map((item: any) => ({
            ...item,
            // Add UI Components back here since Service was pure logic
            topLabelComponent: () => (
                <View className="items-center" style={{ marginBottom: 4 }}>
                    <Text className="text-[9px] font-bold text-slate-500">
                        {item.teamInitial}
                    </Text>
                </View>
            ),
            labelComponent: item.isFirst ? () => (
                <View className="items-center" style={{ marginTop: 8, width: item.seasonTeamCount * 28 + 16 }}>
                    <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">S{item.seasonSequence}</Text>
                </View>
            ) : undefined,
        }));
    }, [teams, matches, seasons, currentSeason]);

    // 3. Current Match (Latest)
    const currentMatch = useMemo(() => {
        if (!currentSeason) return null;
        return matches
            .filter(m => m.seasonId === currentSeason.id)
            .sort((a, b) => {
                const timeA = a?.date ? new Date(a.date).getTime() : 0;
                const timeB = b?.date ? new Date(b.date).getTime() : 0;
                return timeB - timeA;
            })[0];
    }, [matches, currentSeason]);

    // Helper: Sorted Seasons for the X-Axis labels in UI
    const sortedSeasons = useMemo(() => {
        if (!currentSeason) return [];
        return seasons
            .filter(s => s.year === currentSeason.year)
            .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
    }, [seasons, currentSeason]);

    // Helper: Sorted Teams for UI calculations (width etc)
    const sortedTeams = useMemo(() =>
        [...teams].sort((a, b) => a.name.localeCompare(b.name)),
        [teams]);

    return {
        topScorerData,
        topAssisterData,
        chartData,
        currentMatch,
        sortedSeasons,
        sortedTeams
    };
};
