import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getFarms, getDevices } from '@/api/api';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export default function Devices() {
    const { user } = useAuth();
    const router = useRouter();
    const isFarmer = user?.role === 'farmer';
    const canManage = ['farmer', 'manager'].includes(user?.role);

    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isFarmer) {
            getFarms().then(async (res) => {
                const list = res.data.data.farms || [];
                const all: any[] = [];
                for (const f of list) {
                    try {
                        const d = await getDevices(f._id);
                        all.push(...(d.data.data.devices || []));
                    } catch {}
                }
                setDevices(all);
            }).finally(() => setLoading(false));
        } else if (user?.farm) {
            getDevices(user.farm)
                .then((d) => setDevices(d.data.data.devices || []))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [isFarmer, user]);

    if (loading) return <Spinner />;

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-4">
                <View className="flex-row justify-between items-center mb-4">
                    <View>
                        <Text className="text-2xl font-bold text-gray-900">Devices</Text>
                        <Text className="text-gray-500 mt-1">{devices.length} device{devices.length !== 1 ? 's' : ''}</Text>
                    </View>
                    {canManage && (
                        <TouchableOpacity onPress={() => router.push('/device-register')} className="bg-green-600 rounded-xl px-4 py-2.5 flex-row items-center gap-1">
                            <Ionicons name="add" size={18} color="#fff" />
                            <Text className="text-white font-medium">Register</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {devices.length === 0 ? (
                    <EmptyState
                        icon={<Ionicons name="hardware-chip" size={48} color="#16a34a" />}
                        title="No devices"
                        description={canManage ? 'Register an ESP32 sensor node.' : 'No devices registered.'}
                    />
                ) : (
                    <View className="space-y-3">
                        {devices.map((device) => (
                            <Card key={device._id} onPress={() => router.push(`/device-detail?id=${device._id}`)}>
                                <View className="flex-row justify-between items-center">
                                    <View className="flex-1">
                                        <Text className="font-semibold text-gray-900">{device.deviceId}</Text>
                                        <Text className="text-sm text-gray-500 mt-1">Last seen: {formatDate(device.lastSeen, 'relative')}</Text>
                                    </View>
                                    <View className="items-end gap-2">
                                        <Badge status={device.status} />
                                        <Text className="text-sm text-gray-500">{device.batteryLevel}%</Text>
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
