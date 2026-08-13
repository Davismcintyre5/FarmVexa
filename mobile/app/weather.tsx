import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getFarms, getFarmWeather, refreshWeather } from '@/api/api';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { formatDate } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';

const weatherIcons: any = { sunny: '☀️', cloudy: '☁️', rainy: '🌧️', stormy: '⛈️', partly_cloudy: '⛅' };

export default function Weather() {
    const { user } = useAuth();
    const router = useRouter();
    const isFarmer = user?.role === 'farmer';

    const [farms, setFarms] = useState<any[]>([]);
    const [farmId, setFarmId] = useState('');
    const [weather, setWeather] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (isFarmer) {
            getFarms().then((r) => {
                const list = r.data.data.farms || [];
                setFarms(list);
                if (list.length > 0) setFarmId(list[0]._id);
            });
        } else if (user?.farm) {
            setFarmId(user.farm);
            setFarms([{ _id: user.farm, name: 'Assigned Farm' }]);
        }
    }, [user]);

    useEffect(() => {
        if (farmId) {
            setLoading(true);
            getFarmWeather(farmId).then((r) => setWeather(r.data.data.weather)).catch(() => setWeather(null)).finally(() => setLoading(false));
        }
    }, [farmId]);

    useEffect(() => {
        if (!farmId) return;
        const interval = setInterval(() => {
            getFarmWeather(farmId).then((r) => setWeather(r.data.data.weather)).catch(() => {});
        }, 300000);
        return () => clearInterval(interval);
    }, [farmId]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const r = await refreshWeather(farmId);
            setWeather(r.data.data.weather);
        } catch {} finally {
            setRefreshing(false);
        }
    };

    if (loading) return <Spinner />;

    const icon = weatherIcons[weather?.condition] || '☀️';

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-4 space-y-4">
                <View className="flex-row justify-between items-center">
                    <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2">
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900">Weather</Text>
                    <TouchableOpacity onPress={handleRefresh} className="bg-gray-100 rounded-lg p-2">
                        <Ionicons name="refresh" size={18} color="#374151" />
                    </TouchableOpacity>
                </View>

                {isFarmer && farms.length > 1 && (
                    <Select value={farmId} onChange={setFarmId} options={farms.map((f) => ({ value: f._id, label: f.name }))} />
                )}

                {weather ? (
                    <>
                        <Card>
                            <View className="items-center py-4">
                                <Text className="text-6xl">{icon}</Text>
                                <Text className="text-4xl font-bold mt-2">
                                    {weather.temperature?.avg?.toFixed(1) || weather.temperature?.max || 'N/A'}°C
                                </Text>
                                <Text className="text-gray-500 capitalize mt-1">{weather.condition?.replace('_', ' ')}</Text>
                                <Text className="text-xs text-gray-400 mt-1">Updated: {formatDate(weather.updatedAt, 'relative')}</Text>
                            </View>
                            <View className="flex-row justify-around mt-4 pt-4 border-t border-gray-100">
                                <View className="items-center">
                                    <Text className="text-xs text-gray-500">Humidity</Text>
                                    <Text className="font-semibold">{weather.humidity || 'N/A'}%</Text>
                                </View>
                                <View className="items-center">
                                    <Text className="text-xs text-gray-500">Rain</Text>
                                    <Text className="font-semibold">{weather.rainfall || 0}mm</Text>
                                </View>
                                <View className="items-center">
                                    <Text className="text-xs text-gray-500">Wind</Text>
                                    <Text className="font-semibold">{weather.windSpeed || 'N/A'} km/h</Text>
                                </View>
                            </View>
                        </Card>
                    </>
                ) : (
                    <Card>
                        <Text className="text-gray-400 text-center py-8">No weather data. Click refresh.</Text>
                    </Card>
                )}
            </View>
        </ScrollView>
    );
}
