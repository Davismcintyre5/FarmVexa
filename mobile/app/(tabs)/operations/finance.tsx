import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import api from '@/api/api';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export default function Finance() {
    const router = useRouter();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/farm/transactions')
            .then((res) => setTransactions(res.data.data.transactions || []))
            .catch(() => setTransactions([]))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Spinner />;

    const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
    const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-4">
                <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2 mb-4">
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                    <Text className="text-xl font-bold text-gray-900">Finance</Text>
                </TouchableOpacity>

                <View className="flex-row gap-3 mb-4">
                    <Card className="flex-1">
                        <Text className="text-xs text-gray-500">Income</Text>
                        <Text className="text-lg font-bold text-green-600">{formatCurrency(totalIncome)}</Text>
                    </Card>
                    <Card className="flex-1">
                        <Text className="text-xs text-gray-500">Expenses</Text>
                        <Text className="text-lg font-bold text-red-600">{formatCurrency(totalExpense)}</Text>
                    </Card>
                </View>

                {transactions.length === 0 ? (
                    <EmptyState icon={<Ionicons name="cash" size={48} color="#16a34a" />} title="No transactions" />
                ) : (
                    <View className="space-y-3">
                        {transactions.map((t) => (
                            <Card key={t._id}>
                                <View className="flex-row justify-between items-center">
                                    <View className="flex-1">
                                        <Text className="font-medium text-gray-900">{t.description || t.category}</Text>
                                        <Text className="text-xs text-gray-400 mt-1">{formatDate(t.date || t.createdAt)}</Text>
                                    </View>
                                    <Text className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                    </Text>
                                </View>
                            </Card>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}
