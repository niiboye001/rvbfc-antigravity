import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Eye, EyeOff, Lock, Save } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StatusBar as RNStatusBar, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../services/supabase';

export default function ResetPasswordScreen() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleUpdatePassword = async () => {
        if (!password || !confirmPassword) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Please fill in both fields');
            return;
        }

        if (password !== confirmPassword) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.updateUser({
            password: password
        });
        setLoading(false);

        if (error) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', error.message);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'Your password has been updated.', [
                { text: 'OK', onPress: () => router.replace('/admin/login') }
            ]);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-secondary"
        >
            <RNStatusBar barStyle="dark-content" />
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View className="bg-white px-6 pb-12 pt-20 border-b border-slate-50/50 items-center">
                    <Text className="text-3xl font-black text-slate-900 uppercase tracking-[3px]">
                        Set New Password
                    </Text>
                    <Text className="text-slate-400 mt-2 text-center px-8 font-medium">
                        Enter your new password below.
                    </Text>
                </View>

                <View className="flex-1 p-6 pt-10">
                    <View className="space-y-6">
                        <View>
                            <Text className="text-sm font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">New Password</Text>
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
                                    {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View>
                            <Text className="text-sm font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Confirm Password</Text>
                            <View className="flex-row items-center bg-white border border-slate-300 shadow-sm shadow-slate-100 rounded-2xl px-4 py-4">
                                <Lock size={20} color="#94a3b8" />
                                <TextInput
                                    className="flex-1 text-slate-800 ml-3 font-bold text-base"
                                    placeholder="••••••••"
                                    placeholderTextColor="#cbd5e1"
                                    secureTextEntry={!showPassword}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleUpdatePassword}
                            disabled={loading}
                            activeOpacity={0.8}
                            className={`mt-10 rounded-2xl py-5 items-center flex-row justify-center shadow-lg ${loading ? 'bg-slate-300' : 'bg-blue-600 shadow-blue-200'}`}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text className="text-white font-black text-lg mr-2 uppercase tracking-widest">
                                        Update Password
                                    </Text>
                                    <Save size={20} color="#fff" />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
