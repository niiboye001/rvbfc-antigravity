import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useFocusEffect, withLayoutContext } from 'expo-router';
import { useCallback } from 'react';
import { StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext(Navigator);

export default function MatchLayout() {
    // Ensure status bar is light when this screen is focused
    useFocusEffect(
        useCallback(() => {
            StatusBar.setBarStyle('light-content');
            return () => { };
        }, [])
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#1e293b' }}>
            <SafeAreaView edges={['top']} style={{ backgroundColor: '#1e293b' }}>
                {/* Header Main Content - Centered */}
                <View className="items-center justify-center py-6">
                    <Text className="text-white text-3xl font-black tracking-widest text-center" style={{ fontFamily: 'Inter_700Bold' }}>R v B FC</Text>
                </View>
            </SafeAreaView>

            <MaterialTopTabs
                screenOptions={{
                    tabBarStyle: { backgroundColor: '#1e293b', elevation: 0, shadowOpacity: 0, borderBottomWidth: 0 },
                    tabBarLabelStyle: { fontFamily: 'Inter_700Bold', fontSize: 15, textTransform: 'capitalize', fontWeight: 'bold' },
                    tabBarActiveTintColor: '#ffffff',
                    tabBarInactiveTintColor: '#94a3b8', // Slate-400 for inactive
                    tabBarIndicatorStyle: { backgroundColor: '#ffffff', height: 3 },
                    tabBarItemStyle: { width: 'auto', paddingHorizontal: 16 }
                }}
            >
                <MaterialTopTabs.Screen name="index" options={{ title: 'Current Result' }} />
                <MaterialTopTabs.Screen name="table" options={{ title: 'League Table' }} />
                <MaterialTopTabs.Screen name="seasons" options={{ title: 'Seasons' }} />
            </MaterialTopTabs>
        </View>
    );
}
