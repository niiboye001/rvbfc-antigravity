import { useFocusEffect, useRouter } from 'expo-router';
import { ChevronRight, ClipboardList, LogOut, ShieldCheck, UserPlus, Users } from 'lucide-react-native';
import { useCallback } from 'react';
import { Alert, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

export default function SettingsScreen() {
    const router = useRouter();

    const { session, signOut } = useAuth();

    // Ensure status bar is dark when this screen is focused
    useFocusEffect(
        useCallback(() => {
            StatusBar.setBarStyle('dark-content');
            return () => { };
        }, [])
    );

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: signOut }
            ]
        );
    };

    const MenuItem = ({ title, icon: Icon, route, color = '#3b82f6' }: any) => (
        <TouchableOpacity
            className="flex-row items-center bg-white p-4 rounded-xl mb-3 shadow-sm border border-slate-100"
            onPress={() => router.push(route)}
        >
            <View className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center mr-4">
                <Icon size={20} color={color} />
            </View>
            <Text className="flex-1 font-bold text-slate-700 text-base">{title}</Text>
            <ChevronRight size={20} color="#cbd5e1" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-secondary p-4">
            {session ? (
                <>
                    <View className="flex-row items-center justify-between mb-6">
                        <View className="flex-row items-center">
                            <ShieldCheck size={28} color="#0f172a" />
                            <Text className="text-2xl font-bold text-primary ml-2">Admin Panel</Text>
                        </View>
                        <TouchableOpacity onPress={handleLogout} className="p-2">
                            <LogOut size={22} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text className="text-xs font-bold text-slate-400 uppercase mb-3 ml-2">Management</Text>
                        <MenuItem title="Manage Teams" icon={Users} route="/admin/teams" color="#3b82f6" />
                        <MenuItem title="Manage Players" icon={UserPlus} route="/admin/players" color="#10b981" />

                        <Text className="text-xs font-bold text-slate-400 uppercase mb-3 ml-2 mt-4">Competition</Text>
                        <MenuItem title="Enter Match Result" icon={ClipboardList} route="/admin/matches" color="#f59e0b" />

                        <View className="mt-10 p-4 bg-slate-100 rounded-xl">
                            <Text className="text-slate-500 text-center text-xs">Logged in as {session.user.email}</Text>
                        </View>
                    </ScrollView>
                </>
            ) : (
                <View className="flex-1 items-center justify-center px-6">
                    <View className="w-20 h-20 rounded-3xl bg-slate-100 items-center justify-center mb-6">
                        <ShieldCheck size={40} color="#cbd5e1" />
                    </View>
                    <Text className="text-2xl font-bold text-slate-800 mb-2">Restricted Area</Text>
                    <Text className="text-slate-500 text-center mb-8">
                        The admin panel is reserved for league organizers. Please sign in to access management tools.
                    </Text>
                    <TouchableOpacity
                        className="bg-primary w-full py-4 rounded-xl items-center"
                        onPress={() => router.push('/admin/login')}
                    >
                        <Text className="text-white font-bold text-lg">Sign In</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}
