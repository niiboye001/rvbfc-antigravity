import { ClipboardList, Info } from 'lucide-react-native';
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
            <View className="px-6 mb-10">
                <View className="bg-white rounded-3xl p-6 shadow-sm shadow-slate-200 border border-slate-100">
                    <View className="flex-row items-center justify-between mb-8 border-b border-slate-50 pb-4">
                        <View className="flex-row items-center">
                            <View className="bg-blue-500/10 p-2 rounded-xl mr-3">
                                <ClipboardList size={20} color="#3b82f6" />
                            </View>
                            <Text className="font-black text-slate-900 text-lg">Match Events</Text>
                        </View>
                        <View className="bg-blue-50 px-3 py-1 rounded-full">
                            <Text className="text-blue-600 font-extrabold text-[10px] uppercase tracking-widest">{currentMatch.events.length} Events</Text>
                        </View>
                    </View>

                    {currentMatch.events && currentMatch.events.length > 0 ? (
                        <View className="relative">
                            {/* Central Line */}
                            <View className="absolute left-[50%] top-2 bottom-2 w-[2px] bg-slate-100 -ml-[1px]" />

                            {currentMatch.events.sort((a, b) => (b.minute || 0) - (a.minute || 0)).map((event, idx) => {
                                const player = players.find(p => p.id === event.playerId);
                                const isHome = event.teamId === currentMatch.homeTeamId;
                                const assistant = event.assistantId ? players.find(p => p.id === event.assistantId) : null;

                                return (
                                    <View key={event.id} className="flex-row items-center mb-8">
                                        {/* Left Side (Home) */}
                                        <View className={`flex-1 pr-4 ${isHome ? 'items-end' : ''}`}>
                                            {isHome && (
                                                <View className="items-end">
                                                    <Text className="font-black text-slate-900 text-sm mb-0.5 text-right">{player?.name}</Text>
                                                    {event.type === 'GOAL' && assistant ? (
                                                        <Text className="text-slate-400 text-[10px] font-bold text-right mb-1">Asst: {assistant.name}</Text>
                                                    ) : null}
                                                    {(event.type === 'GOAL' || event.type === 'PENALTY_GOAL') ? (
                                                        <View className="items-end">
                                                            {event.type === 'PENALTY_GOAL' && (
                                                                <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Penalty</Text>
                                                            )}
                                                        </View>
                                                    ) : (
                                                        <View className="bg-slate-50 px-2 py-0.5 rounded flex-row items-center">
                                                            <Text className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{event.type.replace('_', ' ')}</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            )}
                                        </View>

                                        {/* Center Icon */}
                                        <View className="z-10 bg-white p-1 rounded-full border-2 border-slate-50 shadow-sm shadow-slate-100 w-8 h-8 items-center justify-center">
                                            {event.type === 'GOAL' || event.type === 'PENALTY_GOAL' ? (
                                                <Text className="text-sm">⚽</Text>
                                            ) : event.type === 'YELLOW_CARD' ? (
                                                <View className="w-3 h-4 bg-yellow-400 rounded-[2px]" />
                                            ) : event.type === 'RED_CARD' ? (
                                                <View className="w-3 h-4 bg-red-500 rounded-[2px]" />
                                            ) : (
                                                <View className="w-3 h-3 bg-slate-400 rounded-full" />
                                            )}
                                        </View>

                                        {/* Right Side (Away) */}
                                        <View className={`flex-1 pl-4 ${!isHome ? 'items-start' : ''}`}>
                                            {!isHome && (
                                                <View className="items-start">
                                                    <Text className="font-black text-slate-900 text-sm mb-0.5 text-left">{player?.name}</Text>
                                                    {event.type === 'GOAL' && assistant ? (
                                                        <Text className="text-slate-400 text-[10px] font-bold text-left mb-1">Asst: {assistant.name}</Text>
                                                    ) : null}
                                                    {(event.type === 'GOAL' || event.type === 'PENALTY_GOAL') ? (
                                                        <View className="items-start">
                                                            {event.type === 'PENALTY_GOAL' && (
                                                                <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Penalty</Text>
                                                            )}
                                                        </View>
                                                    ) : (
                                                        <View className="bg-slate-50 px-2 py-0.5 rounded flex-row items-center">
                                                            <Text className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{event.type.replace('_', ' ')}</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    ) : (
                        <View className="items-center py-10">
                            <View className="w-16 h-16 rounded-full bg-slate-50 items-center justify-center mb-4 border border-slate-100">
                                <Info size={24} color="#94a3b8" />
                            </View>
                            <Text className="text-slate-400 font-bold text-sm">No events recorded yet</Text>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}
