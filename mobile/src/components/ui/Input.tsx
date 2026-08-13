import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    rightIcon?: React.ReactNode;
}

export default function Input({ label, error, rightIcon, ...props }: InputProps) {
    return (
        <View className="space-y-1">
            {label && <Text className="text-sm font-medium text-gray-700">{label}</Text>}
            <View className="relative">
                <TextInput
                    {...props}
                    className={`bg-gray-50 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3 text-gray-900 text-sm`}
                    placeholderTextColor="#9ca3af"
                />
                {rightIcon && <View className="absolute right-3 top-3">{rightIcon}</View>}
            </View>
            {error && <Text className="text-red-500 text-xs">{error}</Text>}
        </View>
    );
}