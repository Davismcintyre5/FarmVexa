import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Card from '@/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';

export default function Settings() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();

    const menuItems = [
        { icon: 'person', label: 'Profile', route: '/profile' },
        { icon: 'chatbubble', label: 'AI Chat', route: '/ai-chat' },
        { icon: 'notifications', label: 'Alerts', route: '/alerts' },
        { icon: 'cloud', label: 'Weather', route: '/weather' },
        { icon: 'pulse', label: 'Sensors', route: '/sensors' },
        { icon: 'hardware-chip', label: 'Devices', route: '/devices' },
        { icon: 'key', label: 'Change Password', route: '/change-password' },
    ];

    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)/login');
    };

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-4">
                <View className="items-center py-6">
                    <View className="w-20 h-20 bg-green-600 rounded-full items-center justify-center mb-3">
                        <Text className="text-white text-3xl font-bold">{user?.name?.charAt(0)}</Text>
                    </View>
                    <Text className="text-xl font-bold text-gray-900">{user?.name}</Text>
                    <Text className="text-gray-500">{user?.email}</Text>
                    <Text className="text-gray-400 capitalize text-sm mt-1">{user?.role || 'Farmer'}</Text>
                </View>

                <Card>
                    <View className="space-y-1">
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => router.push(item.route as any)}
                                className="flex-row items-center gap-3 py-3 border-b border-gray-100"
                            >
                                <Ionicons name={item.icon as any} size={20} color="#16a34a" />
                                <Text className="text-gray-700 flex-1">{item.label}</Text>
                                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </Card>

                <Card className="mt-4">
                    <TouchableOpacity onPress={toggleTheme} className="flex-row items-center gap-3 py-3">
                        <Ionicons name={theme === 'dark' ? 'sunny' : 'moon'} size={20} color="#16a34a" />
                        <Text className="text-gray-700 flex-1">Dark Mode</Text>
                        <View className={`w-12 h-6 rounded-full ${theme === 'dark' ? 'bg-green-600' : 'bg-gray-300'} p-0.5`}>
                            <View className={`w-5 h-5 bg-white rounded-full ${theme === 'dark' ? 'ml-6' : 'ml-0'}`} />
                        </View>
                    </TouchableOpacity>
                </Card>

                <TouchableOpacity
                    onPress={handleLogout}
                    className="bg-red-50 border border-red-200 rounded-xl py-3 mt-4 items-center"
                >
                    <Text className="text-red-600 font-medium">Logout</Text>
                </TouchableOpacity>

                <Text className="text-center text-gray-400 text-xs mt-6">FarmVexa v1.0.0</Text>
            </View>
        </ScrollView>
    );
}
