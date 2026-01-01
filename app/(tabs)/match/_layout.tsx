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
        <View style={{ flex: 1, backgroundColor: '#ECECEC' }}>
            <SafeAreaView edges={['top']} style={{ backgroundColor: '#ffffff' }}>
                {/* Header Main Content - Centered */}
                <View className="items-center justify-center py-8">
                    <Text className="text-slate-900 text-3xl font-black tracking-[4px] text-center">MATCH CENTER</Text>
                </View>
            </SafeAreaView>

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
                    tabBarItemStyle: { width: 'auto', paddingHorizontal: 20 }
                }}
            >
                <MaterialTopTabs.Screen name="index" options={{ title: 'Results' }} />
                <MaterialTopTabs.Screen name="table" options={{ title: 'Standings' }} />
                <MaterialTopTabs.Screen name="seasons" options={{ title: 'History' }} />
            </MaterialTopTabs>
        </View>
    );
}
