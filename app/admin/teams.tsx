import * as Haptics from 'expo-haptics';
import { CheckCircle2, Circle, Edit2, Plus, Trash2, X } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { useLeague } from '../../context/LeagueContext';
import { Team } from '../../types';

export default function ManageTeams() {
    const { teams, addTeam, updateTeam, deleteTeam, deleteTeams } = useLeague();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);

    // Confirmation State
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: () => { } });

    const [name, setName] = useState('');
    const [initials, setInitials] = useState('');

    // Selection State
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const openModal = (team?: Team) => {
        if (team) {
            setEditingTeam(team);
            setName(team.name);
            setInitials(team.initials);
        } else {
            setEditingTeam(null);
            setName('');
            setInitials('');
        }
        setModalVisible(true);
    };

    const handleSave = () => {
        if (!name || !initials) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        if (editingTeam) {
            updateTeam({
                ...editingTeam,
                name,
                initials,
            });
        } else {
            addTeam({
                id: Date.now().toString(),
                name,
                initials,
                color: '#3b82f6', // Default color
            });
        }
        setModalVisible(false);
    };

    const handleDelete = (team: Team) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setConfirmConfig({
            title: 'Delete Team',
            message: `Are you sure you want to delete ${team.name}?`,
            onConfirm: () => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                deleteTeam(team.id);
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
            message: `Are you sure you want to delete ${selectedIds.length} teams? This action cannot be undone.`,
            onConfirm: async () => {
                await deleteTeams(selectedIds);
                setIsSelectionMode(false);
                setSelectedIds([]);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setConfirmVisible(false);
            }
        });
        setConfirmVisible(true);
    };

    const handleSelectAll = () => {
        if (selectedIds.length === teams.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(teams.map(t => t.id));
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
                                {selectedIds.length === teams.length ? 'Deselect All' : 'Select All'}
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
                    <Text className="text-white font-bold ml-2">Approve New Team</Text>
                </TouchableOpacity>
            )}

            <FlatList
                data={teams}
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
                                <View className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center mr-3">
                                    <Text className="font-bold text-slate-700">{item.initials}</Text>
                                </View>
                                <Text className="font-bold text-slate-800 text-lg flex-1">{item.name}</Text>
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
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View className="flex-1 justify-end bg-black/50">
                        <TouchableWithoutFeedback>
                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                                className="w-full"
                            >
                                <View className="bg-white rounded-t-[32px] p-6 pb-10">
                                    <View className="items-center mb-4">
                                        <View className="w-12 h-1.5 bg-slate-200 rounded-full" />
                                    </View>
                                    <View className="flex-row justify-between items-center mb-6">
                                        <Text className="text-xl font-bold text-primary">{editingTeam ? 'Edit Team' : 'New Team'}</Text>
                                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                                            <X size={24} color="#64748b" />
                                        </TouchableOpacity>
                                    </View>

                                    <ScrollView showsVerticalScrollIndicator={false}>
                                        <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Team Name</Text>
                                        <TextInput
                                            className="bg-white border border-slate-300 p-4 rounded-xl mb-4 text-slate-800 font-medium"
                                            placeholder="e.g. Red vs Blue FC"
                                            placeholderTextColor="#94a3b8"
                                            value={name}
                                            onChangeText={setName}
                                        />

                                        <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Initials (Logo)</Text>
                                        <TextInput
                                            className="bg-white border border-slate-300 p-4 rounded-xl mb-6 text-slate-800 font-medium"
                                            placeholder="e.g. RvB"
                                            placeholderTextColor="#94a3b8"
                                            value={initials}
                                            onChangeText={setInitials}
                                            maxLength={4}
                                        />

                                        <TouchableOpacity className="bg-primary p-4 rounded-xl items-center" onPress={handleSave}>
                                            <Text className="text-white font-bold text-lg">Save Team</Text>
                                        </TouchableOpacity>
                                        <View className="h-4" />
                                    </ScrollView>
                                </View>
                            </KeyboardAvoidingView>
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
        </View>
    );
}
