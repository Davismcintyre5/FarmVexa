import React from 'react';
import { View, Text } from 'react-native';
import Button from './Button';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export default function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
    return (
        <View className="items-center justify-center py-12 px-4">
            {icon && <View className="mb-4">{icon}</View>}
            <Text className="text-lg font-semibold text-gray-900 text-center">{title}</Text>
            {description && <Text className="text-sm text-gray-500 text-center mt-1">{description}</Text>}
            {actionLabel && onAction && (
                <Button onPress={onAction} title={actionLabel} className="mt-4" />
            )}
        </View>
    );
}