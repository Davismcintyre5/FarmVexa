import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { getFarms, getAnimals } from '@/api/api';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { Ionicons } from '@expo/vector-icons';

export default function Livestock() {
    const router = useRouter();
    const [animals, setAnimals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const farmsRes = await getFarms();
                const farms = farmsRes.data.data.farms || [];
                const all: any[] = [];
                for (const f of farms) {
                    try {
                        const res = await getAnimals(f._id);
                        all.push(...(res.data.data.animals || []));
                    } catch {}
                }
                setAnimals(all);
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
                    <Text className="text-xl font-bold text-gray-900">Livestock</Text>
                </TouchableOpacity>

                {animals.length === 0 ? (
                    <EmptyState icon={<Ionicons name="paw" size={48} color="#16a34a" />} title="No animals" />
                ) : (
                    <View className="space-y-3">
                        {animals.map((animal) => (
                            <Card key={animal._id}>
                                <View className="flex-row justify-between items-center">
                                    <View className="flex-1">
                                        <Text className="font-medium text-gray-900">{animal.name || animal.tagNumber}</Text>
                                        <Text className="text-sm text-gray-500 mt-1 capitalize">{animal.type || 'Animal'}</Text>
                                        {animal.breed && <Text className="text-sm text-gray-500">{animal.breed}</Text>}
                                    </View>
                                    <Badge status={animal.status || 'active'} />
                                </View>
                            </Card>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}
