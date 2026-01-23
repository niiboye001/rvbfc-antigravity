import * as Haptics from 'expo-haptics';
import { Calendar, CheckCircle2, ChevronDown, Circle, Edit2, Plus, Trash2, X } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { useLeague } from '../../context/LeagueContext';
import { Match, MatchEvent, MatchEventType } from '../../types';

export default function ManageMatches() {
    const { teams, players, matches, addMatch, updateMatch, deleteMatch, currentSeason } = useLeague();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingMatch, setEditingMatch] = useState<Match | null>(null);

    // Confirmation State
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: () => { } });

    // Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ title: '', message: '' });

    const showCustomAlert = (title: string, message: string) => {
        setAlertConfig({ title, message });
        setAlertVisible(true);
    };

    // Form State
    const [homeTeamId, setHomeTeamId] = useState('');
    const [awayTeamId, setAwayTeamId] = useState('');
    const [homeScore, setHomeScore] = useState('');
    const [awayScore, setAwayScore] = useState('');
    const [events, setEvents] = useState<MatchEvent[]>([]);

    // Pickers State
    const [teamPickerVisible, setTeamPickerVisible] = useState<'home' | 'away' | null>(null);

    // Event Modal State
    const [eventModalVisible, setEventModalVisible] = useState(false);
    const [eventType, setEventType] = useState<MatchEventType>('GOAL');
    const [eventTeamId, setEventTeamId] = useState('');
    const [eventPlayerId, setEventPlayerId] = useState('');
    const [eventAssistantId, setEventAssistantId] = useState('');
    const [eventPlayerPickerVisible, setEventPlayerPickerVisible] = useState(false);
    const [eventAssistantPickerVisible, setEventAssistantPickerVisible] = useState(false);

    // Selection State
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const sortedMatches = [...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const openModal = (match?: Match) => {
        if (match) {
            setEditingMatch(match);
            setHomeTeamId(match.homeTeamId);
            setAwayTeamId(match.awayTeamId);
            setHomeScore(match.homeScore.toString());
            setAwayScore(match.awayScore.toString());
            setEvents(match.events || []);
        } else {
            setEditingMatch(null);
            setHomeTeamId('');
            setAwayTeamId('');
            setHomeScore('');
            setAwayScore('');
            setEvents([]);
        }
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!homeTeamId || !awayTeamId || !homeScore || !awayScore) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            showCustomAlert('Error', 'Please fill required match details');
            return;
        }
        if (homeTeamId === awayTeamId) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            showCustomAlert('Duplicate Teams', 'The Home Team details cannot be the same as the Away Team.\n\nPlease select two different teams.');
            return;
        }
        if (parseInt(homeScore) < 0 || parseInt(awayScore) < 0) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            showCustomAlert('Invalid Score', 'Football scores cannot be negative! 😅\n\nPlease enter a valid score (0 or higher).');
            return;
        }
        if (!currentSeason) {
            Alert.alert('Error', 'No active season');
            return;
        }

        const matchData = {
            seasonId: currentSeason.id,
            date: editingMatch ? editingMatch.date : new Date().toISOString(),
            homeTeamId,
            awayTeamId,
            homeScore: parseInt(homeScore),
            awayScore: parseInt(awayScore),
            isFinished: true,
            events: events,
        };

        if (editingMatch) {
            await updateMatch({ ...editingMatch, ...matchData });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            await addMatch({
                id: Date.now().toString(),
                ...matchData
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setModalVisible(false);
    };

    const handleDelete = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setConfirmConfig({
            title: 'Delete Match',
            message: 'Are you sure you want to delete this match?',
            onConfirm: () => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                deleteMatch(id);
                setConfirmVisible(false);
            }
        });
        setConfirmVisible(true);
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setConfirmConfig({
            title: 'Bulk Delete',
            message: `Delete ${selectedIds.length} matches? This cannot be undone.`,
            onConfirm: async () => {
                // Sequential delete since sync deleteMatches isn't in context yet (task for later)
                // Actually context has deleteTeams/Players but not Matches. We'll loop.
                for (const id of selectedIds) {
                    deleteMatch(id);
                }
                setIsSelectionMode(false);
                setSelectedIds([]);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setConfirmVisible(false);
            }
        });
        setConfirmVisible(true);
    };

    // Event Handlers
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
        setEventAssistantId('');
    };

    const toggleSelection = (id: string) => {
        Haptics.selectionAsync();
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(i => i !== id));
        } else {
            setSelectedIds(prev => [...prev, id]);
        }
    };

    const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || 'Select Team';
    const getTeamInitials = (id: string) => teams.find(t => t.id === id)?.initials || '??';
    const getPlayerName = (id: string) => players.find(p => p.id === id)?.name || 'Select Player';

    const Container = Platform.OS === 'ios' ? KeyboardAvoidingView : View;
    const containerProps = Platform.OS === 'ios' ? { behavior: 'padding' as const, className: 'w-full' } : { className: 'w-full' };

    return (
        <View className="flex-1 bg-secondary p-4">
            {isSelectionMode ? (
                <View className="flex-row justify-between items-center mb-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => { setIsSelectionMode(false); setSelectedIds([]); }} className="mr-3">
                            <X size={20} color="#64748b" />
                        </TouchableOpacity>
                        <Text className="font-bold text-lg text-slate-800">{selectedIds.length} Selected</Text>
                    </View>
                    <TouchableOpacity onPress={handleBulkDelete} disabled={selectedIds.length === 0}>
                        <Trash2 size={22} color={selectedIds.length === 0 ? '#cbd5e1' : '#ef4444'} />
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity
                    className="bg-primary p-4 rounded-xl flex-row justify-center items-center mb-4"
                    onPress={() => openModal()}
                >
                    <Plus color="#fff" size={20} />
                    <Text className="text-white font-bold ml-2">Record Match Result</Text>
                </TouchableOpacity>
            )}

            <FlatList
                data={sortedMatches}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                renderItem={({ item }) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onLongPress={() => { setIsSelectionMode(true); setSelectedIds([item.id]); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
                            onPress={() => isSelectionMode ? toggleSelection(item.id) : null}
                            className={`bg-white p-4 rounded-xl shadow-sm shadow-slate-200 mb-3 border ${isSelected ? 'border-primary bg-blue-50/50' : 'border-slate-100'}`}
                        >
                            <View className="flex-row items-center justify-between">
                                {isSelectionMode && (
                                    <View className="mr-3">
                                        {isSelected ? <CheckCircle2 size={24} color="#3b82f6" fill="#3b82f633" /> : <Circle size={24} color="#cbd5e1" />}
                                    </View>
                                )}
                                <View className="flex-1 flex-row items-center justify-between">
                                    {/* Home */}
                                    <View className="flex-1 flex-row items-center justify-end">
                                        <Text className="font-bold text-slate-700 mr-2 text-right" numberOfLines={1}>{getTeamInitials(item.homeTeamId)}</Text>
                                        <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center">
                                            <Text className="text-[10px] font-bold text-slate-500">{getTeamInitials(item.homeTeamId).substring(0, 2)}</Text>
                                        </View>
                                    </View>

                                    {/* Score */}
                                    <View className="mx-4 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                                        <Text className="font-black text-slate-900 text-lg">{item.homeScore} - {item.awayScore}</Text>
                                    </View>

                                    {/* Away */}
                                    <View className="flex-1 flex-row items-center">
                                        <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center">
                                            <Text className="text-[10px] font-bold text-slate-500">{getTeamInitials(item.awayTeamId).substring(0, 2)}</Text>
                                        </View>
                                        <Text className="font-bold text-slate-700 ml-2" numberOfLines={1}>{getTeamInitials(item.awayTeamId)}</Text>
                                    </View>
                                </View>

                                {!isSelectionMode && (
                                    <View className="flex-row ml-2 pl-2 border-l border-slate-100">
                                        <TouchableOpacity onPress={() => openModal(item)} className="p-2">
                                            <Edit2 size={18} color="#64748b" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-2">
                                            <Trash2 size={18} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                            <View className="mt-3 flex-row items-center justify-center">
                                <Calendar size={12} color="#94a3b8" />
                                <Text className="text-xs text-slate-400 font-medium ml-1">
                                    {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <View className="py-10 items-center">
                        <Text className="text-slate-400">No matches recorded yet.</Text>
                    </View>
                }
            />

            {/* Main Edit/Create Modal */}
            <Modal
                animationType="slide"
                transparent
                visible={modalVisible}
                statusBarTranslucent
                navigationBarTranslucent
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View className="flex-1 justify-end bg-black/50">
                        <TouchableWithoutFeedback>
                            <Container {...containerProps}>
                                <View className="bg-white rounded-t-[32px] p-6 pb-10 h-[90%]">
                                    <View className="items-center mb-4">
                                        <View className="w-12 h-1.5 bg-slate-200 rounded-full" />
                                    </View>
                                    <View className="flex-row justify-between items-center mb-6">
                                        <Text className="text-xl font-bold text-primary">{editingMatch ? 'Edit Match' : 'New Match'}</Text>
                                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                                            <X size={24} color="#64748b" />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Team Picker Overlay - Rendered INSIDE the Main Modal to avoid nesting issues */}
                                    {!!teamPickerVisible && (
                                        <View className="absolute inset-0 bg-white z-50 rounded-t-[32px] p-6">
                                            <Text className="text-xl font-bold mb-6 text-center text-primary">
                                                Select {teamPickerVisible === 'home' ? 'Home' : 'Away'} Team
                                            </Text>
                                            <FlatList
                                                data={teams.filter(t => {
                                                    if (teamPickerVisible === 'home') return t.id !== awayTeamId;
                                                    if (teamPickerVisible === 'away') return t.id !== homeTeamId;
                                                    return true;
                                                })}
                                                keyExtractor={t => t.id}
                                                showsVerticalScrollIndicator={false}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity
                                                        className="p-4 border-b border-slate-100 flex-row items-center"
                                                        onPress={() => {
                                                            if (teamPickerVisible === 'home') setHomeTeamId(item.id);
                                                            if (teamPickerVisible === 'away') setAwayTeamId(item.id);
                                                            setTeamPickerVisible(null);
                                                        }}
                                                    >
                                                        <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mr-3">
                                                            <Text className="font-bold text-slate-500">{item.initials}</Text>
                                                        </View>
                                                        <Text className="text-lg font-bold text-slate-900">{item.name}</Text>
                                                    </TouchableOpacity>
                                                )}
                                                ListEmptyComponent={
                                                    <Text className="text-center text-slate-400 mt-10">No available teams</Text>
                                                }
                                            />
                                            <TouchableOpacity className="mt-4 p-4 bg-slate-100 rounded-xl items-center" onPress={() => setTeamPickerVisible(null)}>
                                                <Text className="text-slate-600 font-bold">Cancel</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    <ScrollView showsVerticalScrollIndicator={false}>
                                        {/* Teams & Scores */}
                                        <View className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100">
                                            <View className="flex-row justify-between mb-4">
                                                <View className="flex-1 mr-2">
                                                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Home Team</Text>
                                                    <TouchableOpacity className="bg-white p-3 rounded-xl border border-slate-200 flex-row justify-between items-center" onPress={() => setTeamPickerVisible('home')}>
                                                        <Text className="text-slate-900 font-bold" numberOfLines={1}>{getTeamName(homeTeamId)}</Text>
                                                        <ChevronDown size={16} color="#94a3b8" />
                                                    </TouchableOpacity>
                                                </View>
                                                <View className="w-20 items-center justify-end pb-3">
                                                    <Text className="font-bold text-slate-300">VS</Text>
                                                </View>
                                                <View className="flex-1 ml-2">
                                                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Away Team</Text>
                                                    <TouchableOpacity className="bg-white p-3 rounded-xl border border-slate-200 flex-row justify-between items-center" onPress={() => setTeamPickerVisible('away')}>
                                                        <Text className="text-slate-900 font-bold" numberOfLines={1}>{getTeamName(awayTeamId)}</Text>
                                                        <ChevronDown size={16} color="#94a3b8" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                            <View className="flex-row justify-center items-center gap-4">
                                                <View className="items-center">
                                                    <TextInput
                                                        className="bg-white w-16 h-16 rounded-2xl text-center font-black text-2xl border border-slate-200 text-slate-900"
                                                        keyboardType="numeric"
                                                        value={homeScore}
                                                        onChangeText={setHomeScore}
                                                    />
                                                </View>
                                                <Text className="font-black text-slate-300 text-xl">-</Text>
                                                <View className="items-center">
                                                    <TextInput
                                                        className="bg-white w-16 h-16 rounded-2xl text-center font-black text-2xl border border-slate-200 text-slate-900"
                                                        keyboardType="numeric"
                                                        value={awayScore}
                                                        onChangeText={setAwayScore}
                                                    />
                                                </View>
                                            </View>
                                        </View>

                                        {/* Events Section */}
                                        <View className="mb-6">
                                            <View className="flex-row justify-between items-center mb-4">
                                                <Text className="font-bold text-lg text-slate-900">Match Events</Text>
                                                <TouchableOpacity onPress={() => setEventModalVisible(true)} className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded-full">
                                                    <Plus size={14} color="#3b82f6" />
                                                    <Text className="text-blue-600 font-bold text-xs ml-1">Add Event</Text>
                                                </TouchableOpacity>
                                            </View>

                                            {events.length === 0 ? (
                                                <View className="bg-slate-50 p-6 rounded-2xl items-center border border-dashed border-slate-200">
                                                    <Text className="text-slate-400 text-sm">No events recorded</Text>
                                                </View>
                                            ) : (
                                                events.map((ev, index) => (
                                                    <View key={index} className="flex-row justify-between py-3 border-b border-slate-100 last:border-0 items-center">
                                                        <View className="flex-row items-center flex-1">
                                                            <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${ev.type === 'GOAL' || ev.type === 'PENALTY_GOAL' ? 'bg-green-100' : ev.type === 'RED_CARD' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                                                                <View className={`w-3 h-3 rounded-full ${ev.type === 'GOAL' || ev.type === 'PENALTY_GOAL' ? 'bg-green-500' : ev.type === 'RED_CARD' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                                                            </View>
                                                            <View>
                                                                <Text className="font-bold text-slate-800 text-sm">{ev.type.replace('_', ' ')}</Text>
                                                                <Text className="text-xs text-slate-500">{getPlayerName(ev.playerId)}</Text>
                                                            </View>
                                                        </View>
                                                        <TouchableOpacity onPress={() => setEvents(events.filter((_, i) => i !== index))} className="p-2">
                                                            <X size={16} color="#cbd5e1" />
                                                        </TouchableOpacity>
                                                    </View>
                                                ))
                                            )}
                                        </View>

                                        <TouchableOpacity className="bg-primary p-4 rounded-xl items-center mb-8" onPress={handleSave}>
                                            <Text className="text-white font-bold text-lg">Save Match Result</Text>
                                        </TouchableOpacity>
                                        <View className="h-20" />
                                    </ScrollView>
                                </View>
                            </Container>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            <ConfirmationModal
                visible={confirmVisible}
                title={confirmConfig.title}
                message={confirmConfig.message}
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setConfirmVisible(false)}
            />

            <ConfirmationModal
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                onConfirm={() => setAlertVisible(false)}
                onCancel={() => setAlertVisible(false)}
                confirmText="Got it"
                type="info"
                showCancelButton={false}
            />



            {/* Event Details Adding Modal */}
            <Modal animationType="slide" transparent visible={eventModalVisible} statusBarTranslucent>
                <View className="flex-1 justify-end bg-black/50">
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="w-full">
                        <View className="bg-white rounded-t-[32px] p-6 pb-10">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-xl font-bold text-primary">Add Event</Text>
                                <TouchableOpacity onPress={() => setEventModalVisible(false)}>
                                    <X size={24} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View className="flex-row mb-6 flex-wrap gap-2">
                                    {['GOAL', 'PENALTY_GOAL', 'ASSIST', 'YELLOW_CARD', 'RED_CARD'].map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            className={`p-2 px-4 rounded-full border ${eventType === type ? 'bg-primary border-primary' : 'bg-white border-slate-200'}`}
                                            onPress={() => setEventType(type as MatchEventType)}
                                        >
                                            <Text className={`font-bold text-xs ${eventType === type ? 'text-white' : 'text-slate-600'}`}>{type}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Team Selection for Event */}
                                <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Select Team</Text>
                                <View className="flex-row mb-6 gap-3">
                                    {[homeTeamId, awayTeamId].map(id => {
                                        const team = teams.find(t => t.id === id);
                                        if (!team) return null;
                                        return (
                                            <TouchableOpacity
                                                key={id}
                                                className={`flex-1 p-4 rounded-xl border-2 items-center ${eventTeamId === id ? 'border-primary bg-blue-50' : 'border-slate-100 bg-slate-50'}`}
                                                onPress={() => {
                                                    setEventTeamId(id);
                                                    setEventPlayerId('');
                                                    setEventAssistantId('');
                                                }}
                                            >
                                                <Text className={`font-bold ${eventTeamId === id ? 'text-primary' : 'text-slate-500'}`}>{team.initials}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Player</Text>
                                <TouchableOpacity
                                    className={`p-4 rounded-xl mb-4 flex-row justify-between items-center border ${!eventTeamId ? 'bg-slate-50 border-slate-100 opacity-50' : 'bg-white border-slate-200'}`}
                                    onPress={() => {
                                        if (!eventTeamId) Alert.alert('Select team first');
                                        else setEventPlayerPickerVisible(true);
                                    }}
                                    disabled={!eventTeamId}
                                >
                                    <Text className="text-slate-800 font-bold">{getPlayerName(eventPlayerId)}</Text>
                                    <ChevronDown size={20} color="#64748b" />
                                </TouchableOpacity>

                                {['GOAL', 'PENALTY_GOAL'].includes(eventType) && (
                                    <>
                                        <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Assistant (Optional)</Text>
                                        <TouchableOpacity
                                            className={`p-4 rounded-xl mb-6 flex-row justify-between items-center border ${!eventTeamId ? 'bg-slate-50 border-slate-100 opacity-50' : 'bg-white border-slate-200'}`}
                                            onPress={() => {
                                                if (!eventTeamId) Alert.alert('Select team first');
                                                else setEventAssistantPickerVisible(true);
                                            }}
                                            disabled={!eventTeamId}
                                        >
                                            <Text className="text-slate-800 font-bold">{eventAssistantId ? getPlayerName(eventAssistantId) : 'None'}</Text>
                                            <ChevronDown size={20} color="#64748b" />
                                        </TouchableOpacity>
                                    </>
                                )}

                                <TouchableOpacity className="bg-primary p-4 rounded-xl items-center mt-2" onPress={handleAddEvent}>
                                    <Text className="text-white font-bold text-lg">Add Event</Text>
                                </TouchableOpacity>
                                <View className="h-10" />
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* Player Picker for Events */}
            <Modal animationType="slide" transparent visible={eventPlayerPickerVisible} statusBarTranslucent>
                <View className="flex-1 bg-white pt-12">
                    <View className="px-6 pb-4 border-b border-slate-100 flex-row justify-between items-center bg-white z-10">
                        <Text className="text-xl font-bold text-slate-900">Select Player</Text>
                        <TouchableOpacity onPress={() => setEventPlayerPickerVisible(false)} className="bg-slate-100 p-2 rounded-full">
                            <X size={20} color="#64748b" />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        className="flex-1"
                        contentContainerStyle={{ padding: 24 }}
                        data={players.filter(p => p.teamId === eventTeamId)}
                        keyExtractor={p => p.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                className="p-4 bg-slate-50 rounded-xl mb-3 border border-slate-100 flex-row items-center"
                                onPress={() => {
                                    setEventPlayerId(item.id);
                                    setEventPlayerPickerVisible(false);
                                }}
                            >
                                <View className="w-10 h-10 rounded-full bg-slate-200 items-center justify-center mr-3">
                                    <Text className="font-bold text-slate-500">{item.name.substring(0, 1)}</Text>
                                </View>
                                <Text className="font-bold text-slate-700 text-lg">{item.name}</Text>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={<Text className="text-center text-slate-400 mt-10">No players found in team.</Text>}
                    />
                </View>
            </Modal>

            {/* Assistant Picker for Events */}
            <Modal animationType="slide" transparent visible={eventAssistantPickerVisible} statusBarTranslucent>
                <View className="flex-1 bg-white pt-12">
                    <View className="px-6 pb-4 border-b border-slate-100 flex-row justify-between items-center bg-white z-10">
                        <Text className="text-xl font-bold text-slate-900">Select Assistant</Text>
                        <TouchableOpacity onPress={() => setEventAssistantPickerVisible(false)} className="bg-slate-100 p-2 rounded-full">
                            <X size={20} color="#64748b" />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        className="flex-1"
                        contentContainerStyle={{ padding: 24 }}
                        data={[{ id: '', name: 'None' }, ...players.filter(p => p.teamId === eventTeamId && p.id !== eventPlayerId)]}
                        keyExtractor={p => p.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                className="p-4 bg-slate-50 rounded-xl mb-3 border border-slate-100 flex-row items-center"
                                onPress={() => {
                                    setEventAssistantId(item.id);
                                    setEventAssistantPickerVisible(false);
                                }}
                            >
                                <View className="w-10 h-10 rounded-full bg-slate-200 items-center justify-center mr-3">
                                    <Text className="font-bold text-slate-500">{item.name.substring(0, 1)}</Text>
                                </View>
                                <Text className="font-bold text-slate-700 text-lg">{item.name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>
        </View>
    );
}
