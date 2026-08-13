import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile, updateProfile } from '@/api/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { Ionicons } from '@expo/vector-icons';

export default function Profile() {
    const { user, updateUser } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({ name: '', email: '', phone: '', county: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '', county: user.county || '' });
            setLoading(false);
        }
    }, [user]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await updateProfile(form);
            updateUser(res.data.data.user);
            alert('Profile updated');
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

                <Card title="Profile">
                    <View className="space-y-4">
                        <Input label="Name" value={form.name} onChangeText={(text) => setForm({ ...form, name: text })} />
                        <Input label="Email" value={form.email} onChangeText={(text) => setForm({ ...form, email: text })} keyboardType="email-address" editable={false} />
                        <Input label="Phone" value={form.phone} onChangeText={(text) => setForm({ ...form, phone: text })} keyboardType="phone-pad" />
                        <Input label="County" value={form.county} onChangeText={(text) => setForm({ ...form, county: text })} />
                        <Button title="Save Changes" onPress={handleSave} loading={saving} />
                    </View>
                </Card>
            </View>
        </ScrollView>
    );
}
