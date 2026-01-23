import { Shield, Trophy, Users } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useLeague } from '../../../context/LeagueContext';

type StatType = 'goals' | 'assists';

export default function MatchStatsScreen() {
    const { matches, players, teams, currentSeason } = useLeague();
    const [activeTab, setActiveTab] = useState<StatType>('goals');

    const statsData = useMemo(() => {
        if (!currentSeason) return { scorers: [], assisters: [] };

        const seasonMatches = matches.filter(m => m.seasonId === currentSeason.id && m.isFinished);
        const playerStats: Record<string, { goals: number, assists: number, teamId: string }> = {};

        // Initialize with players (to show 0 if needed, but usually we filter > 0)
        // We actually only care about players who have stats.

        seasonMatches.forEach(match => {
            match.events?.forEach(event => {
                if (!playerStats[event.playerId]) {
                    // Find player's current team (fallback to event teamId if reliable, but player.teamId is current)
                    const player = players.find(p => p.id === event.playerId);
                    playerStats[event.playerId] = {
                        goals: 0,
                        assists: 0,
                        teamId: player?.teamId || event.teamId || ''
                    };
                }

                if (event.type === 'GOAL') {
                    playerStats[event.playerId].goals++;

                    if (event.assistantId) {
                        if (!playerStats[event.assistantId]) {
                            const assistant = players.find(p => p.id === event.assistantId);
                            playerStats[event.assistantId] = {
                                goals: 0,
                                assists: 0,
                                teamId: assistant?.teamId || '' // Assistant team might be inferred
                            };
                        }
                        playerStats[event.assistantId].assists++;
                    }
                }
            });
        });

        const scorers = Object.entries(playerStats)
            .map(([id, stats]) => ({ id, ...stats }))
            .filter(p => p.goals > 0)
            .sort((a, b) => b.goals - a.goals);

        const assisters = Object.entries(playerStats)
            .map(([id, stats]) => ({ id, ...stats }))
            .filter(p => p.assists > 0)
            .sort((a, b) => b.assists - a.assists);

        return { scorers, assisters };
    }, [matches, players, currentSeason]);

    const getPlayerName = (id: string) => players.find(p => p.id === id)?.name || 'Unknown';
    const getTeamInitials = (id: string) => teams.find(t => t.id === id)?.initials || '??';
    const getTeamColor = (id: string) => teams.find(t => t.id === id)?.color || '#94a3b8';

    const renderItem = ({ item, index }: { item: any, index: number }) => {
        const rank = index + 1;
        const isTop3 = rank <= 3;

        return (
            <View className="flex-row items-center bg-white p-4 mb-2 rounded-2xl border border-slate-50">
                <View className="w-8 items-center justify-center mr-2">
                    {rank === 1 ? (
                        <Trophy size={20} color="#fbbf24" fill="#fbbf24" />
                    ) : rank === 2 ? (
                        <Trophy size={18} color="#94a3b8" fill="#94a3b8" />
                    ) : rank === 3 ? (
                        <Trophy size={16} color="#b45309" fill="#b45309" />
                    ) : (
                        <Text className="font-bold text-slate-400">{rank}</Text>
                    )}
                </View>

                <View className="flex-1 ml-2">
                    <Text className="font-bold text-slate-900 text-base">{getPlayerName(item.id)}</Text>
                    <Text className="text-xs text-slate-400 font-medium">
                        {teams.find(t => t.id === item.teamId)?.name}
                    </Text>
                </View>

                <View className="items-end">
                    <Text className="text-2xl font-black text-slate-900 tracking-tighter">
                        {activeTab === 'goals' ? item.goals : item.assists}
                    </Text>
                    <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {activeTab === 'goals' ? 'Goals' : 'Assists'}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-secondary">
            {/* Segmented Control */}
            <View className="bg-white p-2 mx-4 mt-4 mb-2 rounded-xl flex-row border border-slate-100 shadow-sm shadow-slate-200">
                <TouchableOpacity
                    onPress={() => setActiveTab('goals')}
                    activeOpacity={0.7}
                    className="flex-1 py-2.5 rounded-lg items-center flex-row justify-center"
                    style={activeTab === 'goals' ? { backgroundColor: '#0f172a' } : {}}
                >
                    <Trophy size={16} color={activeTab === 'goals' ? 'white' : '#64748b'} />
                    <Text className="ml-2 font-bold text-xs uppercase tracking-wider" style={{ color: activeTab === 'goals' ? 'white' : '#64748b' }}>Top Scorers</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('assists')}
                    activeOpacity={0.7}
                    className="flex-1 py-2.5 rounded-lg items-center flex-row justify-center"
                    style={activeTab === 'assists' ? { backgroundColor: '#0f172a' } : {}}
                >
                    <Users size={16} color={activeTab === 'assists' ? 'white' : '#64748b'} />
                    <Text className="ml-2 font-bold text-xs uppercase tracking-wider" style={{ color: activeTab === 'assists' ? 'white' : '#64748b' }}>Assists</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={activeTab === 'goals' ? statsData.scorers : statsData.assisters}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="items-center justify-center py-20 opacity-50">
                        <Shield size={48} color="#cbd5e1" />
                        <Text className="text-slate-400 font-bold mt-4">No stats recorded yet</Text>
                    </View>
                }
            />
        </View>
    );
}
