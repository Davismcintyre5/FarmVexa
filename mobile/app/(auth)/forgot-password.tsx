import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { forgotPassword } from '@/api/api';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<any>(null);

    const handleSubmit = async () => {
        if (!email) { setAlert({ type: 'error', message: 'Email is required' }); return; }
        setLoading(true);
        setAlert(null);
        try {
            await forgotPassword(email);
            setAlert({ type: 'success', message: 'Password reset link sent to your email.' });
        } catch (err: any) {
            setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to send reset link' });
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

                <Text className="text-2xl font-bold text-gray-900 text-center mb-4">Forgot Password</Text>
                <Text className="text-gray-500 text-center mb-6">Enter your email and we'll send you a reset link.</Text>

                {alert && (
                    <View className={`${alert.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-xl p-3 mb-4`}>
                        <Text className={`${alert.type === 'success' ? 'text-green-600' : 'text-red-600'} text-sm`}>{alert.message}</Text>
                    </View>
                )}

                <View className="space-y-4">
                    <Input
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="you@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <Button title="Send Reset Link" onPress={handleSubmit} loading={loading} />
                </View>
            </View>
        </ScrollView>
    );
}
