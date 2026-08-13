import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const operations = [
    { route: 'equipment', label: 'Equipment', icon: 'tractor' },
    { route: 'finance', label: 'Finance', icon: 'cash' },
    { route: 'health', label: 'Health', icon: 'medkit' },
    { route: 'inventory', label: 'Inventory', icon: 'cube' },
    { route: 'livestock', label: 'Livestock', icon: 'paw' },
    { route: 'production', label: 'Production', icon: 'leaf' },
    { route: 'reports', label: 'Reports', icon: 'stats-chart' },
    { route: 'tasks', label: 'Tasks', icon: 'checkmark-done' },
    { route: 'team', label: 'Team', icon: 'people' },
];

export default function OperationsMenu() {
    const router = useRouter();

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-4">
                <Text className="text-2xl font-bold text-gray-900 mb-4">Operations</Text>
                <View className="flex-row flex-wrap gap-3">
                    {operations.map((op) => (
                        <TouchableOpacity
                            key={op.route}
                            onPress={() => router.push(`/operations/${op.route}`)}
                            className="bg-white rounded-xl p-4 w-[47%] border border-gray-200 items-center"
                        >
                            <Ionicons name={op.icon as any} size={32} color="#16a34a" />
                            <Text className="text-sm font-medium text-gray-700 mt-2">{op.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}
