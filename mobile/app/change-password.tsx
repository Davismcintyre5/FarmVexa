import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { changePassword } from '@/api/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';

export default function ChangePassword() {
    const router = useRouter();
    const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!form.currentPassword || !form.newPassword) return alert('All fields required');
        if (form.newPassword.length < 6) return alert('Password must be at least 6 characters');
        if (form.newPassword !== form.confirmPassword) return alert('Passwords do not match');
        setLoading(true);
        try {
            await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
            alert('Password changed successfully');
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

                <Card title="Change Password">
                    <View className="space-y-4">
                        <Input label="Current Password" value={form.currentPassword} onChangeText={(text) => setForm({ ...form, currentPassword: text })} secureTextEntry placeholder="••••••••" />
                        <Input label="New Password" value={form.newPassword} onChangeText={(text) => setForm({ ...form, newPassword: text })} secureTextEntry placeholder="••••••••" />
                        <Input label="Confirm Password" value={form.confirmPassword} onChangeText={(text) => setForm({ ...form, confirmPassword: text })} secureTextEntry placeholder="••••••••" />
                        <Button title="Change Password" onPress={handleSubmit} loading={loading} />
                    </View>
                </Card>
            </View>
        </ScrollView>
    );
}
