import { Circle, Info, Trophy } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';
import { useLeague } from '../../../context/LeagueContext';
import { MatchEvent } from '../../../types';

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

    const EventIcon = ({ type }: { type: MatchEvent['type'] }) => {
        switch (type) {
            case 'GOAL': return <Circle size={14} color="#22c55e" fill="#22c55e" />;
            case 'YELLOW_CARD': return <View className="w-3 h-4 bg-yellow-400 rounded-sm" />;
            case 'RED_CARD': return <View className="w-3 h-4 bg-red-500 rounded-sm" />;
            case 'ASSIST': return <Trophy size={14} color="#3b82f6" />;
            default: return <Info size={14} color="#94a3b8" />;
        }
    };

    return (
        <ScrollView className="flex-1 bg-secondary p-4">
            <View className="bg-white rounded-xl shadow-sm p-6 mb-4 items-center">
                <Text className="text-slate-500 font-bold mb-4 text-base">{new Date(currentMatch.date).toLocaleDateString()}</Text>
                <View className="flex-row justify-between w-full items-center">
                    <View className="items-center flex-1">
                        <View className="w-20 h-20 rounded-full items-center justify-center mb-3 border border-slate-100 shadow-sm" style={{ backgroundColor: homeTeam?.color ? `${homeTeam.color}15` : '#f8fafc' }}>
                            <Text className="font-black text-2xl" style={{ color: homeTeam?.color || '#334155' }}>{homeTeam?.initials}</Text>
                        </View>
                        <Text className="font-bold text-slate-800 text-center text-sm" numberOfLines={1}>{homeTeam?.name}</Text>
                    </View>
                    <View className="items-center px-4">
                        <Text className="text-5xl font-black text-primary mb-2">
                            {currentMatch.homeScore} - {currentMatch.awayScore}
                        </Text>
                        <Text className="text-sm font-bold text-green-500 uppercase tracking-widest">{currentMatch.isFinished ? 'FT' : 'LIVE'}</Text>
                    </View>
                    <View className="items-center flex-1">
                        <View className="w-20 h-20 rounded-full items-center justify-center mb-3 border border-slate-100 shadow-sm" style={{ backgroundColor: awayTeam?.color ? `${awayTeam.color}15` : '#f8fafc' }}>
                            <Text className="font-black text-2xl" style={{ color: awayTeam?.color || '#334155' }}>{awayTeam?.initials}</Text>
                        </View>
                        <Text className="font-bold text-slate-800 text-center text-sm" numberOfLines={1}>{awayTeam?.name}</Text>
                    </View>
                </View>
            </View>

            <View className="bg-white rounded-xl shadow-sm p-5">
                <Text className="font-bold text-slate-800 mb-4 text-lg">Match Events</Text>
                {currentMatch.events && currentMatch.events.length > 0 ? (
                    currentMatch.events.sort((a, b) => (b.minute || 0) - (a.minute || 0)).map((event) => {
                        const player = players.find(p => p.id === event.playerId);
                        const isHome = event.teamId === currentMatch.homeTeamId;
                        return (
                            <View key={event.id} className="flex-row items-center py-4 border-b border-slate-50 last:border-0">
                                <View className="flex-1 flex-row items-center px-2 ml-2">
                                    <View className="mr-3">
                                        <EventIcon type={event.type} />
                                    </View>
                                    <View>
                                        <Text className="font-bold text-slate-800 text-base">
                                            {player?.name}
                                            {event.type === 'GOAL' && event.assistantId ? (
                                                <Text className="text-slate-400 text-sm font-normal"> (Asst: {players.find(p => p.id === event.assistantId)?.name})</Text>
                                            ) : null}
                                        </Text>
                                        <Text className="text-slate-400 text-xs uppercase tracking-tight">{event.type.replace('_', ' ')}</Text>
                                    </View>
                                </View>
                                <View className="px-3">
                                    <View className="w-6 h-6 rounded-full items-center justify-center bg-slate-100">
                                        <Text className="text-[10px] font-bold text-slate-500">{isHome ? 'H' : 'A'}</Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })
                ) : (
                    <Text className="text-slate-400 text-center italic text-base">No events recorded</Text>
                )}
            </View>
        </ScrollView>
    );
}
