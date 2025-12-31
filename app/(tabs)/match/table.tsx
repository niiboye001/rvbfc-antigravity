import { useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useLeague } from '../../../context/LeagueContext';
import { LeagueTableEntry } from '../../../types';

export default function LeagueTableScreen() {
    const { teams, matches, currentSeason } = useLeague();

    const tableData: LeagueTableEntry[] = useMemo(() => {
        if (!currentSeason) return [];

        // Filter matches for current season
        const seasonMatches = matches.filter(m => m.seasonId === currentSeason.id && m.isFinished);

        const stats: Record<string, LeagueTableEntry> = {};

        // Initialize stats for all teams
        teams.forEach(team => {
            stats[team.id] = {
                teamId: team.id,
                played: 0,
                won: 0,
                drawn: 0,
                lost: 0,
                goalsFor: 0,
                goalsAgainst: 0,
                points: 0,
            };
        });

        seasonMatches.forEach(match => {
            const home = stats[match.homeTeamId];
            const away = stats[match.awayTeamId];
            if (!home || !away) return;

            home.played++;
            away.played++;
            home.goalsFor += match.homeScore;
            home.goalsAgainst += match.awayScore;
            away.goalsFor += match.awayScore;
            away.goalsAgainst += match.homeScore;

            if (match.homeScore > match.awayScore) {
                home.won++;
                home.points += 3;
                away.lost++;
            } else if (match.homeScore < match.awayScore) {
                away.won++;
                away.points += 3;
                home.lost++;
            } else {
                home.drawn++;
                home.points += 1;
                away.drawn++;
                away.points += 1;
            }
        });

        return Object.values(stats).sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            const gdA = a.goalsFor - a.goalsAgainst;
            const gdB = b.goalsFor - b.goalsAgainst;
            return gdB - gdA;
        });

    }, [teams, matches, currentSeason]);

    const getTeam = (id: string) => teams.find(t => t.id === id);

    const renderHeader = () => (
        <View className="flex-row py-4 border-b border-slate-100 px-4 bg-white rounded-t-2xl">
            <Text className="w-8 font-bold text-slate-500 text-xs text-center">#</Text>
            <Text className="flex-1 font-bold text-slate-700 text-sm pl-2">Team</Text>
            <Text className="w-8 font-bold text-slate-500 text-xs text-center">PL</Text>
            <Text className="w-7 font-bold text-slate-500 text-xs text-center">W</Text>
            <Text className="w-7 font-bold text-slate-500 text-xs text-center">D</Text>
            <Text className="w-7 font-bold text-slate-500 text-xs text-center">L</Text>
            <Text className="w-10 font-bold text-slate-500 text-xs text-center">+/-</Text>
            <Text className="w-9 font-bold text-slate-500 text-xs text-center">GD</Text>
            <Text className="w-9 font-bold text-slate-700 text-xs text-center">PTS</Text>
        </View>
    );

    return (
        <View className="flex-1 bg-slate-50">
            <View className="mx-4 mt-4 bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 pb-2">
                {renderHeader()}
                <FlatList
                    data={tableData}
                    keyExtractor={item => item.teamId}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item, index }) => {
                        const team = getTeam(item.teamId);
                        const rank = index + 1;
                        const goalDiff = item.goalsFor - item.goalsAgainst;
                        const gdDisplay = goalDiff > 0 ? `+${goalDiff}` : goalDiff;

                        // Classification colors logic (Match Premier League style)
                        // Top 4 Green, 5th Blue (Europa) - but distinct separating bars
                        let indicatorColor = 'transparent';
                        if (rank <= 4) indicatorColor = '#22c55e'; // Green
                        else if (rank === 5) indicatorColor = '#3b82f6'; // Blue

                        return (
                            <View className="flex-row py-3 border-b border-slate-50 items-center px-4 bg-white">
                                <Text className="w-8 text-slate-900 font-extrabold text-center text-sm">{rank}</Text>

                                <View className="flex-1 flex-row items-center pl-2">
                                    <View className="w-7 h-7 rounded-full mr-3 items-center justify-center bg-slate-50 border border-slate-100" style={{ backgroundColor: team?.color ? `${team.color}15` : '#f8fafc' }}>
                                        {/* Fallback to Initials if no logo (using color) */}
                                        <Text className="text-[10px] font-bold" style={{ color: team?.color || '#64748b' }}>{team?.initials}</Text>
                                    </View>
                                    <Text className="font-bold text-slate-800 text-sm" numberOfLines={1}>{team?.name}</Text>
                                </View>

                                <Text className="w-8 text-slate-500 text-sm text-center">{item.played}</Text>
                                <Text className="w-7 text-slate-500 text-sm text-center">{item.won}</Text>
                                <Text className="w-7 text-slate-500 text-sm text-center">{item.drawn}</Text>
                                <Text className="w-7 text-slate-500 text-sm text-center">{item.lost}</Text>
                                <Text className="w-10 text-slate-500 text-xs text-center tracking-tighter self-center">{item.goalsFor}-{item.goalsAgainst}</Text>
                                <Text className="w-9 text-slate-900 text-sm text-center font-bold">{gdDisplay}</Text>
                                <Text className="w-9 font-black text-slate-900 text-sm text-center">{item.points}</Text>
                            </View>
                        );
                    }}
                    ListEmptyComponent={
                        <Text className="text-center p-8 text-slate-400">No standings available</Text>
                    }
                />
            </View>
        </View>
    );
}
