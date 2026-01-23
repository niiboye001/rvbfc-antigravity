import { Calendar, Info } from 'lucide-react-native';
import { useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useLeague } from '../../../context/LeagueContext';

export default function MatchesListScreen() {
    const { matches, teams, currentSeason } = useLeague();

    // Get all matches for the current season, sorted by date (newest first)
    const seasonMatches = useMemo(() => {
        if (!currentSeason) return [];
        return matches
            .filter(m => m.seasonId === currentSeason.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [matches, currentSeason]);

    const getTeamInitials = (id: string) => teams.find(t => t.id === id)?.initials || '??';
    const getTeamColor = (id: string) => teams.find(t => t.id === id)?.color || '#94a3b8';

    const renderItem = ({ item }: { item: any }) => {
        return (
            <View className="bg-white p-4 rounded-xl shadow-sm shadow-slate-200 mb-3 border border-slate-100 mx-4">
                <View className="flex-row items-center justify-between">
                    <View className="flex-1 flex-row items-center justify-between">
                        {/* Home */}
                        <View className="flex-1 flex-row items-center justify-end">
                            <Text className="font-bold text-slate-700 text-right" numberOfLines={1}>
                                {teams.find(t => t.id === item.homeTeamId)?.name}
                            </Text>
                        </View>

                        {/* Score */}
                        <View className="mx-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 min-w-[80px] items-center">
                            {item.isFinished ? (
                                <Text className="font-black text-slate-900 text-lg">{item.homeScore} - {item.awayScore}</Text>
                            ) : (
                                <Text className="font-bold text-slate-400 text-xs uppercase tracking-widest">VS</Text>
                            )}
                        </View>

                        {/* Away */}
                        <View className="flex-1 flex-row items-center">
                            <Text className="font-bold text-slate-700" numberOfLines={1}>
                                {teams.find(t => t.id === item.awayTeamId)?.name}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="mt-3 flex-row items-center justify-center border-t border-slate-50 pt-2">
                    <Calendar size={12} color="#94a3b8" />
                    <Text className="text-xs text-slate-400 font-medium ml-1">
                        {new Date(item.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                        {item.isFinished ? '' : ' • ' + new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    {item.isFinished && (
                        <View className="ml-2 bg-green-50 px-2 py-0.5 rounded-full">
                            <Text className="text-[9px] font-bold text-green-600 uppercase">FT</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-secondary">
            <FlatList
                data={seasonMatches}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingVertical: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="items-center justify-center py-20 opacity-50">
                        <Info size={48} color="#cbd5e1" />
                        <Text className="text-slate-400 font-bold mt-4">No matches scheduled</Text>
                    </View>
                }
            />
        </View>
    );
}
