import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { getFarms, getFarmAlerts, markAlertRead, deleteAlert, deleteAllAlerts } from '@/api/api';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export default function Alerts() {
    const router = useRouter();
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAlerts();
    }, []);

    const loadAlerts = async () => {
        try {
            const farmsRes = await getFarms();
            const farms = farmsRes.data.data.farms || [];
            const all: any[] = [];
            for (const f of farms) {
                try {
                    const a = await getFarmAlerts(f._id);
                    const list = (a.data.data.alerts || []).map((x: any) => ({ ...x, farmId: f._id }));
                    all.push(...list);
                } catch {}
            }
            all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setAlerts(all);
        } catch {} finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id: string) => {
        await markAlertRead(id);
        setAlerts((prev) => prev.map((a) => a._id === id ? { ...a, isRead: true } : a));
    };

    const handleDelete = async (id: string) => {
        await deleteAlert(id);
        setAlerts((prev) => prev.filter((a) => a._id !== id));
    };

    const handleDeleteAll = async () => {
        for (const farmId of [...new Set(alerts.map((a) => a.farmId))]) {
            try { await deleteAllAlerts(farmId as string); } catch {}
        }
        setAlerts([]);
    };

    if (loading) return <Spinner />;

    const unreadCount = alerts.filter((a) => !a.isRead).length;

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-4">
                <View className="flex-row justify-between items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2">
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900">Alerts</Text>
                    <TouchableOpacity onPress={handleDeleteAll}>
                        <Ionicons name="trash" size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>

                {unreadCount > 0 && <Text className="text-gray-500 mb-3">{unreadCount} unread</Text>}

                {alerts.length === 0 ? (
                    <EmptyState icon={<Ionicons name="notifications" size={48} color="#16a34a" />} title="No alerts" description="Everything looks good on your farm." />
                ) : (
                    <View className="space-y-3">
                        {alerts.map((alert) => (
                            <Card key={alert._id} className={alert.isRead ? 'opacity-60' : ''}>
                                <View className="flex-row items-start gap-3">
                                    <Badge status={alert.severity} />
                                    <View className="flex-1">
                                        <Text className={`font-medium text-gray-900 ${!alert.isRead ? 'font-semibold' : ''}`}>{alert.message}</Text>
                                        {alert.recommendation && (
                                            <Text className="text-sm text-gray-500 mt-1">{alert.recommendation}</Text>
                                        )}
                                        <Text className="text-xs text-gray-400 mt-2">{formatDate(alert.createdAt, 'relative')}</Text>
                                    </View>
                                    <View className="gap-1">
                                        {!alert.isRead && (
                                            <TouchableOpacity onPress={() => handleMarkRead(alert._id)}>
                                                <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity onPress={() => handleDelete(alert._id)}>
                                            <Ionicons name="trash" size={16} color="#ef4444" />
                                        </TouchableOpacity>
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
