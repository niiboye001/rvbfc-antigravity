import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { router, withLayoutContext } from 'expo-router';
import { ClipboardList } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Config } from '../../../constants/Config';
import { useLeague } from '../../../context/LeagueContext';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext(Navigator);

export default function MatchLayout() {
    const { currentSeason, isLoading } = useLeague();

    return (
        <View style={{ flex: 1, backgroundColor: '#ECECEC' }}>
            <SafeAreaView edges={['top']} style={{ backgroundColor: '#ffffff' }}>
                {/* Header Main Content - Centered */}
                <View className="items-center justify-center py-8">
                    <Text className="text-slate-900 text-3xl font-black tracking-[4px] text-center">MATCH CENTER</Text>
                </View>
            </SafeAreaView>

            {!currentSeason && !isLoading ? (
                <View className="flex-1 bg-secondary justify-center items-center px-6">
                    <View className="bg-white p-8 rounded-3xl border border-blue-50 shadow-sm shadow-blue-100 items-center w-full">
                        <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mb-6">
                            <ClipboardList size={40} color="#3b82f6" />
                        </View>
                        <Text className="text-2xl font-black text-slate-900 text-center mb-3">
                            Match Center
                        </Text>

                        {Config.isClientApp ? (
                            <>
                                <Text className="text-slate-500 text-center font-medium leading-6 mb-6">
                                    The new league season hasn't started yet.
                                    {"\n"}Check back soon for match updates!
                                </Text>
                                <View className="bg-blue-600 px-6 py-3 rounded-full shadow-lg shadow-blue-300">
                                    <Text className="text-white font-bold text-xs uppercase tracking-widest">
                                        Standby
                                    </Text>
                                </View>
                            </>
                        ) : (
                            <>
                                <Text className="text-slate-500 text-center font-medium leading-6 mb-6">
                                    You need an active season before you can access the Match Center features.
                                </Text>
                                <TouchableOpacity
                                    onPress={() => router.push('/admin/seasons')}
                                    className="bg-blue-600 px-8 py-4 rounded-2xl shadow-lg shadow-blue-300 active:scale-95"
                                >
                                    <Text className="text-white font-black text-sm uppercase tracking-widest">
                                        Create Season
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            ) : (
                <MaterialTopTabs
                    screenOptions={{
                        tabBarStyle: {
                            backgroundColor: '#ffffff',
                            elevation: 0,
                            shadowOpacity: 0,
                            borderBottomWidth: 1,
                            borderBottomColor: '#f1f5f9'
                        },
                        tabBarLabelStyle: {
                            fontSize: 12,
                            textTransform: 'uppercase',
                            fontWeight: '900',
                            letterSpacing: 1
                        },
                        tabBarActiveTintColor: '#3b82f6',
                        tabBarInactiveTintColor: '#94a3b8',
                        tabBarIndicatorStyle: { backgroundColor: '#3b82f6', height: 4, borderRadius: 2 },
                        tabBarItemStyle: { width: 'auto', paddingHorizontal: 20 },
                        tabBarScrollEnabled: true
                    }}
                >
                    <MaterialTopTabs.Screen name="index" options={{ title: 'Results' }} />
                    <MaterialTopTabs.Screen name="matches" options={{ title: 'Matches' }} />
                    <MaterialTopTabs.Screen name="table" options={{ title: 'Standings' }} />
                    <MaterialTopTabs.Screen name="stats" options={{ title: 'Contributors' }} />
                    <MaterialTopTabs.Screen name="seasons" options={{ title: 'History' }} />
                </MaterialTopTabs>
            )}
        </View>
    );
}
