import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Circle, ClipboardList, Info } from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLeague } from '../../context/LeagueContext';

export default function MatchDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { matches, teams, players } = useLeague();

    // Find the match
    const match = matches.find(m => m.id === id);

    if (!match) {
        return (
            <View className="flex-1 bg-secondary items-center justify-center">
                <Text className="text-slate-500 font-bold">Match not found</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-primary px-6 py-3 rounded-full">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const homeTeam = teams.find(t => t.id === match.homeTeamId);
    const awayTeam = teams.find(t => t.id === match.awayTeamId);

    // Filter relevant events if needed (though match.events should be complete)
    const events = match.events || [];

    return (
        <View className="flex-1 bg-secondary">
            <View className="bg-white pt-24 pb-8 border-b border-slate-100 relative justify-center items-center">
                <TouchableOpacity onPress={() => router.back()} className="absolute left-4 bottom-8 p-2 bg-slate-50 rounded-full z-10">
                    <ChevronLeft size={24} color="#0f172a" />
                </TouchableOpacity>
                <View className="items-center px-12">
                    <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Match Detail</Text>
                    <Text className="text-2xl font-black text-slate-900 tracking-[1px] uppercase text-center leading-8">
                        {new Date(match.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' })}
                    </Text>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* Drammatic Score Header (Replicated from Match Center) */}
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
                                    {new Date(match.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row justify-between items-center mb-8">
                            {/* Home Team */}
                            <View className="items-center flex-1">
                                <Text className="font-black text-white text-xl text-center leading-6" numberOfLines={2}>{homeTeam?.name}</Text>
                            </View>

                            {/* Score */}
                            <View className="items-center px-4">
                                <View className="flex-row items-center mb-1">
                                    <Text className="text-6xl font-black text-white tracking-tighter">
                                        {match.homeScore}
                                    </Text>
                                    <View className="w-5 h-[3px] bg-white/20 mx-4" />
                                    <Text className="text-6xl font-black text-white tracking-tighter">
                                        {match.awayScore}
                                    </Text>
                                </View>
                                <View className="bg-green-500/20 px-3 py-1 rounded-full border border-green-500/20">
                                    <Text className="text-[10px] font-black text-green-400 uppercase tracking-widest">
                                        {match.isFinished ? 'Full Time' : 'Live'}
                                    </Text>
                                </View>
                            </View>

                            {/* Away Team */}
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
                                <Text className="font-black text-slate-900 text-lg">Match Stats</Text>
                            </View>
                            <Text className="text-slate-300 font-black text-[10px] uppercase tracking-widest">{events.length} Events</Text>
                        </View>

                        {events && events.length > 0 ? (
                            events.sort((a, b) => (a.minute || 0) - (b.minute || 0)).map((event, idx) => {
                                const player = players.find(p => p.id === event.playerId);
                                const isHome = event.teamId === match.homeTeamId;
                                const team = isHome ? homeTeam : awayTeam;

                                return (
                                    <View key={event.id} className="mb-6 last:mb-0">
                                        <View className="flex-row items-center justify-between mb-2">
                                            <View className="flex-row items-center flex-1">
                                                {/* Icon Based on Type */}
                                                <View className="w-8 items-center justify-center mr-2">
                                                    {(event.type === 'GOAL' || event.type === 'PENALTY_GOAL') && <Circle size={12} color="#22c55e" fill="#22c55e" />}
                                                    {event.type === 'YELLOW_CARD' && <View className="w-3 h-4 bg-yellow-400 rounded-[2px]" />}
                                                    {event.type === 'RED_CARD' && <View className="w-3 h-4 bg-red-500 rounded-[2px]" />}
                                                </View>

                                                <View className="flex-1">
                                                    <Text className="font-bold text-slate-900 text-sm">
                                                        {player?.name}
                                                    </Text>
                                                    {['GOAL', 'PENALTY_GOAL'].includes(event.type) ? (
                                                        <Text className="text-xs text-slate-400 font-medium">
                                                            {event.assistantId
                                                                ? `Assist: ${players.find(p => p.id === event.assistantId)?.name}`
                                                                : event.type === 'PENALTY_GOAL' ? '(Penalty)' : 'Goal'}
                                                        </Text>
                                                    ) : (
                                                        <Text className="text-xs text-slate-400 font-medium capitalize">
                                                            {event.type.replace('_', ' ').toLowerCase()}
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>

                                            <View className="items-end">
                                                <View className="bg-slate-50 px-2 py-1 rounded-md mb-1">
                                                    <Text className="text-[10px] font-bold text-slate-500 uppercase">{isHome ? 'Home' : 'Away'}</Text>
                                                </View>
                                                {/* Minute if we had it, for now just placeholder or omit */}
                                            </View>
                                        </View>
                                        {/* Divider line except for last item */}
                                        {idx < events.length - 1 && <View className="h-[1px] bg-slate-50 ml-10" />}
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
        </View>
    );
}
