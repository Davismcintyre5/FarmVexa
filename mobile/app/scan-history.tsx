import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getFieldImages } from '@/api/api';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { getFullImageUrl, formatDate } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export default function ScanHistory() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getFieldImages(id as string).then((res) => setImages(res.data.data.images || [])).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <Spinner />;

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-4 space-y-4">
                <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2">
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                    <Text className="text-gray-700">Back</Text>
                </TouchableOpacity>

                <Text className="text-2xl font-bold text-gray-900">Scan History</Text>

                {images.length === 0 ? (
                    <Text className="text-gray-400 py-8 text-center">No scans yet</Text>
                ) : (
                    <View className="space-y-3">
                        {images.map((img) => (
                            <Card key={img._id} onPress={() => router.push(`/scan-result?id=${img._id}`)}>
                                <Image source={{ uri: getFullImageUrl(img.imageUrl) }} className="w-full h-40 rounded-lg bg-gray-200" resizeMode="cover" />
                                <View className="flex-row justify-between items-center mt-3">
                                    <Text className="font-medium text-gray-900">{img.diseaseDetected || 'Healthy'}</Text>
                                    <Badge status={img.severity || 'low'} />
                                </View>
                                <Text className="text-xs text-gray-400 mt-1">{formatDate(img.createdAt, 'relative')}</Text>
                            </Card>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}
