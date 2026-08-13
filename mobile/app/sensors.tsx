import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getFarms, getFields, getFieldReadings } from '@/api/api';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate, formatTemperature } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export default function Sensors() {
    const { user } = useAuth();
    const router = useRouter();
    const [readings, setReadings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadReadings = async () => {
            try {
                const farmsRes = await getFarms();
                const farms = farmsRes.data.data.farms || [];
                const all: any[] = [];
                for (const farm of farms) {
                    const fieldsRes = await getFields(farm._id);
                    const fields = fieldsRes.data.data.fields || [];
                    for (const field of fields) {
                        try {
                            const r = await getFieldReadings(field._id, 1);
                            const fieldReadings = r.data.data.readings || [];
                            fieldReadings.forEach((reading: any) => {
                                all.push({ ...reading, fieldName: field.name, farmName: farm.name });
                            });
                        } catch {}
                    }
                }
                all.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setReadings(all.slice(0, 20));
            } catch {} finally {
                setLoading(false);
            }
        };
        loadReadings();
    }, []);

    if (loading) return <Spinner />;

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-4">
                <Text className="text-2xl font-bold text-gray-900 mb-4">Sensor Readings</Text>

                {readings.length === 0 ? (
                    <EmptyState icon={<Ionicons name="pulse" size={48} color="#16a34a" />} title="No readings" description="No sensor data available." />
                ) : (
                    <View className="space-y-3">
                        {readings.map((r, i) => (
                            <Card key={i}>
                                <View className="flex-row justify-between items-center">
                                    <View className="flex-1">
                                        <Text className="font-medium text-gray-900">{r.fieldName}</Text>
                                        <Text className="text-sm text-gray-500">{r.farmName}</Text>
                                        <Text className="text-xs text-gray-400 mt-1">{formatDate(r.timestamp, 'relative')}</Text>
                                    </View>
                                    <View className="items-end gap-1">
                                        <Text className="font-semibold">{formatTemperature(r.temperature)}</Text>
                                        <Text className="text-sm text-gray-500">{r.humidity}%</Text>
                                        <Text className="text-sm text-gray-500">{r.soilMoisture}%</Text>
                                    </View>
                                </View>
                            </Card>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}
