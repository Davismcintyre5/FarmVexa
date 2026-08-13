import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getDevice, getDeviceReadings } from '@/api/api';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { formatDate, formatTemperature } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export default function DeviceDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [device, setDevice] = useState<any>(null);
    const [readings, setReadings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getDevice(id as string), getDeviceReadings(id as string, 5)])
            .then(([d, r]) => {
                setDevice(d.data.data.device);
                setReadings(r.data.data.readings || []);
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <Spinner />;
    if (!device) return <View className="flex-1 items-center justify-center"><Text className="text-gray-500">Device not found</Text></View>;

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-4 space-y-4">
                <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2">
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                    <Text className="text-gray-700">Back</Text>
                </TouchableOpacity>

                <Card>
                    <View className="flex-row justify-between items-center">
                        <View className="flex-1">
                            <Text className="text-xl font-bold text-gray-900">{device.deviceId}</Text>
                            <Text className="text-gray-500 mt-1">Field: {device.field?.name || 'Unassigned'}</Text>
                        </View>
                        <Badge status={device.status} />
                    </View>

                    <View className="flex-row gap-4 mt-4">
                        <View className="flex-row items-center gap-2">
                            <Ionicons name="battery-full" size={16} color="#16a34a" />
                            <Text className="text-gray-700">{device.batteryLevel || '?'}%</Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                            <Ionicons name="wifi" size={16} color="#3b82f6" />
                            <Text className="text-gray-700">{device.status === 'online' ? 'Connected' : 'Offline'}</Text>
                        </View>
                    </View>

                    <Text className="text-sm text-gray-400 mt-3">Last seen: {formatDate(device.lastSeen, 'relative')}</Text>
                    <Text className="text-sm text-gray-400">Firmware: {device.firmwareVersion || 'N/A'}</Text>
                </Card>

                {readings.length > 0 && (
                    <Card title="Recent Readings">
                        {readings.map((r, i) => (
                            <View key={i} className="flex-row justify-between py-2 border-b border-gray-100">
                                <Text className="text-sm text-gray-500">{formatDate(r.timestamp, 'time')}</Text>
                                <Text className="text-sm font-medium">{formatTemperature(r.temperature)}</Text>
                                <Text className="text-sm text-gray-500">{r.humidity}%</Text>
                                <Text className="text-sm text-gray-500">{r.soilMoisture}%</Text>
                            </View>
                        ))}
                    </Card>
                )}
            </View>
        </ScrollView>
    );
}
