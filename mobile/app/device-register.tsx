import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { getFarms, registerDevice } from '@/api/api';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';

export default function DeviceRegister() {
    const router = useRouter();
    const [form, setForm] = useState({ deviceId: '', farmId: '' });
    const [farms, setFarms] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getFarms().then((res) => setFarms(res.data.data.farms || []));
    }, []);

    const handleSubmit = async () => {
        if (!form.deviceId || !form.farmId) return alert('All fields required');
        setLoading(true);
        try {
            await registerDevice(form.farmId, { deviceId: form.deviceId });
            router.back();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-4 space-y-4">
                <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2">
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                    <Text className="text-gray-700">Back</Text>
                </TouchableOpacity>

                <Card title="Register Device">
                    <View className="space-y-4">
                        <Input
                            label="Device ID"
                            value={form.deviceId}
                            onChangeText={(text) => setForm({ ...form, deviceId: text })}
                            placeholder="ESP32_FIELD_01"
                        />
                        <Select
                            label="Farm"
                            value={form.farmId}
                            onChange={(value) => setForm({ ...form, farmId: value })}
                            options={farms.map((f) => ({ value: f._id, label: f.name }))}
                        />
                        <Button title="Register Device" onPress={handleSubmit} loading={loading} />
                    </View>
                </Card>
            </View>
        </ScrollView>
    );
}
