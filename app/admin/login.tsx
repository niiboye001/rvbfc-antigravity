import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { ArrowLeft, Lock, LogIn, Mail, Shield } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StatusBar as RNStatusBar, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
            className="flex-1 bg-secondary"
        >
            <RNStatusBar barStyle="dark-content" />
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View className="bg-white px-6 pb-12 pt-20 border-b border-slate-50/50 items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="absolute top-14 left-6 p-2 rounded-full bg-slate-100"
                    >
                        <ArrowLeft size={20} color="#0f172a" />
                    </TouchableOpacity>

                    <View className="w-20 h-20 rounded-3xl bg-blue-500/10 items-center justify-center mb-6">
                        <Shield size={40} color="#3b82f6" strokeWidth={1.5} />
                    </View>
                    <Text className="text-3xl font-black text-slate-900 uppercase tracking-[3px]">Admin Login</Text>
                    <Text className="text-slate-400 mt-2 text-center px-8 font-medium">
                        Enter your credentials to manage the RvB FC League.
                    </Text>
                </View>

                <View className="flex-1 p-6 pt-10">
                    <View className="space-y-6">
                        <View>
                            <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Email Address</Text>
                            <View className="flex-row items-center bg-white border border-slate-100 shadow-sm shadow-slate-100 rounded-2xl px-4 py-4">
                                <Mail size={20} color="#94a3b8" />
                                <TextInput
                                    className="flex-1 text-slate-800 ml-3 font-bold text-base"
                                    placeholder="admin@rvbfc.com"
                                    placeholderTextColor="#cbd5e1"
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>

                        <View className="mt-6">
                            <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Password</Text>
                            <View className="flex-row items-center bg-white border border-slate-100 shadow-sm shadow-slate-100 rounded-2xl px-4 py-4">
                                <Lock size={20} color="#94a3b8" />
                                <TextInput
                                    className="flex-1 text-slate-800 ml-3 font-bold text-base"
                                    placeholder="••••••••"
                                    placeholderTextColor="#cbd5e1"
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
                            className={`mt-10 rounded-2xl py-5 items-center flex-row justify-center shadow-lg ${loading ? 'bg-slate-300' : 'bg-blue-600 shadow-blue-200'}`}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text className="text-white font-black text-lg mr-2 uppercase tracking-widest">Sign In</Text>
                                    <LogIn size={20} color="#fff" />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View className="mt-auto py-10">
                        <Text className="text-center text-slate-400 text-[10px] font-black uppercase tracking-[2px]">
                            RvB FC League Management © 2025
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
