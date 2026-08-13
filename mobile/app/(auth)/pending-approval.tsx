import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function PendingApproval() {
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)/login');
    };

    return (
        <View className="flex-1 bg-white items-center justify-center p-6">
            <View className="w-20 h-20 bg-yellow-100 rounded-full items-center justify-center mb-6">
                <Ionicons name="time" size={40} color="#f59e0b" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 text-center">Pending Approval</Text>
            <Text className="text-gray-500 text-center mt-2 mb-8">
                Your account is under review. You'll be notified once approved.
            </Text>
            <TouchableOpacity onPress={handleLogout} className="bg-gray-100 rounded-xl px-6 py-3">
                <Text className="text-gray-700 font-medium">Logout</Text>
            </TouchableOpacity>
        </View>
    );
}
