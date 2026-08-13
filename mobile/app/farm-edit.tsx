import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getFarm, updateFarm } from '@/api/api';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { SIZE_UNITS } from '@/utils/config';
import { Ionicons } from '@expo/vector-icons';

export default function FarmEdit() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [form, setForm] = useState({ name: '', county: '', subCounty: '', size: '', unit: 'acres' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getFarm(id as string).then((res) => {
            const f = res.data.data.farm;
            setForm({
                name: f.name,
                county: f.location?.county || '',
                subCounty: f.location?.subCounty || '',
                size: f.size?.value?.toString() || '',
                unit: f.size?.unit || 'acres',
            });
        }).finally(() => setLoading(false));
    }, [id]);

    const handleSubmit = async () => {
        setSaving(true);
        try {
            await updateFarm(id as string, {
                name: form.name,
                location: { county: form.county, subCounty: form.subCounty },
                size: { value: Number(form.size), unit: form.unit },
            });
            router.back();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Spinner />;

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-4 space-y-4">
                <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2">
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                    <Text className="text-gray-700">Back</Text>
                </TouchableOpacity>

                <Card title="Edit Farm">
                    <View className="space-y-4">
                        <Input label="Farm Name" value={form.name} onChangeText={(text) => setForm({ ...form, name: text })} />
                        <View className="flex-row gap-3">
                            <View className="flex-1">
                                <Input label="County" value={form.county} onChangeText={(text) => setForm({ ...form, county: text })} />
                            </View>
                            <View className="flex-1">
                                <Input label="Sub-County" value={form.subCounty} onChangeText={(text) => setForm({ ...form, subCounty: text })} />
                            </View>
                        </View>
                        <View className="flex-row gap-3">
                            <View className="flex-1">
                                <Input label="Size" value={form.size} onChangeText={(text) => setForm({ ...form, size: text })} keyboardType="numeric" />
                            </View>
                            <View className="flex-1">
                                <Select label="Unit" value={form.unit} onChange={(value) => setForm({ ...form, unit: value })} options={SIZE_UNITS} />
                            </View>
                        </View>
                        <Button title="Save Changes" onPress={handleSubmit} loading={saving} />
                    </View>
                </Card>
            </View>
        </ScrollView>
    );
}
