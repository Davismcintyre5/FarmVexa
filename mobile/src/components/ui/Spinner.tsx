import React from 'react';
import { View, ActivityIndicator } from 'react-native';

interface SpinnerProps {
    size?: 'small' | 'large';
    className?: string;
}

export default function Spinner({ size = 'large', className = '' }: SpinnerProps) {
    return (
        <View className={`flex-1 items-center justify-center py-20 ${className}`}>
            <ActivityIndicator size={size} color="#16a34a" />
        </View>
    );
}