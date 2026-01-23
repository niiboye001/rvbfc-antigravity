import { Circle, ClipboardList, Info } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';
import { useLeague } from '../../../context/LeagueContext';

export default function CurrentMatchScreen() {
    const { matches, teams, players } = useLeague();

    // Logic to find current match (latest or live)
    const currentMatch = [...matches]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    const getTeam = (id: string) => teams.find(t => t.id === id);

    if (!currentMatch) {
        return (
            <View className="flex-1 bg-secondary justify-center items-center">
                <Text className="text-slate-500">No match data available.</Text>
            </View>
        );
    }

    const homeTeam = getTeam(currentMatch.homeTeamId);
    const awayTeam = getTeam(currentMatch.awayTeamId);

    return (
        <ScrollView
            className="flex-1 bg-secondary"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
        >
            {/* Drammatic Score Header */}
            <View className="px-5 pt-8 mb-8">
                <View className="bg-blue-600 rounded-3xl p-8 shadow-lg shadow-blue-200 relative overflow-hidden">
                    {/* Gradient Background */}
                    <View className="absolute inset-0 bg-blue-600" />
                    {/* Decorative Circles */}
                    <View className="absolute top-[-50] right-[-50] w-64 h-64 bg-blue-500 rounded-full opacity-50" />
                    <View className="absolute bottom-[-20] left-[-20] w-32 h-32 bg-indigo-600 rounded-full opacity-50" />

                    <View className="items-center mb-8">
                        <View className="bg-blue-800/50 px-4 py-1.5 rounded-full border border-blue-400/30">
                            <Text className="text-white text-[10px] font-black uppercase tracking-[3px]">
                                {new Date(currentMatch.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row justify-between items-center mb-8">
                        <View className="items-center flex-1">
                            <Text className="font-black text-white text-xl text-center leading-6" numberOfLines={2}>{homeTeam?.name}</Text>
                        </View>

                        <View className="items-center px-4">
                            <View className="flex-row items-center mb-1">
                                <Text className="text-6xl font-black text-white tracking-tighter">
                                    {currentMatch.homeScore}
                                </Text>
                                <View className="w-5 h-[3px] bg-white/20 mx-4" />
                                <Text className="text-6xl font-black text-white tracking-tighter">
                                    {currentMatch.awayScore}
                                </Text>
                            </View>
                            <View className="bg-green-500/20 px-3 py-1 rounded-full border border-green-500/20">
                                <Text className="text-[10px] font-black text-green-400 uppercase tracking-widest">
                                    {currentMatch.isFinished ? 'Full Time' : 'Live'}
                                </Text>
                            </View>
                        </View>

                        <View className="items-center flex-1">
                            <Text className="font-black text-white text-xl text-center leading-6" numberOfLines={2}>{awayTeam?.name}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Event Timeline */}
            <View className="px-6">
                <View className="bg-white rounded-3xl border border-slate-50 p-6">
                    <View className="flex-row items-center justify-between mb-8 border-b border-slate-50 pb-4">
                        <View className="flex-row items-center">
                            <View className="bg-blue-500/10 p-2 rounded-xl mr-3">
                                <ClipboardList size={20} color="#3b82f6" />
                            </View>
                            <Text className="font-black text-slate-900 text-lg">Match Events</Text>
                        </View>
                        <Text className="text-slate-300 font-black text-[10px] uppercase tracking-widest">{currentMatch.events.length} Tot</Text>
                    </View>

                    {currentMatch.events && currentMatch.events.length > 0 ? (
                        currentMatch.events.sort((a, b) => (b.minute || 0) - (a.minute || 0)).map((event, idx) => {
                            const player = players.find(p => p.id === event.playerId);
                            const isHome = event.teamId === currentMatch.homeTeamId;
                            const team = isHome ? homeTeam : awayTeam;

                            return (
                                <View key={event.id} className="mb-10 last:mb-0">
                                    <View className="flex-1">
                                        <View className="flex-row items-center justify-between mb-1">
                                            <View className="flex-row items-center flex-1">
                                                {event.type === 'GOAL' && (
                                                    <View className="mr-2">
                                                        <Circle size={10} color="#22c55e" fill="#22c55e" />
                                                    </View>
                                                )}
                                                {event.type === 'YELLOW_CARD' && (
                                                    <View className="w-2 h-3 bg-yellow-400 rounded-[1px] mr-2" />
                                                )}
                                                {event.type === 'RED_CARD' && (
                                                    <View className="w-2 h-3 bg-red-500 rounded-[1px] mr-2" />
                                                )}
                                                <Text className="font-black text-slate-900 text-base flex-1">
                                                    {player?.name}
                                                    {event.type === 'GOAL' && event.assistantId ? (
                                                        <Text className="text-slate-400 text-xs font-bold"> (Asst: {players.find(p => p.id === event.assistantId)?.name})</Text>
                                                    ) : null}
                                                </Text>
                                            </View>
                                            <View className="bg-slate-50 px-2 py-0.5 rounded-md">
                                                <Text className="text-[10px] font-black text-slate-400 uppercase">{isHome ? 'Home' : 'Away'}</Text>
                                            </View>
                                        </View>
                                        <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">{event.type.replace('_', ' ')}</Text>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <View className="items-center py-10">
                            <View className="w-16 h-16 rounded-full bg-slate-50 items-center justify-center mb-4">
                                <Info size={24} color="#cbd5e1" />
                            </View>
                            <Text className="text-slate-400 font-bold italic">No events recorded yet</Text>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}
