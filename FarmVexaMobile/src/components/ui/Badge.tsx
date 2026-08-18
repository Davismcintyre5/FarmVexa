import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getStatusColor, getStatusTextColor, capitalize } from '../../utils/formatters';

interface BadgeProps {
  status: string;
  label?: string;
}

export default function Badge({ status, label }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: getStatusColor(status) }]}>
      <Text style={[styles.text, { color: getStatusTextColor(status) }]}>
        {label || capitalize(status)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});