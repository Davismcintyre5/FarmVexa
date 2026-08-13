import React from 'react';
import { View, Text } from 'react-native';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

interface FieldCardProps {
    field: any;
    onPress: () => void;
}

export default function FieldCard({ field, onPress }: FieldCardProps) {
    return (
        <Card onPress={onPress}>
            <View className="flex-row justify-between items-center">
                <View className="flex-1">
                    <Text className="font-semibold text-gray-900">{field.name}</Text>
                    <Text className="text-sm text-gray-500 mt-1">{field.crop || 'No crop'}</Text>
                </View>
                <Badge status={field.status} />
            </View>
        </Card>
    );
}