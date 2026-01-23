import { useFocusEffect, useRouter } from 'expo-router';
import { ChevronRight, ClipboardList, LogOut, ShieldCheck, UserPlus, Users } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { useAuth } from '../../context/AuthContext';

export default function SettingsScreen() {
    const router = useRouter();

    const { session, signOut } = useAuth();
    const [confirmVisible, setConfirmVisible] = useState(false);

    // Ensure status bar is dark when this screen is focused
    useFocusEffect(
        useCallback(() => {
            StatusBar.setBarStyle('dark-content');
            return () => { };
        }, [])
    );

    const handleLogout = () => {
        setConfirmVisible(true);
    };

    const MenuItem = ({ title, icon: Icon, route, color = '#3b82f6' }: any) => (
        <TouchableOpacity
            className="flex-row items-center bg-white p-5 rounded-2xl mb-4 border border-slate-50"
            onPress={() => router.push(route)}
        >
            <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: `${color}15` }}>
                <Icon size={22} color={color} />
            </View>
            <Text className="flex-1 font-black text-slate-700 text-base">{title}</Text>
            <View className="bg-slate-50 p-2 rounded-xl">
                <ChevronRight size={18} color="#94a3b8" />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-white">
            {session ? (
                <View className="flex-1 bg-secondary">
                    <View className="bg-white px-6 py-10 border-b border-slate-50/50 flex-row items-center justify-between">
                        <View>
                            <Text className="text-slate-400 text-xs font-black uppercase tracking-[3px] mb-1">Organizer</Text>
                            <Text className="text-3xl font-black text-slate-900 uppercase tracking-[4px]">Admin Panel</Text>
                        </View>
                        <TouchableOpacity
                            onPress={handleLogout}
                            className="bg-red-50 p-3 rounded-2xl border border-red-100"
                        >
                            <LogOut size={22} color="#ef4444" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        className="flex-1 px-6 pt-8"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 40 }}
                    >
                        <View className="mb-8">
                            <Text className="text-slate-900 text-lg font-black mb-4 ml-1">Management</Text>
                            <MenuItem title="Manage Teams" icon={Users} route="/admin/teams" color="#6366f1" />
                            <MenuItem title="Manage Players" icon={UserPlus} route="/admin/players" color="#10b981" />
                        </View>

                        <View className="mb-8">
                            <Text className="text-slate-900 text-lg font-black mb-4 ml-1">Competition</Text>
                            <MenuItem title="Enter Match Result" icon={ClipboardList} route="/admin/matches" color="#f59e0b" />
                        </View>

                        <View className="mt-4 p-6 bg-white rounded-3xl border border-slate-100 items-center">
                            <View className="w-12 h-12 rounded-full bg-slate-50 items-center justify-center mb-3">
                                <ShieldCheck size={24} color="#94a3b8" />
                            </View>
                            <Text className="text-slate-400 text-center font-bold text-xs">Logged in as</Text>
                            <Text className="text-slate-900 text-center font-black text-sm">{session.user.email}</Text>
                        </View>
                    </ScrollView>
                </View>
            ) : (
                <View className="flex-1 bg-secondary">
                    <View className="bg-white px-6 py-10 border-b border-slate-50/50 items-center justify-center">
                        <Text className="text-3xl font-black text-slate-900 uppercase tracking-[4px]">Settings</Text>
                    </View>

                    <View className="flex-1 items-center justify-center px-8">
                        <View className="w-24 h-24 rounded-3xl bg-white shadow-md shadow-slate-100 items-center justify-center mb-8 border border-slate-50">
                            <ShieldCheck size={48} color="#cbd5e1" />
                        </View>
                        <Text className="text-3xl font-black text-slate-900 mb-3 text-center">Restricted Access</Text>
                        <Text className="text-slate-400 font-bold text-center mb-10 leading-6 px-4">
                            The admin panel is exclusively for league organizers. Sign in to manage teams and matches.
                        </Text>
                        <TouchableOpacity
                            className="bg-primary w-full py-5 rounded-2xl items-center shadow-md shadow-blue-100"
                            onPress={() => router.push('/admin/login')}
                        >
                            <Text className="text-white font-black text-lg">Sign In as Admin</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <ConfirmationModal
                visible={confirmVisible}
                title="Sign Out"
                message="Are you sure you want to sign out of the Admin Panel?"
                confirmText="Sign Out"
                cancelText="Not now"
                onConfirm={() => {
                    setConfirmVisible(false);
                    signOut();
                }}
                onCancel={() => setConfirmVisible(false)}
            />
        </SafeAreaView>
    );
}
