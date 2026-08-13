import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { getFarms } from '@/api/api';
import api from '@/api/api';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { Ionicons } from '@expo/vector-icons';

export default function Team() {
    const router = useRouter();
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const farmsRes = await getFarms();
                const farms = farmsRes.data.data.farms || [];
                const all: any[] = [];
                for (const f of farms) {
                    try {
                        const res = await api.get(`/farm/team/farm/${f._id}`);
                        all.push(...(res.data.data.members || []));
                    } catch {}
                }
                setMembers(all);
            } catch {} finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <Spinner />;

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-4">
                <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2 mb-4">
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                    <Text className="text-xl font-bold text-gray-900">Team</Text>
                </TouchableOpacity>

                {members.length === 0 ? (
                    <EmptyState icon={<Ionicons name="people" size={48} color="#16a34a" />} title="No team members" />
                ) : (
                    <View className="space-y-3">
                        {members.map((member) => (
                            <Card key={member._id}>
                                <View className="flex-row items-center gap-3">
                                    <View className="w-10 h-10 bg-green-600 rounded-full items-center justify-center">
                                        <Text className="text-white font-bold">{member.user?.name?.charAt(0) || '?'}</Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="font-medium text-gray-900">{member.user?.name || 'Member'}</Text>
                                        <Text className="text-sm text-gray-500">{member.user?.email || ''}</Text>
                                    </View>
                                    <Badge status={member.role || 'worker'} />
                                </View>
                            </Card>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}
