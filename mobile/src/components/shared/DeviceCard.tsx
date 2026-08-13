import React from 'react';
import { View, Text } from 'react-native';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { formatDate } from '../../utils/formatters';

interface DeviceCardProps {
    device: any;
    onPress: () => void;
}

export default function DeviceCard({ device, onPress }: DeviceCardProps) {
    return (
        <Card onPress={onPress}>
            <View className="flex-row justify-between items-center">
                <View className="flex-1">
                    <Text className="font-semibold text-gray-900">{device.deviceId}</Text>
                    <Text className="text-sm text-gray-500 mt-1">Last seen: {formatDate(device.lastSeen, 'relative')}</Text>
                </View>
                <View className="items-end gap-2">
                    <Badge status={device.status} />
                    <Text className="text-sm text-gray-500">{device.batteryLevel}%</Text>
                </View>
            </View>
        </Card>
    );
}