import React from 'react';
import { View, Text } from 'react-native';
import Card from '../ui/Card';
import { formatDate } from '../../utils/formatters';

const weatherIcons: any = { sunny: '☀️', cloudy: '☁️', rainy: '🌧️', stormy: '⛈️', partly_cloudy: '⛅' };

interface WeatherCardProps {
    weather: any;
}

export default function WeatherCard({ weather }: WeatherCardProps) {
    const icon = weatherIcons[weather?.condition] || '☀️';

    return (
        <Card>
            <View className="items-center py-2">
                <Text className="text-5xl">{icon}</Text>
                <Text className="text-3xl font-bold mt-2">
                    {weather.temperature?.avg?.toFixed(1) || weather.temperature?.max || 'N/A'}°C
                </Text>
                <Text className="text-gray-500 capitalize mt-1">{weather.condition?.replace('_', ' ')}</Text>
                <Text className="text-xs text-gray-400 mt-1">
                    Updated: {formatDate(weather.updatedAt, 'relative')}
                </Text>
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
    );
}