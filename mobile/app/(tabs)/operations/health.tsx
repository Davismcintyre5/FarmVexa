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

export default function Health() {
    const router = useRouter();
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const farmsRes = await getFarms();
                const farms = farmsRes.data.data.farms || [];
                const all: any[] = [];
                for (const f of farms) {
                    try {
                        const res = await api.get(`/farm/health/farm/${f._id}`);
                        all.push(...(res.data.data.records || []));
                    } catch {}
                }
                setRecords(all);
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
                    <Text className="text-xl font-bold text-gray-900">Health Records</Text>
                </TouchableOpacity>

                {records.length === 0 ? (
                    <EmptyState icon={<Ionicons name="medkit" size={48} color="#16a34a" />} title="No health records" />
                ) : (
                    <View className="space-y-3">
                        {records.map((r) => (
                            <Card key={r._id}>
                                <View className="flex-row justify-between items-center">
                                    <View className="flex-1">
                                        <Text className="font-medium text-gray-900">{r.animalId || r.animal?.name || 'Animal'}</Text>
                                        <Text className="text-sm text-gray-500 mt-1">{r.diagnosis || r.treatment || 'No details'}</Text>
                                        <Text className="text-xs text-gray-400 mt-1">{formatDate(r.date || r.createdAt)}</Text>
                                    </View>
                                    <Badge status={r.status || 'active'} />
                                </View>
                            </Card>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}
