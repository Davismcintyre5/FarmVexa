import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getFarms, getFarm, deleteFarm } from '@/api/api';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { Ionicons } from '@expo/vector-icons';

export default function Farms() {
    const { user } = useAuth();
    const router = useRouter();
    const isFarmer = user?.role === 'farmer';
    const canManage = ['farmer', 'manager'].includes(user?.role);

    const [farms, setFarms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isFarmer) {
            getFarms().then((res) => setFarms(res.data.data.farms || [])).finally(() => setLoading(false));
        } else if (user?.farm) {
            getFarm(user.farm)
                .then((res) => setFarms([res.data.data.farm]))
                .catch(() => setFarms([]))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [isFarmer, user]);

    const handleDelete = async (id: string) => {
        await deleteFarm(id);
        setFarms((prev) => prev.filter((f) => f._id !== id));
    };

    if (loading) return <Spinner />;

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-4">
                <View className="flex-row justify-between items-center mb-4">
                    <View>
                        <Text className="text-2xl font-bold text-gray-900">Farms</Text>
                        <Text className="text-gray-500 mt-1">{farms.length} farm{farms.length !== 1 ? 's' : ''}</Text>
                    </View>
                    {isFarmer && (
                        <TouchableOpacity
                            onPress={() => router.push('/farm-create')}
                            className="bg-green-600 rounded-xl px-4 py-2.5 flex-row items-center gap-1"
                        >
                            <Ionicons name="add" size={18} color="#fff" />
                            <Text className="text-white font-medium">Add Farm</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {farms.length === 0 ? (
                    <EmptyState
                        icon={<Ionicons name="leaf" size={48} color="#16a34a" />}
                        title="No farms yet"
                        description={isFarmer ? 'Create your first farm to get started.' : 'You are not assigned to any farm.'}
                        actionLabel={isFarmer ? 'Create Farm' : undefined}
                        onAction={isFarmer ? () => router.push('/farm-create') : undefined}
                    />
                ) : (
                    <View className="space-y-3">
                        {farms.map((farm) => (
                            <Card key={farm._id} onPress={() => router.push(`/farm-detail?id=${farm._id}`)}>
                                <View className="flex-row justify-between items-center">
                                    <View className="flex-1">
                                        <Text className="font-semibold text-gray-900 text-base">{farm.name}</Text>
                                        <Text className="text-sm text-gray-500 mt-1">
                                            <Ionicons name="location" size={12} color="#6b7280" /> {farm.location?.county || 'N/A'}
                                        </Text>
                                        <Text className="text-sm text-gray-500">
                                            {farm.size?.value ? `${farm.size.value} ${farm.size.unit}` : ''}
                                        </Text>
                                    </View>
                                    <View className="items-end gap-2">
                                        <Badge status={farm.status} />
                                        {canManage && (
                                            <TouchableOpacity onPress={() => handleDelete(farm._id)}>
                                                <Ionicons name="trash" size={16} color="#9ca3af" />
                                            </TouchableOpacity>
                                        )}
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
