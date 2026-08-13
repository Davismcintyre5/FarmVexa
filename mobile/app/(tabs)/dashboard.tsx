import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getFarms, getFarmAlerts, getAnimals, getStock } from '@/api/api';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export default function Dashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const isFarmer = user?.role === 'farmer';
    const teamFarmId = user?.farm;

    const [farms, setFarms] = useState<any[]>([]);
    const [activeFarmId, setActiveFarmId] = useState(isFarmer ? '' : teamFarmId);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [animalCount, setAnimalCount] = useState(0);
    const [stockValue, setStockValue] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isFarmer) {
            getFarms().then((res) => {
                const list = res.data.data.farms || [];
                setFarms(list);
                if (list.length > 0) setActiveFarmId(list[0]._id);
            }).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeFarmId) {
            Promise.all([
                getFarmAlerts(activeFarmId),
                getAnimals(activeFarmId),
                getStock(activeFarmId),
            ]).then(([a, an, st]) => {
                setAlerts((a.data.data.alerts || []).filter((x: any) => !x.isRead));
                setAnimalCount((an.data.data.animals || []).length);
                const items = st.data.data.items || [];
                setStockValue(items.reduce((s: number, i: any) => s + (i.quantity || 0) * (i.pricePerUnit || 0), 0));
            }).catch(() => {});
        }
    }, [activeFarmId]);

    if (loading) return <Spinner />;

    if (isFarmer && farms.length === 0) {
        return (
            <EmptyState
                icon={<Ionicons name="leaf" size={48} color="#16a34a" />}
                title="Welcome to FarmVexa!"
                description="Create your first farm to start monitoring your crops with AI."
                actionLabel="Create Farm"
                onAction={() => router.push('/farm-create')}
            />
        );
    }

    if (!isFarmer && !activeFarmId) {
        return (
            <EmptyState
                icon={<Ionicons name="leaf" size={48} color="#16a34a" />}
                title="No farm assigned"
                description="Contact your farm administrator to be assigned to a farm."
            />
        );
    }

    const totalAlerts = alerts.length;
    const activeFarm = farms.find((f) => f._id === activeFarmId);

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-4 space-y-4">
                <View>
                    <Text className="text-2xl font-bold text-gray-900">Welcome, {user?.name?.split(' ')[0]}!</Text>
                    <Text className="text-gray-500 mt-1 capitalize">{user?.role || 'Farmer'} Dashboard</Text>
                    {!isFarmer && activeFarm && (
                        <Text className="text-sm font-medium text-gray-700 mt-1">📍 {activeFarm.name}</Text>
                    )}
                </View>

                <View className="flex-row flex-wrap gap-3">
                    <Card className="flex-1 min-w-[45%]">
                        <Ionicons name="leaf" size={28} color="#16a34a" />
                        <Text className="text-2xl font-bold text-gray-900 mt-2">{isFarmer ? farms.length : 1}</Text>
                        <Text className="text-sm text-gray-500">{isFarmer ? 'Farms' : 'Farm'}</Text>
                    </Card>
                    <Card className="flex-1 min-w-[45%]">
                        <Ionicons name="notifications" size={28} color="#ef4444" />
                        <Text className="text-2xl font-bold text-gray-900 mt-2">{totalAlerts}</Text>
                        <Text className="text-sm text-gray-500">Alerts</Text>
                    </Card>
                    <Card className="flex-1 min-w-[45%]">
                        <Ionicons name="paw" size={28} color="#f59e0b" />
                        <Text className="text-2xl font-bold text-gray-900 mt-2">{animalCount}</Text>
                        <Text className="text-sm text-gray-500">Animals</Text>
                    </Card>
                    <Card className="flex-1 min-w-[45%]">
                        <Ionicons name="cube" size={28} color="#3b82f6" />
                        <Text className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(stockValue)}</Text>
                        <Text className="text-sm text-gray-500">Stock Value</Text>
                    </Card>
                </View>

                <Card title="Recent Alerts">
                    {totalAlerts === 0 ? (
                        <Text className="text-sm text-gray-400 py-4 text-center">No unread alerts</Text>
                    ) : (
                        alerts.slice(0, 4).map((alert) => (
                            <View key={alert._id} className="flex-row items-start gap-2 py-2">
                                <Badge status={alert.severity} />
                                <View className="flex-1">
                                    <Text className="text-sm font-medium text-gray-900">{alert.message}</Text>
                                    <Text className="text-xs text-gray-400 mt-0.5">{formatDate(alert.createdAt, 'relative')}</Text>
                                </View>
                            </View>
                        ))
                    )}
                </Card>

                <Card title="Quick Actions">
                    <View className="flex-row flex-wrap gap-3">
                        <TouchableOpacity onPress={() => router.push('/scan')} className="bg-gray-100 rounded-xl p-4 flex-1 min-w-[45%] flex-row items-center gap-2">
                            <Ionicons name="camera" size={20} color="#16a34a" />
                            <Text className="text-sm font-medium">Scan Crop</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/ai-chat')} className="bg-gray-100 rounded-xl p-4 flex-1 min-w-[45%] flex-row items-center gap-2">
                            <Ionicons name="chatbubble" size={20} color="#3b82f6" />
                            <Text className="text-sm font-medium">AI Chat</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/operations')} className="bg-gray-100 rounded-xl p-4 flex-1 min-w-[45%] flex-row items-center gap-2">
                            <Ionicons name="cube" size={20} color="#16a34a" />
                            <Text className="text-sm font-medium">Production</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/alerts')} className="bg-gray-100 rounded-xl p-4 flex-1 min-w-[45%] flex-row items-center gap-2">
                            <Ionicons name="warning" size={20} color="#f59e0b" />
                            <Text className="text-sm font-medium">Alerts</Text>
                        </TouchableOpacity>
                    </View>
                </Card>
            </View>
        </ScrollView>
    );
}
