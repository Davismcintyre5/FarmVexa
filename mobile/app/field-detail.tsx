import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getField, getFieldReadings } from '@/api/api';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { formatDate, formatTemperature } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export default function FieldDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [field, setField] = useState<any>(null);
    const [readings, setReadings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getField(id as string), getFieldReadings(id as string, 5)])
            .then(([f, r]) => {
                setField(f.data.data.field);
                setReadings(r.data.data.readings || []);
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <Spinner />;
    if (!field) return <View className="flex-1 items-center justify-center"><Text className="text-gray-500">Field not found</Text></View>;

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
                            <Text className="text-xl font-bold text-gray-900">{field.name}</Text>
                            <Text className="text-gray-500 mt-1">Crop: {field.crop || 'N/A'}</Text>
                            <Text className="text-gray-500">Area: {field.size?.value ? `${field.size.value} ${field.size.unit}` : 'N/A'}</Text>
                        </View>
                        <Badge status={field.status} />
                    </View>
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

                <TouchableOpacity
                    onPress={() => router.push(`/scan-history?id=${field._id}`)}
                    className="bg-green-600 rounded-xl py-3 items-center"
                >
                    <Text className="text-white font-medium">View Scan History</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
