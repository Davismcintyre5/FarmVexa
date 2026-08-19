import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import LivestockTab from './LivestockTab';
import HealthTab from './HealthTab';
import ProductionTab from './ProductionTab';
import InventoryTab from './InventoryTab';
import EquipmentTab from './EquipmentTab';
import FinanceTab from './FinanceTab';
import TeamTasksTab from './TeamTasksTab';
import MarketTab from './MarketTab';
import ReportsTab from './ReportsTab';

export default function Operations() {
  const { user } = useAuth();
  const role = user?.role || 'farmer';

  const allTabs = [
    { key: 'livestock', icon: 'git-branch', label: 'Livestock', roles: ['farmer', 'worker', 'vet', 'manager'] },
    { key: 'health', icon: 'heart', label: 'Health', roles: ['farmer', 'vet', 'manager'] },
    { key: 'production', icon: 'cube', label: 'Production', roles: ['farmer', 'worker', 'manager'] },
    { key: 'inventory', icon: 'cube-outline', label: 'Inventory', roles: ['farmer', 'manager'] },
    { key: 'equipment', icon: 'build', label: 'Equipment', roles: ['farmer', 'manager'] },
    { key: 'finance', icon: 'cash', label: 'Finance', roles: ['farmer', 'manager'] },
    { key: 'team', icon: 'people', label: 'Team & Tasks', roles: ['farmer', 'worker', 'vet', 'manager'] },
    { key: 'market', icon: 'bag', label: 'Market', roles: ['farmer'] },
    { key: 'reports', icon: 'document-text', label: 'Reports', roles: ['farmer', 'manager'] },
  ];

  const tabs = allTabs.filter((t) => t.roles.includes(role));
  const [activeTab, setActiveTab] = useState(tabs[0]?.key || 'livestock');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'livestock':
        return <LivestockTab readOnly={role === 'vet' || role === 'worker'} />;
      case 'health':
        return <HealthTab readOnly={!['farmer', 'vet', 'manager'].includes(role)} />;
      case 'production':
        return <ProductionTab readOnly={!['farmer', 'worker', 'manager'].includes(role)} />;
      case 'inventory':
        return <InventoryTab />;
      case 'equipment':
        return <EquipmentTab readOnly={!['farmer', 'manager'].includes(role)} />;
      case 'finance':
        return <FinanceTab />;
      case 'team':
        return <TeamTasksTab readOnly={role === 'worker' || role === 'vet'} />;
      case 'market':
        return <MarketTab />;
      case 'reports':
        return <ReportsTab />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {tabs.map(({ key, icon, label }) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.tab,
              activeTab === key && styles.tabActive,
            ]}
            onPress={() => setActiveTab(key)}
          >
            <Ionicons
              name={icon as any}
              size={18}
              color={activeTab === key ? colors.primary[500] : colors.gray[500]}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === key && styles.tabTextActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.tabContent}>
        {renderTabContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  tabBar: {
    flexGrow: 0,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  tabBarContent: {
    paddingHorizontal: spacing.xs,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: colors.transparent,
  },
  tabActive: {
    borderBottomColor: colors.primary[500],
  },
  tabText: {
    fontSize: 14,
    color: colors.gray[500],
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primary[500],
  },
  tabContent: {
    flex: 1,
  },
});