import * as Haptics from 'expo-haptics';
import { ChevronDown, Plus, X } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLeague } from '../../context/LeagueContext';
import { MatchEvent, MatchEventType } from '../../types';

export default function EnterMatchResult() {
    const { teams, players, addMatch, currentSeason, deleteMatch } = useLeague();

    const [homeTeamId, setHomeTeamId] = useState('');
    const [awayTeamId, setAwayTeamId] = useState('');
    const [homeScore, setHomeScore] = useState('');
    const [awayScore, setAwayScore] = useState('');
    const [events, setEvents] = useState<MatchEvent[]>([]);

    const [teamPickerVisible, setTeamPickerVisible] = useState<'home' | 'away' | null>(null);

    // Event Modal
    const [eventModalVisible, setEventModalVisible] = useState(false);
    const [eventType, setEventType] = useState<MatchEventType>('GOAL');
    const [eventTeamId, setEventTeamId] = useState('');
    const [eventPlayerId, setEventPlayerId] = useState('');
    const [eventAssistantId, setEventAssistantId] = useState('');

    const [eventPlayerPickerVisible, setEventPlayerPickerVisible] = useState(false);
    const [eventAssistantPickerVisible, setEventAssistantPickerVisible] = useState(false);

    const handleAddEvent = () => {
        if (!eventTeamId || !eventPlayerId) {
            Alert.alert('Error', 'Please fill all event details');
            return;
        }
        const newEvent: MatchEvent = {
            id: Date.now().toString(),
            type: eventType,
            teamId: eventTeamId,
            playerId: eventPlayerId,
            assistantId: eventAssistantId || undefined,
            minute: 0,
        };
        setEvents([...events, newEvent]);
        setEventModalVisible(false);
        setEventAssistantId(''); // Reset for next event
    };

    const handleDelete = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert('Delete Match', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: () => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    deleteMatch(id);
                }
            }
        ]);
    };

    const handleSave = () => {
        if (!homeTeamId || !awayTeamId || !homeScore || !awayScore) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Please fill required match details');
            return;
        }
        if (homeTeamId === awayTeamId) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Home and Away teams cannot be the same.');
            return;
        }
        if (!currentSeason) {
            Alert.alert('Error', 'No active season');
            return;
        }

        addMatch({
            id: Date.now().toString(),
            seasonId: currentSeason.id,
            date: new Date().toISOString(),
            homeTeamId,
            awayTeamId,
            homeScore: parseInt(homeScore),
            awayScore: parseInt(awayScore),
            isFinished: true,
            events: events,
        });

        Alert.alert('Success', 'Match result saved');
        // Reset form
        setHomeTeamId('');
        setAwayTeamId('');
        setHomeScore('');
        setAwayScore('');
        setEvents([]);
    };

    const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || 'Select Team';
    const getPlayerName = (id: string) => players.find(p => p.id === id)?.name || 'Select Player';

    return (
        <ScrollView className="flex-1 bg-secondary p-4">
            <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
                <Text className="font-bold text-lg text-primary mb-4">Match Details</Text>

                <View className="flex-row justify-between mb-4">
                    <View className="flex-1 mr-2">
                        <Text className="font-bold text-slate-500 mb-2">Home Team</Text>
                        <TouchableOpacity
                            className="bg-slate-100 p-3 rounded-lg flex-row justify-between items-center"
                            onPress={() => setTeamPickerVisible('home')}
                        >
                            <Text className="text-slate-800 font-bold text-xs" numberOfLines={1}>{getTeamName(homeTeamId)}</Text>
                            <ChevronDown size={16} color="#64748b" />
                        </TouchableOpacity>
                    </View>
                    <View className="flex-1 ml-2">
                        <Text className="font-bold text-slate-500 mb-2">Away Team</Text>
                        <TouchableOpacity
                            className="bg-slate-100 p-3 rounded-lg flex-row justify-between items-center"
                            onPress={() => setTeamPickerVisible('away')}
                        >
                            <Text className="text-slate-800 font-bold text-xs" numberOfLines={1}>{getTeamName(awayTeamId)}</Text>
                            <ChevronDown size={16} color="#64748b" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="flex-row justify-between mb-4">
                    <View className="flex-1 mr-2">
                        <Text className="font-bold text-slate-500 mb-2">Home Goals</Text>
                        <TextInput
                            className="bg-slate-100 p-3 rounded-lg text-center font-black text-lg"
                            keyboardType="numeric"
                            value={homeScore}
                            onChangeText={setHomeScore}
                        />
                    </View>
                    <View className="flex-1 ml-2">
                        <Text className="font-bold text-slate-500 mb-2">Away Goals</Text>
                        <TextInput
                            className="bg-slate-100 p-3 rounded-lg text-center font-black text-lg"
                            keyboardType="numeric"
                            value={awayScore}
                            onChangeText={setAwayScore}
                        />
                    </View>
                </View>
            </View>

            <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="font-bold text-lg text-primary">Match Events</Text>
                    <TouchableOpacity onPress={() => setEventModalVisible(true)} className="flex-row items-center">
                        <Plus size={16} color="#3b82f6" />
                        <Text className="text-blue-500 font-bold ml-1">Add Event</Text>
                    </TouchableOpacity>
                </View>

                {events.length === 0 ? (
                    <Text className="text-slate-400 italic text-center py-2">No events added</Text>
                ) : (
                    events.map((ev, index) => (
                        <View key={index} className="flex-row justify-between py-2 border-b border-slate-100 last:border-0 items-center">
                            <View className="flex-1">
                                <Text className="font-bold text-slate-800">{ev.type}</Text>
                                {ev.assistantId ? (
                                    <Text className="text-[10px] text-slate-400">Asst: {getPlayerName(ev.assistantId)}</Text>
                                ) : null}
                            </View>
                            <Text className="text-slate-500 flex-1 text-right">{getPlayerName(ev.playerId)}</Text>
                        </View>
                    ))
                )}
            </View>

            <TouchableOpacity className="bg-primary p-4 rounded-xl items-center mb-8" onPress={handleSave}>
                <Text className="text-white font-bold text-lg">Submit Final Result</Text>
            </TouchableOpacity>

            {/* Team Picker Modal */}
            <Modal animationType="fade" transparent visible={!!teamPickerVisible}>
                <View className="flex-1 bg-black/50 justify-center p-6">
                    <View className="bg-white rounded-[32px] max-h-[60%] p-6">
                        <View className="items-center mb-4">
                            <View className="w-12 h-1.5 bg-slate-100 rounded-full" />
                        </View>
                        <Text className="text-xl font-bold mb-6 text-center text-primary">Select Team</Text>
                        <FlatList
                            data={teams.filter(t => {
                                if (teamPickerVisible === 'home') return t.id !== awayTeamId;
                                if (teamPickerVisible === 'away') return t.id !== homeTeamId;
                                return true;
                            })}
                            keyExtractor={t => t.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className="p-4 border-b border-slate-100"
                                    onPress={() => {
                                        if (teamPickerVisible === 'home') setHomeTeamId(item.id);
                                        if (teamPickerVisible === 'away') setAwayTeamId(item.id);
                                        setTeamPickerVisible(null);
                                    }}
                                >
                                    <Text className="text-center font-bold text-slate-700">{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity className="mt-4 p-3 items-center" onPress={() => setTeamPickerVisible(null)}>
                            <Text className="text-red-500 font-bold">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Event Details Modal */}
            <Modal animationType="slide" transparent visible={eventModalVisible}>
                <View className="flex-1 justify-end bg-black/50">
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        className="w-full"
                    >
                        <View className="bg-white rounded-t-[32px] p-6 pb-10">
                            <View className="items-center mb-4">
                                <View className="w-12 h-1.5 bg-slate-200 rounded-full" />
                            </View>
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-xl font-bold text-primary">Add Event</Text>
                                <TouchableOpacity onPress={() => setEventModalVisible(false)}>
                                    <X size={24} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* Event Type */}
                                <View className="flex-row mb-4 flex-wrap">
                                    {['GOAL', 'ASSIST', 'YELLOW_CARD', 'RED_CARD'].map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            className={`mr-2 mb-2 p-2 px-4 rounded-full ${eventType === type ? 'bg-blue-500' : 'bg-slate-100'}`}
                                            onPress={() => setEventType(type as MatchEventType)}
                                        >
                                            <Text className={`font-bold ${eventType === type ? 'text-white' : 'text-slate-600'}`}>{type}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Select Team for Event */}
                                <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Team</Text>
                                <View className="flex-row mb-4">
                                    {[homeTeamId, awayTeamId].map(id => {
                                        const team = teams.find(t => t.id === id);
                                        if (!team) return null;
                                        return (
                                            <TouchableOpacity
                                                key={id}
                                                className={`flex-1 p-3 rounded-lg mr-2 items-center border ${eventTeamId === id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}
                                                onPress={() => {
                                                    setEventTeamId(id);
                                                    setEventPlayerId(''); // Reset player
                                                    setEventAssistantId(''); // Reset assistant
                                                }}
                                            >
                                                <Text className="font-bold text-slate-700">{team.initials}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Player</Text>
                                <TouchableOpacity
                                    className="bg-slate-100 p-4 rounded-xl mb-4 flex-row justify-between items-center"
                                    onPress={() => {
                                        if (!eventTeamId) Alert.alert('Select team first');
                                        else setEventPlayerPickerVisible(true);
                                    }}
                                >
                                    <Text className="text-slate-800 font-bold">{getPlayerName(eventPlayerId)}</Text>
                                    <ChevronDown size={20} color="#64748b" />
                                </TouchableOpacity>

                                {eventType === 'GOAL' && (
                                    <>
                                        <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Assistant (Optional)</Text>
                                        <TouchableOpacity
                                            className="bg-slate-100 p-4 rounded-xl mb-4 flex-row justify-between items-center"
                                            onPress={() => {
                                                if (!eventTeamId) Alert.alert('Select team first');
                                                else setEventAssistantPickerVisible(true);
                                            }}
                                        >
                                            <Text className="text-slate-800 font-bold">{eventAssistantId ? getPlayerName(eventAssistantId) : 'None'}</Text>
                                            <ChevronDown size={20} color="#64748b" />
                                        </TouchableOpacity>
                                    </>
                                )}

                                <TouchableOpacity className="bg-primary p-4 rounded-xl items-center" onPress={handleAddEvent}>
                                    <Text className="text-white font-bold text-lg">Add Event</Text>
                                </TouchableOpacity>
                                <View className="h-4" />
                            </ScrollView>

                            {/* Internal Player Picker (to avoid modal conflicts) */}
                            {eventPlayerPickerVisible && (
                                <View className="absolute inset-0 bg-white rounded-t-[32px] p-6 pt-12 z-50">
                                    <View className="flex-row justify-between items-center mb-6">
                                        <Text className="text-xl font-bold text-primary">Select Player</Text>
                                        <TouchableOpacity onPress={() => setEventPlayerPickerVisible(false)}>
                                            <X size={24} color="#64748b" />
                                        </TouchableOpacity>
                                    </View>
                                    <FlatList
                                        data={players.filter(p => p.teamId === eventTeamId)}
                                        keyExtractor={p => p.id}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                className="p-4 border-b border-slate-100"
                                                onPress={() => {
                                                    setEventPlayerId(item.id);
                                                    setEventPlayerPickerVisible(false);
                                                }}
                                            >
                                                <Text className="text-center font-bold text-slate-700 text-lg">{item.name}</Text>
                                            </TouchableOpacity>
                                        )}
                                        ListEmptyComponent={
                                            <View className="p-8 items-center">
                                                <Text className="text-slate-400 text-center">No players found for this team.</Text>
                                                <Text className="text-slate-400 text-center text-xs mt-2">Make sure you have added players to this team in the Players section.</Text>
                                            </View>
                                        }
                                    />
                                </View>
                            )}

                            {/* Assistant Picker */}
                            {eventAssistantPickerVisible && (
                                <View className="absolute inset-0 bg-white rounded-t-[32px] p-6 pt-12 z-50">
                                    <View className="flex-row justify-between items-center mb-6">
                                        <Text className="text-xl font-bold text-primary">Select Assistant</Text>
                                        <TouchableOpacity onPress={() => setEventAssistantPickerVisible(false)}>
                                            <X size={24} color="#64748b" />
                                        </TouchableOpacity>
                                    </View>
                                    <FlatList
                                        data={[
                                            { id: '', name: 'None' },
                                            ...players.filter(p => p.teamId === eventTeamId && p.id !== eventPlayerId)
                                        ]}
                                        keyExtractor={p => p.id}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                className="p-4 border-b border-slate-100"
                                                onPress={() => {
                                                    setEventAssistantId(item.id);
                                                    setEventAssistantPickerVisible(false);
                                                }}
                                            >
                                                <Text className="text-center font-bold text-slate-700 text-lg">{item.name}</Text>
                                            </TouchableOpacity>
                                        )}
                                    />
                                </View>
                            )}
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </ScrollView>
    );
}
