import { router, useGlobalSearchParams } from 'expo-router';
import { ChevronLeft, Trophy, Users } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLeague } from '../../context/LeagueContext';

export default function SeasonDetailScreen() {
    const params = useGlobalSearchParams();
    const id = params.id as string;
    const { seasons, matches, teams, players } = useLeague();

    const season = seasons.find(s => s.id === id);
    const [activeTab, setActiveTab] = useState<'TABLE' | 'MATCHES' | 'TEAMS'>('TABLE');

    const seasonMatches = useMemo(() => matches.filter(m => m.seasonId === id), [matches, id]);

    // Get all teams registered for this season
    const allSeasonTeams = useMemo(() =>
        teams.filter(t => t.seasonId === id),
        [teams, id]
    );

    // Calculate Season Stats (Match dependent)
    const stats = useMemo(() => {
        let totalGoals = 0;
        let totalYellows = 0;
        let totalReds = 0;
        const playerStats: Record<string, { goals: number, assists: number }> = {};

        seasonMatches.forEach(m => {
            totalGoals += m.homeScore + m.awayScore;

            m.events?.forEach(e => {
                if (e.type === 'YELLOW_CARD') totalYellows++;
                if (e.type === 'RED_CARD') totalReds++;

                if (e.type === 'GOAL') {
                    if (!playerStats[e.playerId]) playerStats[e.playerId] = { goals: 0, assists: 0 };
                    playerStats[e.playerId].goals++;

                    if (e.assistantId) {
                        if (!playerStats[e.assistantId]) playerStats[e.assistantId] = { goals: 0, assists: 0 };
                        playerStats[e.assistantId].assists++;
                    }
                }
            });
        });

        const sortedScorers = Object.entries(playerStats)
            .sort(([, a], [, b]) => b.goals - a.goals)
            .map(([pid, s]) => ({ ...s, player: players.find(p => p.id === pid) }));

        const sortedAssisters = Object.entries(playerStats)
            .sort(([, a], [, b]) => b.assists - a.assists)
            .map(([pid, s]) => ({ ...s, player: players.find(p => p.id === pid) }));

        return {
            totalGoals,
            totalYellows,
            totalReds,
            topScorer: sortedScorers[0],
            topAssister: sortedAssisters[0],
        };
    }, [seasonMatches, players]);

    // Calculate Table
    const tableData = useMemo(() => {
        const table: Record<string, { p: number, w: number, d: number, l: number, gf: number, ga: number, pts: number }> = {};

        // Initialize table for ALL teams in the season
        allSeasonTeams.forEach(t => {
            table[t.id] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
        });

        seasonMatches.filter(m => m.isFinished).forEach(m => {
            // Ensure teams exist in table before updating (handle inconsistencies)
            if (!table[m.homeTeamId]) table[m.homeTeamId] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
            if (!table[m.awayTeamId]) table[m.awayTeamId] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };

            const home = table[m.homeTeamId];
            const away = table[m.awayTeamId];

            home.p++; away.p++;
            home.gf += m.homeScore; home.ga += m.awayScore;
            away.gf += m.awayScore; away.ga += m.homeScore;

            if (m.homeScore > m.awayScore) {
                home.w++; home.pts += 3;
                away.l++;
            } else if (m.homeScore < m.awayScore) {
                away.w++; away.pts += 3;
                home.l++;
            } else {
                home.d++; home.pts += 1;
                away.d++; away.pts += 1;
            }
        });

        return Object.entries(table)
            .map(([tid, data]) => ({ team: allSeasonTeams.find(t => t.id === tid) || teams.find(t => t.id === tid), ...data }))
            .sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));
    }, [seasonMatches, allSeasonTeams, teams]);

    if (!season) return <View className="flex-1 bg-white justify-center items-center"><Text>Season not found</Text></View>;

    return (
        <View className="flex-1 bg-secondary">
            <View className="bg-white pt-24 pb-8 border-b border-slate-100 relative justify-center items-center">
                <TouchableOpacity onPress={() => router.back()} className="absolute left-4 bottom-8 p-2 bg-slate-50 rounded-full z-10">
                    <ChevronLeft size={24} color="#0f172a" />
                </TouchableOpacity>
                <View className="items-center px-12">
                    <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Season Detail</Text>
                    <Text className="text-2xl font-black text-slate-900 tracking-[1px] uppercase text-center leading-8">
                        {season.name.replace(/\s\d{4}$/, '')} — {season.year}
                    </Text>
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {/* Season Summary Hero */}
                <View className="px-4 py-6">
                    <View className="bg-slate-900 rounded-3xl p-6 shadow-lg shadow-slate-300 overflow-hidden relative">
                        {/* Abstract background shapes */}
                        <View className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full" />
                        <View className="absolute -left-12 -bottom-12 w-48 h-48 bg-white/5 rounded-full" />

                        <Text className="text-white/40 text-[10px] font-black uppercase tracking-[3px] mb-4 text-center">Season Summary</Text>

                        <View className="flex-row justify-between items-center px-2">
                            <View className="items-center flex-1">
                                <Text className="text-4xl font-black text-white mb-1">{stats.totalGoals}</Text>
                                <Text className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Goals</Text>
                            </View>
                            <View className="w-[1px] h-12 bg-white/10" />
                            <View className="items-center flex-1">
                                <Text className="text-4xl font-black text-white mb-1">{stats.totalYellows}</Text>
                                <Text className="text-amber-400 text-[10px] font-bold uppercase tracking-widest">Yellows</Text>
                            </View>
                            <View className="w-[1px] h-12 bg-white/10" />
                            <View className="items-center flex-1">
                                <Text className="text-4xl font-black text-white mb-1">{stats.totalReds}</Text>
                                <Text className="text-rose-400 text-[10px] font-bold uppercase tracking-widest">Reds</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Top Performers Cards */}
                <View className="px-4 mb-8 flex-row gap-4">
                    {stats.topScorer && (
                        <View className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shadow-slate-200 relative overflow-hidden">
                            <View className="absolute right-0 top-0 p-3 opacity-5">
                                <Trophy size={64} color="#000" />
                            </View>
                            <View className="flex-row items-center mb-3">
                                <View className="w-8 h-8 rounded-full bg-amber-100 items-center justify-center mr-2">
                                    <Trophy size={14} color="#d97706" />
                                </View>
                                <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Golden Boot</Text>
                            </View>
                            <Text className="font-black text-slate-900 text-lg leading-6 mb-1" numberOfLines={1}>{stats.topScorer.player?.name}</Text>
                            <Text className="font-bold text-amber-500 text-xs">{stats.topScorer.goals} Goals</Text>
                        </View>
                    )}
                    {stats.topAssister && (
                        <View className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shadow-slate-200 relative overflow-hidden">
                            <View className="absolute right-0 top-0 p-3 opacity-5">
                                <Users size={64} color="#000" />
                            </View>
                            <View className="flex-row items-center mb-3">
                                <View className="w-8 h-8 rounded-full bg-indigo-100 items-center justify-center mr-2">
                                    <Users size={14} color="#4f46e5" />
                                </View>
                                <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Playmaker</Text>
                            </View>
                            <Text className="font-black text-slate-900 text-lg leading-6 mb-1" numberOfLines={1}>{stats.topAssister.player?.name}</Text>
                            <Text className="font-bold text-indigo-500 text-xs">{stats.topAssister.assists} Assists</Text>
                        </View>
                    )}
                </View>

                {/* Segmented Control Tabs */}
                <View className="px-4 mb-6">
                    <View className="flex-row bg-slate-100/80 p-1.5 rounded-2xl">
                        {(['TABLE', 'MATCHES', 'TEAMS'] as const).map(tab => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                className="flex-1 py-3 rounded-xl items-center"
                                style={{
                                    backgroundColor: activeTab === tab ? '#ffffff' : 'transparent',
                                    shadowColor: activeTab === tab ? '#000' : 'transparent',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: activeTab === tab ? 0.08 : 0,
                                    shadowRadius: 4,
                                    elevation: activeTab === tab ? 2 : 0,
                                }}
                            >
                                <Text
                                    className="text-[11px] font-black uppercase tracking-wider"
                                    style={{ color: activeTab === tab ? '#0f172a' : '#94a3b8' }}
                                >
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Tab Content */}
                <View className="px-4">
                    {activeTab === 'TABLE' && (
                        <View className="bg-white rounded-2xl overflow-hidden border border-slate-50 mx-1">
                            {/* Header */}
                            <View className="flex-row py-3 border-b border-slate-100 px-2 bg-slate-50/50 rounded-t-2xl">
                                <Text className="w-8 font-bold text-slate-500 text-[10px] text-center">#</Text>
                                <Text className="flex-1 font-bold text-slate-700 text-[10px] uppercase pl-2">Team</Text>
                                <Text className="w-8 font-bold text-slate-500 text-[10px] text-center">MP</Text>
                                <Text className="w-6 font-bold text-slate-500 text-[10px] text-center">W</Text>
                                <Text className="w-6 font-bold text-slate-500 text-[10px] text-center">D</Text>
                                <Text className="w-6 font-bold text-slate-500 text-[10px] text-center">L</Text>
                                <Text className="w-10 font-bold text-slate-500 text-[10px] text-center">+/-</Text>
                                <Text className="w-9 font-bold text-slate-500 text-[10px] text-center">GD</Text>
                                <Text className="w-8 font-bold text-slate-700 text-[10px] text-center">PTS</Text>
                            </View>

                            {/* Rows */}
                            {tableData.map((row, i) => {
                                const goalDiff = row.gf - row.ga;
                                const gdDisplay = goalDiff > 0 ? `+${goalDiff}` : goalDiff;
                                return (
                                    <View key={row.team?.id || i} className="flex-row py-2.5 items-center px-2 border-b border-slate-50/50 hover:bg-slate-50">
                                        <View className="w-8 items-center">
                                            <Text className={`font-black text-sm ${i < 3 ? 'text-amber-500' : 'text-slate-900'}`}>{i + 1}</Text>
                                        </View>

                                        <View className="flex-1 flex-row items-center pl-2">
                                            <Text className="font-black text-slate-800 text-sm" numberOfLines={1}>{row.team?.name}</Text>
                                        </View>

                                        <Text className="w-8 text-slate-400 font-bold text-[11px] text-center">{row.p}</Text>
                                        <Text className="w-6 text-slate-400 font-bold text-[11px] text-center">{row.w}</Text>
                                        <Text className="w-6 text-slate-400 font-bold text-[11px] text-center">{row.d}</Text>
                                        <Text className="w-6 text-slate-400 font-bold text-[11px] text-center">{row.l}</Text>

                                        <View className="w-10 items-center">
                                            <Text className="text-slate-400 font-bold text-[10px] text-center">{row.gf}-{row.ga}</Text>
                                        </View>

                                        <View className="w-9 items-center">
                                            <View className="bg-slate-50 px-1.5 py-0.5 rounded-md">
                                                <Text className={`font-bold text-[10px] ${goalDiff > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>{gdDisplay}</Text>
                                            </View>
                                        </View>

                                        <Text className="w-8 text-slate-900 font-black text-sm text-center">{row.pts}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {activeTab === 'MATCHES' && (
                        <View>
                            {seasonMatches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(match => (
                                <View key={match.id} className="bg-white p-5 rounded-3xl mb-4 border border-slate-100 shadow-sm shadow-slate-200">
                                    <View className="items-center mb-4">
                                        <View className="bg-slate-50 px-3 py-1 rounded-full">
                                            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                                {new Date(match.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="flex-row justify-between items-center">
                                        <Text className={`flex-1 text-right text-sm font-bold ${match.homeScore > match.awayScore ? 'text-slate-900' : 'text-slate-500'}`} numberOfLines={1}>
                                            {teams.find(t => t.id === match.homeTeamId)?.name}
                                        </Text>

                                        <View className="px-4 mx-2">
                                            <View className="bg-slate-900 px-4 py-2 rounded-xl shadow-sm">
                                                <Text className="font-black text-xl text-white tracking-widest">
                                                    {match.homeScore} - {match.awayScore}
                                                </Text>
                                            </View>
                                        </View>

                                        <Text className={`flex-1 text-left text-sm font-bold ${match.awayScore > match.homeScore ? 'text-slate-900' : 'text-slate-500'}`} numberOfLines={1}>
                                            {teams.find(t => t.id === match.awayTeamId)?.name}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {activeTab === 'TEAMS' && (
                        <View className="gap-3">
                            {allSeasonTeams.map(team => {
                                const teamPlayers = players.filter(p => p.teamId === team.id);
                                return (
                                    <View key={team.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200">
                                        <View className="flex-row items-center mb-4 pb-4 border-b border-slate-50">
                                            <View className="w-12 h-12 bg-slate-50 rounded-2xl items-center justify-center mr-4 shadow-sm border border-slate-100">
                                                <Text className="font-black text-lg text-slate-900">{team.initials}</Text>
                                            </View>
                                            <View>
                                                <Text className="font-black text-lg text-slate-900">{team.name}</Text>
                                                <Text className="text-xs text-slate-400 font-bold uppercase tracking-wider">{teamPlayers.length} Players Registered</Text>
                                            </View>
                                        </View>
                                        <View className="flex-row flex-wrap gap-2">
                                            {teamPlayers.map(p => (
                                                <View key={p.id} className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                    <Text className="text-slate-600 text-xs font-bold">{p.name}</Text>
                                                </View>
                                            ))}
                                            {teamPlayers.length === 0 && <Text className="text-slate-400 text-xs italic">No players listed</Text>}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
