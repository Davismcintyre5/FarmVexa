import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface CardProps {
    title?: string;
    footer?: React.ReactNode;
    children: React.ReactNode;
    hover?: boolean;
    className?: string;
    onPress?: () => void;
}

export default function Card({ title, footer, children, className = '', onPress }: CardProps) {
    const Wrapper = onPress ? TouchableOpacity : View;

    return (
        <Wrapper onPress={onPress} className={`bg-white rounded-xl p-4 border border-gray-200 ${className}`}>
            {title && <Text className="font-semibold text-gray-900 text-base mb-3">{title}</Text>}
            {children}
            {footer && <View className="mt-3 pt-3 border-t border-gray-100">{footer}</View>}
        </Wrapper>
    );
}