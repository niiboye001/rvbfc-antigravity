import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
    const { session, loading } = useAuth();

    useEffect(() => {
        if (!loading && !session) {
            router.replace('/admin/login');
        }
    }, [session, loading]);

    if (loading) {
        return (
            <View className="flex-1 bg-slate-950 items-center justify-center">
                <ActivityIndicator color="#3b82f6" size="large" />
            </View>
        );
    }

    return (
        <Stack screenOptions={{
            headerStyle: { backgroundColor: '#0f172a' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontFamily: 'Inter_700Bold' },
        }}>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="teams" options={{ title: 'Manage Teams' }} />
            <Stack.Screen name="players" options={{ title: 'Manage Players' }} />
            <Stack.Screen name="matches" options={{ title: 'Enter Match Result' }} />
        </Stack>
    );
}
