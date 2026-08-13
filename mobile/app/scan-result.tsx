import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getImage } from '@/api/api';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { getFullImageUrl } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export default function ScanResult() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [image, setImage] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getImage(id as string).then((res) => setImage(res.data.data.image)).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <Spinner />;
    if (!image) return <View className="flex-1 items-center justify-center"><Text className="text-gray-500">Image not found</Text></View>;

    const isHealthy = image.diseaseDetected === 'Healthy';

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-4 space-y-4">
                <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2">
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                    <Text className="text-gray-700">Back</Text>
                </TouchableOpacity>

                <Card>
                    <Image
                        source={{ uri: getFullImageUrl(image.imageUrl) }}
                        className="w-full h-64 rounded-xl bg-gray-200"
                        resizeMode="cover"
                    />

                    <View className={`mt-4 p-4 rounded-xl ${isHealthy ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        <View className="flex-row items-center gap-3">
                            <Ionicons name={isHealthy ? 'shield-checkmark' : 'warning'} size={32} color={isHealthy ? '#16a34a' : '#ef4444'} />
                            <View>
                                <Text className={`text-lg font-bold ${isHealthy ? 'text-green-700' : 'text-red-700'}`}>
                                    {isHealthy ? 'Crop is Healthy' : 'Disease Detected'}
                                </Text>
                                <Text className={`text-sm ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                                    {isHealthy ? 'No issues found' : image.diseaseDetected}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View className="flex-row flex-wrap gap-3 mt-4">
                        <View className="bg-gray-100 rounded-xl p-3 flex-1 min-w-[45%]">
                            <Text className="text-xs text-gray-500">Severity</Text>
                            <Badge status={image.severity || 'low'} />
                        </View>
                        {image.cropType && (
                            <View className="bg-gray-100 rounded-xl p-3 flex-1 min-w-[45%]">
                                <Text className="text-xs text-gray-500">Crop</Text>
                                <Text className="font-semibold capitalize">{image.cropType}</Text>
                            </View>
                        )}
                    </View>

                    {image.recommendation && (
                        <View className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
                            <Text className="font-semibold text-green-700 mb-1">💡 Recommendation</Text>
                            <Text className="text-green-600 text-sm leading-relaxed">{image.recommendation}</Text>
                        </View>
                    )}
                </Card>
            </View>
        </ScrollView>
    );
}
