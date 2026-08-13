import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { createFarm } from '@/api/api';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { SIZE_UNITS } from '@/utils/config';
import { Ionicons } from '@expo/vector-icons';

export default function FarmCreate() {
    const router = useRouter();
    const [form, setForm] = useState({ name: '', county: '', subCounty: '', size: '', unit: 'acres' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!form.name) return alert('Farm name is required');
        setLoading(true);
        try {
            await createFarm({
                name: form.name,
                location: { county: form.county, subCounty: form.subCounty },
                size: form.size ? { value: Number(form.size), unit: form.unit } : undefined,
            });
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

                <Card title="Create Farm">
                    <View className="space-y-4">
                        <Input label="Farm Name" value={form.name} onChangeText={(text) => setForm({ ...form, name: text })} placeholder="Green Acres" />
                        <View className="flex-row gap-3">
                            <View className="flex-1">
                                <Input label="County" value={form.county} onChangeText={(text) => setForm({ ...form, county: text })} placeholder="Kiambu" />
                            </View>
                            <View className="flex-1">
                                <Input label="Sub-County" value={form.subCounty} onChangeText={(text) => setForm({ ...form, subCounty: text })} placeholder="Limuru" />
                            </View>
                        </View>
                        <View className="flex-row gap-3">
                            <View className="flex-1">
                                <Input label="Size" value={form.size} onChangeText={(text) => setForm({ ...form, size: text })} placeholder="5" keyboardType="numeric" />
                            </View>
                            <View className="flex-1">
                                <Select label="Unit" value={form.unit} onChange={(value) => setForm({ ...form, unit: value })} options={SIZE_UNITS} />
                            </View>
                        </View>
                        <Button title="Create Farm" onPress={handleSubmit} loading={loading} />
                    </View>
                </Card>
            </View>
        </ScrollView>
    );
}
