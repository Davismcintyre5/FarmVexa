import React from 'react';
import { View, Text } from 'react-native';

interface BadgeProps {
    status: string;
    className?: string;
}

export default function Badge({ status, className = '' }: BadgeProps) {
    const getColor = () => {
        const s = status?.toLowerCase();
        if (['active', 'online', 'healthy', 'low', 'success', 'completed'].includes(s)) return 'bg-green-100 text-green-700';
        if (['pending', 'moderate', 'warning'].includes(s)) return 'bg-yellow-100 text-yellow-700';
        if (['inactive', 'offline', 'high', 'critical', 'error'].includes(s)) return 'bg-red-100 text-red-700';
        return 'bg-gray-100 text-gray-700';
    };

    return (
        <View className={`${getColor()} px-2 py-0.5 rounded-full self-start ${className}`}>
            <Text className="text-xs font-medium capitalize">{status || 'Unknown'}</Text>
        </View>
    );
}