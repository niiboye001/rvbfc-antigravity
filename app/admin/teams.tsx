import * as Haptics from 'expo-haptics';
import { Check, CheckCircle2, ChevronDown, ChevronUp, Circle, Edit2, Plus, Search, Trash2, X } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { useLeague } from '../../context/LeagueContext';
import { Team } from '../../types';

export default function ManageTeams() {
    const { teams, addTeam, updateTeam, deleteTeam, deleteTeams, seasons, currentSeason } = useLeague();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);

    // Accordion State
    const [expandedSeasons, setExpandedSeasons] = useState<Set<string>>(new Set());

    // Confirmation State
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: () => { } });

    const [name, setName] = useState('');
    const [initials, setInitials] = useState('');
    const [seasonId, setSeasonId] = useState('');
    const [seasonSelectorVisible, setSeasonSelectorVisible] = useState(false);
    const [seasonSearch, setSeasonSearch] = useState('');
    const filteredSeasons = seasons.filter(s => s.name.toLowerCase().includes(seasonSearch.toLowerCase()));

    // Selection State
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Default to closed state
    // useEffect(() => {
    //     if (currentSeason) {
    //         setExpandedSeasons(new Set([currentSeason.id]));
    //     } else if (seasons.length > 0) {
    //         setExpandedSeasons(new Set([seasons[0].id]));
    //     }
    // }, [currentSeason?.id, seasons.length]);

    const toggleSeason = (id: string) => {
        Haptics.selectionAsync();
        const newExpanded = new Set(expandedSeasons);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedSeasons(newExpanded);
    };

    const openModal = (team?: Team, preselectedSeasonId?: string) => {
        if (team) {
            setEditingTeam(team);
            setName(team.name);
            setInitials(team.initials);
            setSeasonId(team.seasonId || currentSeason?.id || seasons[0]?.id || '');
        } else {
            setEditingTeam(null);
            setName('');
            setInitials('');
            setSeasonId(preselectedSeasonId || currentSeason?.id || seasons[0]?.id || '');
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
                seasonId,
            });
        } else {
            addTeam({
                id: Date.now().toString(),
                name,
                initials,
                color: '#3b82f6', // Default color
                seasonId,
            });
        }
        setModalVisible(false);
        // Ensure the season we just added/moved to is expanded
        if (seasonId) {
            setExpandedSeasons(prev => {
                const next = new Set(prev);
                next.add(seasonId);
                return next;
            });
        }
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

    const handleSelectAll = (subsetIds?: string[]) => {
        Haptics.selectionAsync();
        if (subsetIds) {
            // Select/Deselect all in a specific subset (season)
            const allSubsetSelected = subsetIds.every(id => selectedIds.includes(id));
            if (allSubsetSelected) {
                setSelectedIds(prev => prev.filter(id => !subsetIds.includes(id)));
            } else {
                const newIds = new Set([...selectedIds, ...subsetIds]);
                setSelectedIds(Array.from(newIds));
            }
        } else {
            // Global Select/Deselect
            if (selectedIds.length === teams.length) {
                setSelectedIds([]);
            } else {
                setSelectedIds(teams.map(t => t.id));
            }
        }
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

    const renderTeamItem = (item: Team, index: number, total: number) => {
        const isSelected = selectedIds.includes(item.id);
        const isLastItem = index === total - 1;

        return (
            <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onLongPress={() => enterSelectionMode(item.id)}
                onPress={() => isSelectionMode ? toggleSelection(item.id) : null}
                className={`flex-row items-center justify-between p-3 mb-2 rounded-xl border ${isSelected ? 'bg-blue-50 border-primary' : 'bg-slate-50 border-slate-100'}`}
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
                    <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3 shadow-sm shadow-slate-200">
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
                        <TouchableOpacity onPress={() => handleSelectAll()} className="mr-4">
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
                // Header actions could go here?
                null
            )}

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Removed Global 'Approve New Team' - Use + in Season Header */}

                {seasons.map(season => {
                    const seasonTeams = teams.filter(t => t.seasonId === season.id);
                    const isExpanded = expandedSeasons.has(season.id);
                    // Check if all teams in this season are selected
                    const allSelected = seasonTeams.length > 0 && seasonTeams.every(t => selectedIds.includes(t.id));

                    return (
                        <View key={season.id}>
                            {/* Season Header */}
                            <TouchableOpacity
                                onPress={() => toggleSeason(season.id)}
                                activeOpacity={0.7}
                                className={`flex-row justify-between items-center p-5 bg-white border-x border-t border-slate-100 shadow-sm shadow-slate-200 mt-4 ${isExpanded ? 'rounded-t-[24px] border-b-0' : 'rounded-[24px] border-b'}`}
                            >
                                <View className="flex-row items-center">
                                    <View className="w-1 h-4 bg-primary rounded-full mr-3" />
                                    <Text className="text-slate-900 font-black text-base uppercase tracking-widest">{season.name}</Text>
                                    <View className="bg-slate-100 px-2.5 py-1 rounded-full ml-3">
                                        <Text className="text-xs font-bold text-slate-500">{seasonTeams.length}</Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center gap-2">
                                    {isSelectionMode && seasonTeams.length > 0 && (
                                        <TouchableOpacity onPress={() => handleSelectAll(seasonTeams.map(t => t.id))} className="mr-2">
                                            <Text className="text-blue-500 text-xs font-bold uppercase tracking-wider">
                                                {allSelected ? 'Deselect' : 'Select'}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    {!isSelectionMode && (
                                        <TouchableOpacity
                                            onPress={() => openModal(undefined, season.id)}
                                            className="bg-slate-50 p-1.5 rounded-full mr-1"
                                        >
                                            <Plus size={14} color="#3b82f6" />
                                        </TouchableOpacity>
                                    )}
                                    <View className={`p-2 rounded-full ${isExpanded ? 'bg-slate-50' : 'bg-slate-50'}`}>
                                        {isExpanded ? <ChevronUp size={16} color="#0f172a" /> : <ChevronDown size={16} color="#64748b" />}
                                    </View>
                                </View>
                            </TouchableOpacity>

                            {/* Accordion Body */}
                            {isExpanded && (
                                <View className="bg-white px-3 pb-4 rounded-b-[24px] border-x border-b border-slate-100 shadow-sm shadow-slate-200">
                                    {seasonTeams.length === 0 ? (
                                        <View className="p-8 items-center justify-center opacity-50">
                                            <View className="bg-slate-50 p-4 rounded-full mb-3">
                                                <Circle size={24} color="#cbd5e1" />
                                            </View>
                                            <Text className="text-slate-400 font-bold text-sm">No teams found</Text>
                                        </View>
                                    ) : (
                                        <View className="pt-2">
                                            {seasonTeams.map((team, index) => renderTeamItem(team, index, seasonTeams.length))}
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>
                    );
                })}
            </ScrollView>

            {/* Form Modal */}
            <Modal animationType="slide" transparent visible={modalVisible} statusBarTranslucent onRequestClose={() => {
                if (seasonSelectorVisible) {
                    setSeasonSelectorVisible(false);
                } else {
                    setModalVisible(false);
                }
            }}>
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View className="flex-1 justify-end bg-black/50">
                        <TouchableWithoutFeedback>
                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                                className="w-full"
                            >
                                <ScrollView className="bg-white rounded-t-[32px]" contentContainerClassName="p-6 pb-10">
                                    <View className="items-center mb-4">
                                        <View className="w-12 h-1.5 bg-slate-200 rounded-full" />
                                    </View>
                                    <View className="flex-row justify-between items-center mb-6">
                                        <Text className="text-xl font-bold text-primary">{editingTeam ? 'Edit Team' : 'New Team'}</Text>
                                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                                            <X size={24} color="#64748b" />
                                        </TouchableOpacity>
                                    </View>

                                    <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Assigned Season</Text>
                                    <TouchableOpacity
                                        onPress={() => setSeasonSelectorVisible(true)}
                                        className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-6 flex-row justify-between items-center"
                                    >
                                        <Text className="font-bold text-slate-800">
                                            {seasons.find(s => s.id === seasonId)?.name || 'Select Season'}
                                        </Text>
                                        <ChevronDown size={20} color="#64748b" />
                                    </TouchableOpacity>
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
                            </KeyboardAvoidingView>
                        </TouchableWithoutFeedback>
                        {/* Season Selector Overlay */}
                        {seasonSelectorVisible && (
                            <TouchableWithoutFeedback onPress={() => { /* Do nothing on content press */ }}>
                                <View className="absolute bottom-0 left-0 right-0 top-24 bg-white rounded-t-[32px] overflow-hidden shadow-2xl">
                                    <View className="p-4 border-b border-slate-100 flex-row items-center gap-3">
                                        <TouchableOpacity onPress={() => setSeasonSelectorVisible(false)} className="bg-slate-100 p-2 rounded-full">
                                            <X size={20} color="#0f172a" />
                                        </TouchableOpacity>
                                        <Text className="text-lg font-black text-slate-900">Select Season</Text>
                                    </View>
                                    <View className="p-4">
                                        <View className="flex-row items-center bg-slate-100 p-3 rounded-xl mb-2">
                                            <Search size={20} color="#94a3b8" />
                                            <TextInput
                                                className="flex-1 ml-2 font-medium text-slate-900"
                                                placeholder="Search seasons..."
                                                value={seasonSearch}
                                                onChangeText={setSeasonSearch}
                                                autoFocus
                                            />
                                        </View>
                                    </View>
                                    <FlatList
                                        data={filteredSeasons}
                                        keyExtractor={item => item.id}
                                        contentContainerStyle={{ paddingBottom: 40 }}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                onPress={() => { setSeasonId(item.id); setSeasonSelectorVisible(false); }}
                                                className="p-4 border-b border-slate-50 flex-row justify-between items-center"
                                            >
                                                <Text className={`font-bold text-lg ${seasonId === item.id ? 'text-blue-600' : 'text-slate-800'}`}>{item.name}</Text>
                                                {seasonId === item.id && <Check size={20} color="#2563eb" />}
                                            </TouchableOpacity>
                                        )}
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                        )}
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
        </View >
    );
}
