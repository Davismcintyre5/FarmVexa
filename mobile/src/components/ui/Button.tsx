import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from 'react-native';

interface ButtonProps {
    onPress: () => void;
    title?: string;
    loading?: boolean;
    disabled?: boolean;
    variant?: 'primary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    style?: ViewStyle;
    children?: React.ReactNode;
    className?: string;
}

export default function Button({ onPress, title, loading, disabled, variant = 'primary', size = 'md', style, children }: ButtonProps) {
    const getBg = () => {
        if (disabled) return 'bg-gray-300';
        if (variant === 'primary') return 'bg-green-600';
        if (variant === 'outline') return 'bg-transparent border border-gray-300';
        return 'bg-transparent';
    };

    const getTextColor = () => {
        if (disabled) return 'text-gray-500';
        if (variant === 'primary') return 'text-white';
        return 'text-gray-700';
    };

    const getPadding = () => {
        if (size === 'sm') return 'py-1.5 px-3';
        if (size === 'lg') return 'py-3.5 px-6';
        return 'py-2.5 px-4';
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={style}
            className={`${getBg()} ${getPadding()} rounded-xl flex-row items-center justify-center gap-2`}
        >
            {loading ? (
                <ActivityIndicator size="small" color={variant === 'primary' ? '#fff' : '#374151'} />
            ) : children ? (
                children
            ) : (
                <Text className={`${getTextColor()} font-semibold text-sm`}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}