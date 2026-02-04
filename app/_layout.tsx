import { Inter_400Regular, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, Image, View } from 'react-native';
import 'react-native-reanimated';
import "./global.css";

import { Config } from '../constants/Config';
import { AuthProvider } from '../context/AuthContext';
import { LeagueProvider, useLeague } from '../context/LeagueContext';
import { supabase } from '../services/supabase';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigator() {
  const { isLoading } = useLeague();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        router.push('/reset-password');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <Image
          source={Config.isClientApp
            ? require('../assets/images/client/splash-icon.png')
            : require('../assets/images/admin/splash-icon.png')}
          style={{ width: 350, height: 350, resizeMode: 'contain', marginBottom: 20 }}
        />
        <ActivityIndicator size="large" className="text-black dark:text-white" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {!Config.isClientApp && (
        <Stack.Screen name="admin" options={{ headerShown: false }} />
      )}
      <Stack.Screen name="season/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="match/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="reset-password" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <LeagueProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </LeagueProvider>
    </AuthProvider>
  );
}
