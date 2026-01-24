import * as Haptics from 'expo-haptics';
import { CheckCircle2, ChevronDown, Circle, Edit2, Plus, Trash2, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { useLeague } from '../../context/LeagueContext';
import { Player } from '../../types';

export default function ManagePlayers() {
    const { players, teams, addPlayer, updatePlayer, deletePlayer, deletePlayers, currentSeason } = useLeague();
    const [modalVisible, setModalVisible] = useState(false);
    const [teamPickerVisible, setTeamPickerVisible] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

    // Filter teams for the current season
    const currentSeasonTeams = useMemo(() =>
        teams.filter(t => t.seasonId === currentSeason?.id),
        [teams, currentSeason]
    );

    // Confirmation State
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: () => { } });

    const [name, setName] = useState('');
    const [selectedTeamId, setSelectedTeamId] = useState('');

    // Selection State
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const openModal = (player?: Player) => {
        if (player) {
            setEditingPlayer(player);
            setName(player.name);
            setSelectedTeamId(player.teamId);
        } else {
            setEditingPlayer(null);
            setName('');
            // Default to first team of current season
            setSelectedTeamId(currentSeasonTeams[0]?.id || '');
        }
        setModalVisible(true);
    };

    const handleSave = () => {
        if (!name || !selectedTeamId) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        if (editingPlayer) {
            updatePlayer({
                ...editingPlayer,
                name,
                teamId: selectedTeamId,
            });
        } else {
            addPlayer({
                id: Date.now().toString(),
                name,
                teamId: selectedTeamId,
                goals: 0,
                assists: 0,
                yellowCards: 0,
                redCards: 0,
            });
        }
        setModalVisible(false);
    };

    const handleDelete = (player: Player) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setConfirmConfig({
            title: 'Delete Player',
            message: `Are you sure you want to delete ${player.name}?`,
            onConfirm: () => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                deletePlayer(player.id);
                setConfirmVisible(false);
            }
        });
        setConfirmVisible(true);
    };

    const toggleSelection = (id: string) => {
        Haptics.selectionAsync();
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(i => i !== id));
        } else {
            setSelectedIds(prev => [...prev, id]);
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setConfirmConfig({
            title: 'Bulk Delete',
            message: `Are you sure you want to delete ${selectedIds.length} players? This action cannot be undone.`,
            onConfirm: async () => {
                await deletePlayers(selectedIds);
                setIsSelectionMode(false);
                setSelectedIds([]);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setConfirmVisible(false);
            }
        });
        setConfirmVisible(true);
    };

    const handleSelectAll = () => {
        if (selectedIds.length === players.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(players.map(p => p.id));
        }
        Haptics.selectionAsync();
    };

    const enterSelectionMode = (id?: string) => {
        setIsSelectionMode(true);
        if (id) setSelectedIds([id]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const exitSelectionMode = () => {
        setIsSelectionMode(false);
        setSelectedIds([]);
    };

    const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || 'Unknown';

    return (
        <View className="flex-1 bg-secondary p-4">
            {isSelectionMode ? (
                <View className="flex-row justify-between items-center mb-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={exitSelectionMode} className="mr-3">
                            <X size={20} color="#64748b" />
                        </TouchableOpacity>
                        <Text className="font-bold text-lg text-slate-800">{selectedIds.length} Selected</Text>
                    </View>
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={handleSelectAll} className="mr-4">
                            <Text className="text-blue-500 font-bold">
                                {selectedIds.length === players.length ? 'Deselect All' : 'Select All'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleBulkDelete} disabled={selectedIds.length === 0}>
                            <Trash2 size={22} color={selectedIds.length === 0 ? '#cbd5e1' : '#ef4444'} />
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <TouchableOpacity
                    className="bg-primary p-4 rounded-xl flex-row justify-center items-center mb-4"
                    onPress={() => openModal()}
                >
                    <Plus color="#fff" size={20} />
                    <Text className="text-white font-bold ml-2">Add New Player</Text>
                </TouchableOpacity>
            )}

            <FlatList
                data={players}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onLongPress={() => enterSelectionMode(item.id)}
                            onPress={() => isSelectionMode ? toggleSelection(item.id) : null}
                            className={`bg-white p-4 rounded-xl shadow-sm shadow-slate-200 mb-3 flex-row items-center justify-between border ${isSelected ? 'border-primary bg-blue-50/50' : 'border-slate-100'}`}
                        >
                            <View className="flex-row items-center flex-1">
                                {isSelectionMode && (
                                    <View className="mr-3">
                                        {isSelected ? (
                                            <CheckCircle2 size={24} color="#3b82f6" fill="#3b82f633" />
                                        ) : (
                                            <Circle size={24} color="#cbd5e1" />
                                        )}
                                    </View>
                                )}
                                <View className="flex-1">
                                    <Text className="font-bold text-slate-800 text-lg">{item.name}</Text>
                                    <Text className="text-slate-500 text-sm">{getTeamName(item.teamId)}</Text>
                                </View>
                            </View>
                            {!isSelectionMode && (
                                <View className="flex-row">
                                    <TouchableOpacity onPress={() => openModal(item)} className="p-2 mr-1">
                                        <Edit2 size={20} color="#64748b" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(item)} className="p-2">
                                        <Trash2 size={20} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                }}
            />

            {/* Form Modal */}
            <Modal animationType="slide" transparent visible={modalVisible} statusBarTranslucent onRequestClose={() => setModalVisible(false)}>
                <View className="flex-1 justify-end bg-black/50">
                    <TouchableOpacity className="absolute inset-0" activeOpacity={1} onPress={() => setModalVisible(false)} />
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        className="w-full"
                        pointerEvents="box-none"
                    >
                        <View className="bg-white rounded-t-[32px] p-6 pb-10">
                            <View className="items-center mb-4">
                                <View className="w-12 h-1.5 bg-slate-200 rounded-full" />
                            </View>
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-xl font-bold text-primary">{editingPlayer ? 'Edit Player' : 'New Player'}</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <X size={24} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Player Name</Text>
                                <TextInput
                                    className="bg-white border border-slate-300 p-4 rounded-xl mb-4 text-slate-800 font-medium"
                                    placeholder="e.g. John Doe"
                                    placeholderTextColor="#94a3b8"
                                    value={name}
                                    onChangeText={setName}
                                />

                                <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Team</Text>
                                <TouchableOpacity
                                    className="bg-white border border-slate-300 p-4 rounded-xl mb-6 flex-row justify-between items-center"
                                    onPress={() => setTeamPickerVisible(true)}
                                >
                                    <Text className="text-slate-800 font-bold">{getTeamName(selectedTeamId) || 'Select Team'}</Text>
                                    <ChevronDown size={20} color="#64748b" />
                                </TouchableOpacity>

                                <TouchableOpacity className="bg-primary p-4 rounded-xl items-center" onPress={handleSave}>
                                    <Text className="text-white font-bold text-lg">Save Player</Text>
                                </TouchableOpacity>
                                <View className="h-4" />
                            </ScrollView>

                            {teamPickerVisible && (
                                <View className="absolute inset-0 bg-white rounded-t-[32px] p-6 z-50">
                                    <View className="items-center mb-4">
                                        <View className="w-12 h-1.5 bg-slate-200 rounded-full" />
                                    </View>
                                    <Text className="text-xl font-bold mb-6 text-center text-primary">Select Team</Text>
                                    <FlatList
                                        data={currentSeasonTeams}
                                        keyExtractor={t => t.id}
                                        showsVerticalScrollIndicator={false}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                className="p-4 border-b border-slate-100"
                                                onPress={() => {
                                                    setSelectedTeamId(item.id);
                                                    setTeamPickerVisible(false);
                                                }}
                                            >
                                                <Text className="text-center font-bold text-slate-700">{item.name}</Text>
                                            </TouchableOpacity>
                                        )}
                                    />
                                    <TouchableOpacity className="mt-4 p-3 items-center" onPress={() => setTeamPickerVisible(false)}>
                                        <Text className="text-red-500 font-bold">Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            <ConfirmationModal
                visible={confirmVisible}
                title={confirmConfig.title}
                message={confirmConfig.message}
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setConfirmVisible(false)}
            />




        </View>
    );
}
