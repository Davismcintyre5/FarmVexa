import React from 'react';
import { View, Text, TouchableOpacity, Modal as RNModal } from 'react-native';

interface ModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export default function Modal({ visible, onClose, title, children }: ModalProps) {
    return (
        <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity className="flex-1 bg-black/50 items-center justify-center p-4" onPress={onClose}>
                <TouchableOpacity activeOpacity={1} className="bg-white rounded-2xl p-5 w-full max-w-sm">
                    {title && <Text className="text-lg font-bold text-gray-900 mb-4">{title}</Text>}
                    {children}
                </TouchableOpacity>
            </TouchableOpacity>
        </RNModal>
    );
}