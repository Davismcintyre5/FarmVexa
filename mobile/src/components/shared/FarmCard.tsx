import React from 'react';
import { View, Text } from 'react-native';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

interface FarmCardProps {
    farm: any;
    onPress: () => void;
}

export default function FarmCard({ farm, onPress }: FarmCardProps) {
    return (
        <Card onPress={onPress}>
            <View className="flex-row justify-between items-center">
                <View className="flex-1">
                    <Text className="font-semibold text-gray-900 text-base">{farm.name}</Text>
                    <Text className="text-sm text-gray-500 mt-1">{farm.location?.county || 'N/A'}</Text>
                    <Text className="text-sm text-gray-500">{farm.size?.value ? `${farm.size.value} ${farm.size.unit}` : ''}</Text>
                </View>
                <Badge status={farm.status} />
            </View>
        </Card>
    );
}