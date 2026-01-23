import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLeague } from '../../../context/LeagueContext';
import { LeagueTableEntry } from '../../../types';

export default function LeagueTableScreen() {
    const { teams, matches, currentSeason, players } = useLeague();

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
        <View className="flex-row py-3 border-b border-slate-100 px-4 bg-white rounded-t-2xl">
            <Text className="w-8 font-bold text-slate-500 text-[13px] text-center">#</Text>
            <Text className="flex-1 font-bold text-slate-700 text-sm pl-2">Team</Text>
            <Text className="w-8 font-bold text-slate-500 text-[13px] text-center">MP</Text>
            <Text className="w-7 font-bold text-slate-500 text-[13px] text-center">W</Text>
            <Text className="w-7 font-bold text-slate-500 text-[13px] text-center">D</Text>
            <Text className="w-7 font-bold text-slate-500 text-[13px] text-center">L</Text>
            <Text className="w-10 font-bold text-slate-500 text-[13px] text-center">+/-</Text>
            <Text className="w-9 font-bold text-slate-500 text-[13px] text-center">GD</Text>
            <Text className="w-9 font-bold text-slate-700 text-[13px] text-center">PTS</Text>
        </View>
    );

    return (
        <View className="flex-1 bg-secondary">
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                <View className="mx-5 mt-6 bg-white rounded-2xl overflow-hidden border border-slate-50 shadow-sm shadow-slate-200">
                    {renderHeader()}
                    {tableData.length > 0 ? (
                        tableData.map((item, index) => {
                            const team = getTeam(item.teamId);
                            const rank = index + 1;
                            const goalDiff = item.goalsFor - item.goalsAgainst;
                            const gdDisplay = goalDiff > 0 ? `+${goalDiff}` : goalDiff;
                            return (
                                <View key={item.teamId} className="flex-row py-2.5 items-center px-4 bg-white border-b border-slate-50/50">
                                    <View className="w-8 items-center">
                                        <Text className="text-slate-900 font-black text-base">{rank}</Text>
                                    </View>

                                    <View className="flex-1 flex-row items-center pl-2">
                                        <Text className="font-black text-slate-800 text-sm" numberOfLines={1}>{team?.name}</Text>
                                    </View>

                                    <View className="flex-row items-center">
                                        <Text className="w-8 text-slate-400 font-bold text-[13px] text-center">{item.played}</Text>
                                        <Text className="w-7 text-slate-400 font-bold text-[13px] text-center">{item.won}</Text>
                                        <Text className="w-7 text-slate-400 font-bold text-[13px] text-center">{item.drawn}</Text>
                                        <Text className="w-7 text-slate-400 font-bold text-[13px] text-center">{item.lost}</Text>
                                        <View className="w-10 items-center">
                                            <Text className="text-slate-400 font-bold text-[11px] text-center">{item.goalsFor}-{item.goalsAgainst}</Text>
                                        </View>
                                        <View className="w-9 items-center">
                                            <View className="bg-slate-50 px-1.5 py-0.5 rounded-md">
                                                <Text className="text-slate-400 font-bold text-[11px]">{gdDisplay}</Text>
                                            </View>
                                        </View>
                                        <Text className="w-9 text-slate-900 font-black text-sm text-center">{item.points}</Text>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <View className="items-center py-20">
                            <Text className="text-center font-bold text-slate-300">No standings available</Text>
                        </View>
                    )}
                </View>

                {/* Squads List */}
                <View className="mx-5 mb-8 mt-10">
                    <Text className="text-slate-900 text-lg font-black mb-4 uppercase tracking-tight px-1">Teams & Squads</Text>
                    {teams.map(team => {
                        const teamPlayers = players.filter(p => p.teamId === team.id);
                        return (
                            <View key={team.id} className="bg-white rounded-2xl p-5 mb-4 border border-slate-100 shadow-sm shadow-slate-200">
                                <View className="flex-row items-center mb-4 pb-3 border-b border-slate-50">
                                    <Text className="font-black text-slate-800 text-lg">{team.name}</Text>
                                </View>

                                <View className="flex-row flex-wrap gap-2">
                                    {teamPlayers.length > 0 ? (
                                        teamPlayers.map(player => (
                                            <View key={player.id} className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                <Text className="text-slate-600 font-bold text-sm tracking-tight">{player.name}</Text>
                                            </View>
                                        ))
                                    ) : (
                                        <Text className="text-slate-400 italic text-sm">No players registered.</Text>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}
