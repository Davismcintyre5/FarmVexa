import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';

interface Option {
    value: string;
    label: string;
}

interface SelectProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
}

export default function Select({ label, value, onChange, options, placeholder = 'Select...' }: SelectProps) {
    const [open, setOpen] = useState(false);
    const selected = options.find((o) => o.value === value);

    return (
        <View className="space-y-1">
            {label && <Text className="text-sm font-medium text-gray-700">{label}</Text>}
            <TouchableOpacity
                onPress={() => setOpen(true)}
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3"
            >
                <Text className={`text-sm ${selected ? 'text-gray-900' : 'text-gray-400'}`}>
                    {selected?.label || placeholder}
                </Text>
            </TouchableOpacity>

            <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
                <TouchableOpacity className="flex-1 bg-black/50" onPress={() => setOpen(false)}>
                    <View className="bg-white rounded-t-2xl p-4 mt-auto">
                        <Text className="text-lg font-bold mb-3">{label || 'Select'}</Text>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => { onChange(item.value); setOpen(false); }}
                                    className="py-3 border-b border-gray-100"
                                >
                                    <Text className={`text-sm ${item.value === value ? 'text-green-600 font-semibold' : 'text-gray-700'}`}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}