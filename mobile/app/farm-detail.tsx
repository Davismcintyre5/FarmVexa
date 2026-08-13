import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getFarm, getFields, getFarmAlerts, getAnimals, getStock, deleteFarm } from '@/api/api';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export default function FarmDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const isFarmer = user?.role === 'farmer';

    const [farm, setFarm] = useState<any>(null);
    const [fields, setFields] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [animalCount, setAnimalCount] = useState(0);
    const [stockValue, setStockValue] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getFarm(id as string), getFields(id as string), getFarmAlerts(id as string), getAnimals(id as string), getStock(id as string)])
            .then(([f, fl, a, an, st]) => {
                setFarm(f.data.data.farm);
                setFields(fl.data.data.fields || []);
                setAlerts(a.data.data.alerts || []);
                setAnimalCount((an.data.data.animals || []).length);
                const items = st.data.data.items || [];
                setStockValue(items.reduce((s: number, i: any) => s + (i.quantity || 0) * (i.pricePerUnit || 0), 0));
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleDelete = async () => {
        await deleteFarm(id as string);
        router.back();
    };

    if (loading) return <Spinner />;
    if (!farm) return <View className="flex-1 items-center justify-center"><Text className="text-gray-500">Farm not found</Text></View>;

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-4 space-y-4">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2">
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    {isFarmer && (
                        <View className="flex-row gap-2">
                            <TouchableOpacity onPress={() => router.push(`/farm-edit?id=${farm._id}`)} className="bg-gray-100 rounded-lg p-2">
                                <Ionicons name="create" size={18} color="#374151" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleDelete} className="bg-red-50 rounded-lg p-2">
                                <Ionicons name="trash" size={18} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View>
                    <Text className="text-2xl font-bold text-gray-900">{farm.name}</Text>
                    <Text className="text-gray-500 mt-1">
                        <Ionicons name="location" size={14} color="#6b7280" /> {farm.location?.county}, {farm.location?.subCounty}
                    </Text>
                    <Text className="text-gray-500">
                        <Ionicons name="resize" size={14} color="#6b7280" /> {farm.size?.value ? `${farm.size.value} ${farm.size.unit}` : 'N/A'}
                    </Text>
                </View>

                <View className="flex-row flex-wrap gap-3">
                    <Card className="flex-1 min-w-[45%]">
                        <Ionicons name="layers" size={24} color="#16a34a" />
                        <Text className="text-2xl font-bold text-gray-900 mt-2">{fields.length}</Text>
                        <Text className="text-sm text-gray-500">Fields</Text>
                    </Card>
                    <Card className="flex-1 min-w-[45%]">
                        <Ionicons name="paw" size={24} color="#f59e0b" />
                        <Text className="text-2xl font-bold text-gray-900 mt-2">{animalCount}</Text>
                        <Text className="text-sm text-gray-500">Animals</Text>
                    </Card>
                    <Card className="flex-1 min-w-[45%]">
                        <Ionicons name="cube" size={24} color="#3b82f6" />
                        <Text className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(stockValue)}</Text>
                        <Text className="text-sm text-gray-500">Stock Value</Text>
                    </Card>
                    <Card className="flex-1 min-w-[45%]">
                        <Ionicons name="notifications" size={24} color="#ef4444" />
                        <Text className="text-2xl font-bold text-gray-900 mt-2">{alerts.filter((a) => !a.isRead).length}</Text>
                        <Text className="text-sm text-gray-500">Alerts</Text>
                    </Card>
                </View>

                <Card title="Fields">
                    {fields.length === 0 ? (
                        <Text className="text-gray-400 py-4 text-center text-sm">No fields yet</Text>
                    ) : (
                        fields.map((field) => (
                            <TouchableOpacity
                                key={field._id}
                                onPress={() => router.push(`/field-detail?id=${field._id}`)}
                                className="flex-row items-center justify-between py-3 border-b border-gray-100"
                            >
                                <View>
                                    <Text className="font-medium text-gray-900">{field.name}</Text>
                                    <Text className="text-sm text-gray-500">{field.crop || 'No crop'}</Text>
                                </View>
                                <Badge status={field.status} />
                            </TouchableOpacity>
                        ))
                    )}
                </Card>
            </View>
        </ScrollView>
    );
}
