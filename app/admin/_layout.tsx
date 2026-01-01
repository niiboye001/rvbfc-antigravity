import { Stack, router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useEffect } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
            <View className="flex-1 bg-secondary items-center justify-center">
                <ActivityIndicator color="#3b82f6" size="large" />
            </View>
        );
    }

    return (
        <Stack screenOptions={{
            header: ({ options, route, navigation }) => {
                const title = options.title || route.name;
                const canGoBack = navigation.canGoBack();

                return (
                    <SafeAreaView edges={['top']} style={{ backgroundColor: '#ffffff' }}>
                        <View className="flex-row items-center justify-center py-10 px-6">
                            {canGoBack && (
                                <TouchableOpacity
                                    onPress={() => navigation.goBack()}
                                    className="absolute left-6 z-10 p-2"
                                >
                                    <ChevronLeft size={28} color="#0f172a" strokeWidth={3} />
                                </TouchableOpacity>
                            )}
                            <Text className="text-slate-900 text-3xl font-black uppercase tracking-[4px] text-center">
                                {title}
                            </Text>
                        </View>
                    </SafeAreaView>
                );
            }
        }}>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="teams" options={{ title: 'Manage Teams' }} />
            <Stack.Screen name="players" options={{ title: 'Manage Players' }} />
            <Stack.Screen name="matches" options={{ title: 'Enter Match Result' }} />
        </Stack>
    );
}
