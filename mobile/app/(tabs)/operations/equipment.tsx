import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { getFarms } from '@/api/api';
import api from '@/api/api';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export default function Equipment() {
    const router = useRouter();
    const [equipment, setEquipment] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const farmsRes = await getFarms();
                const farms = farmsRes.data.data.farms || [];
                const all: any[] = [];
                for (const f of farms) {
                    try {
                        const res = await api.get(`/farm/equipment/farm/${f._id}`);
                        all.push(...(res.data.data.equipment || []));
                    } catch {}
                }
                setEquipment(all);
            } catch {} finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <Spinner />;

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-4">
                <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2 mb-4">
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                    <Text className="text-xl font-bold text-gray-900">Equipment</Text>
                </TouchableOpacity>

                {equipment.length === 0 ? (
                    <EmptyState icon={<Ionicons name="tractor" size={48} color="#16a34a" />} title="No equipment" description="No equipment records yet." />
                ) : (
                    <View className="space-y-3">
                        {equipment.map((item) => (
                            <Card key={item._id}>
                                <View className="flex-row justify-between items-center">
                                    <View className="flex-1">
                                        <Text className="font-semibold text-gray-900">{item.name}</Text>
                                        <Text className="text-sm text-gray-500 mt-1">{item.type || 'Equipment'}</Text>
                                        <Text className="text-xs text-gray-400 mt-1">Status: {item.status}</Text>
                                    </View>
                                    <Badge status={item.status} />
                                </View>
                            </Card>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}
