import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { resetPassword } from '@/api/api';
import { Ionicons } from '@expo/vector-icons';

export default function ResetPassword() {
    const router = useRouter();
    const { token } = useLocalSearchParams();
    const [form, setForm] = useState({ password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<any>(null);

    const handleSubmit = async () => {
        if (!form.password || form.password.length < 6) {
            setAlert({ type: 'error', message: 'Password must be at least 6 characters' });
            return;
        }
        if (form.password !== form.confirmPassword) {
            setAlert({ type: 'error', message: 'Passwords do not match' });
            return;
        }
        setLoading(true);
        setAlert(null);
        try {
            await resetPassword({ token, password: form.password });
            setAlert({ type: 'success', message: 'Password reset successful! Please login.' });
            setTimeout(() => router.replace('/(auth)/login'), 2000);
        } catch (err: any) {
            setAlert({ type: 'error', message: err.response?.data?.message || 'Reset failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="p-6 pt-16">
                <TouchableOpacity onPress={() => router.back()} className="mb-4">
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>

                <Text className="text-2xl font-bold text-gray-900 text-center mb-6">Reset Password</Text>

                {alert && (
                    <View className={`${alert.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-xl p-3 mb-4`}>
                        <Text className={`${alert.type === 'success' ? 'text-green-600' : 'text-red-600'} text-sm`}>{alert.message}</Text>
                    </View>
                )}

                <View className="space-y-4">
                    <Input
                        label="New Password"
                        value={form.password}
                        onChangeText={(text) => setForm({ ...form, password: text })}
                        placeholder="••••••••"
                        secureTextEntry
                    />
                    <Input
                        label="Confirm Password"
                        value={form.confirmPassword}
                        onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
                        placeholder="••••••••"
                        secureTextEntry
                    />
                    <Button title="Reset Password" onPress={handleSubmit} loading={loading} />
                </View>
            </View>
        </ScrollView>
    );
}
