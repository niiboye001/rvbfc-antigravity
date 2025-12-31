import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Lock, LogIn, Mail, Shield } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../services/supabase';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Login Failed', error.message);
            setLoading(false);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace('/admin/teams');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-slate-950"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <LinearGradient
                    colors={['#1e1b4b', '#0f172a', '#020617']}
                    className="flex-1 px-6 justify-center"
                >
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="absolute top-12 left-6 p-2 rounded-full bg-slate-800/50"
                    >
                        <ArrowLeft size={20} color="#94a3b8" />
                    </TouchableOpacity>

                    <View className="items-center mb-10">
                        <View className="w-20 h-20 rounded-3xl bg-blue-500/20 items-center justify-center mb-4 border border-blue-500/30">
                            <Shield size={40} color="#3b82f6" strokeWidth={1.5} />
                        </View>
                        <Text className="text-3xl font-black text-white">Admin Access</Text>
                        <Text className="text-slate-400 mt-2 text-center px-8">
                            Sign in to manage teams, players, and match results.
                        </Text>
                    </View>

                    <View className="space-y-4">
                        <View>
                            <Text className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</Text>
                            <View className="flex-row items-center bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3">
                                <Mail size={20} color="#64748b" />
                                <TextInput
                                    className="flex-1 text-white ml-3 font-medium text-base"
                                    placeholder="admin@rvbfc.com"
                                    placeholderTextColor="#475569"
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>

                        <View>
                            <Text className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</Text>
                            <View className="flex-row items-center bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3">
                                <Lock size={20} color="#64748b" />
                                <TextInput
                                    className="flex-1 text-white ml-3 font-medium text-base"
                                    placeholder="••••••••"
                                    placeholderTextColor="#475569"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.8}
                            className={`mt-6 rounded-2xl py-4 items-center flex-row justify-center ${loading ? 'bg-slate-800' : 'bg-blue-600'}`}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text className="text-white font-bold text-lg mr-2">Sign In</Text>
                                    <LogIn size={20} color="#fff" />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    <Text className="text-center text-slate-500 mt-10 text-xs font-medium">
                        RvB FC League Management © 2025
                    </Text>
                </LinearGradient>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
