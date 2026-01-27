import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, Lock, LogIn, Mail, Shield } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StatusBar as RNStatusBar, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../services/supabase';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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

    const handleResetPassword = async () => {
        if (!email) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        setLoading(false);

        if (error) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', error.message);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'Check your email for the password reset link.');
            setIsResetting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
            className="flex-1 bg-secondary"
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <RNStatusBar barStyle="dark-content" />
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
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
                    <Text className="text-3xl font-black text-slate-900 uppercase tracking-[3px]">
                        {isResetting ? 'Reset Password' : 'Admin Login'}
                    </Text>
                    <Text className="text-slate-400 mt-2 text-center px-8 font-medium">
                        {isResetting
                            ? 'Enter your email to receive reset instructions.'
                            : 'Enter your credentials to manage the Oneness FC League.'}
                    </Text>
                </View>

                <View className="flex-1 p-6 pt-10">
                    <View className="space-y-6">
                        <View>
                            <Text className="text-sm font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Email Address</Text>
                            <View className="flex-row items-center bg-white border border-slate-300 shadow-sm shadow-slate-100 rounded-2xl px-4 py-4">
                                <Mail size={20} color="#94a3b8" />
                                <TextInput
                                    className="flex-1 text-slate-800 ml-3 font-bold text-base"
                                    placeholder="admin@onenessfc.com"
                                    placeholderTextColor="#cbd5e1"
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>

                        {!isResetting && (
                            <View className="mt-6">
                                <View className="flex-row justify-between items-center mb-3 ml-1">
                                    <Text className="text-sm font-black text-slate-500 uppercase tracking-widest">Password</Text>
                                    <TouchableOpacity
                                        onPress={() => setIsResetting(true)}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        className="py-1"
                                    >
                                        <Text className="text-sm font-bold text-blue-600">Forgot Password?</Text>
                                    </TouchableOpacity>
                                </View>
                                <View className="flex-row items-center bg-white border border-slate-300 shadow-sm shadow-slate-100 rounded-2xl px-4 py-4">
                                    <Lock size={20} color="#94a3b8" />
                                    <TextInput
                                        className="flex-1 text-slate-800 ml-3 font-bold text-base"
                                        placeholder="••••••••"
                                        placeholderTextColor="#cbd5e1"
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={setPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                                        {showPassword ? (
                                            <EyeOff size={20} color="#94a3b8" />
                                        ) : (
                                            <Eye size={20} color="#94a3b8" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            onPress={isResetting ? handleResetPassword : handleLogin}
                            disabled={loading}
                            activeOpacity={0.8}
                            className={`mt-10 rounded-2xl py-5 items-center flex-row justify-center shadow-lg ${loading ? 'bg-slate-300' : 'bg-blue-600 shadow-blue-200'}`}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text className="text-white font-black text-lg mr-2 uppercase tracking-widest">
                                        {isResetting ? 'Send Link' : 'Sign In'}
                                    </Text>
                                    {isResetting ? <Mail size={20} color="#fff" /> : <LogIn size={20} color="#fff" />}
                                </>
                            )}
                        </TouchableOpacity>

                        {isResetting && (
                            <TouchableOpacity
                                onPress={() => setIsResetting(false)}
                                className="mt-4 py-2 items-center"
                            >
                                <Text className="text-slate-500 font-bold text-sm">Cancel</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View className="mt-auto py-10">
                        <Text className="text-center text-slate-400 text-[10px] font-black uppercase tracking-[2px]">
                            Oneness FC League Management © 2025
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
