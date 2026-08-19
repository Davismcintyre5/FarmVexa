import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useFarms } from '../../hooks/useFarms';
import { reportApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDate, formatNumber } from '../../utils/formatters';

const reportTypes = [
  { key: 'general', label: '📊 General' },
  { key: 'stock', label: '📦 Stock' },
  { key: 'livestock', label: '🐄 Livestock' },
  { key: 'production', label: '🥚 Production' },
  { key: 'crops', label: '🌾 Crops' },
  { key: 'financial', label: '💰 Financial' },
  { key: 'vaccination', label: '💉 Vaccination' },
  { key: 'inventory', label: '🏗️ Inventory' },
  { key: 'tasks', label: '✅ Tasks' },
];

const periodOptions = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
];

export default function ReportsTab() {
  const { farms, activeFarm } = useFarms();
  const [farmId, setFarmId] = useState('');
  const [reportType, setReportType] = useState('general');
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState<any>({ items: [], summary: {} });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const farm = farms.find((f) => f._id === farmId) || {};
  const farmName = farm.name || '';
  const farmLocation = farm.location?.county ? `${farm.location.county}${farm.location.subCounty ? ', ' + farm.location.subCounty : ''}` : '';

  useEffect(() => {
    if (farms.length > 0 && !farmId) {
      setFarmId(activeFarm?._id || farms[0]._id);
    }
  }, [farms, activeFarm]);

  const fetchReport = useCallback(async () => {
    if (!farmId) return;
    setLoading(true);
    try {
      const params: any = { type: reportType, period };
      const res = await reportApi.getReport(farmId, params);
      setData({
        items: res.data.data?.items || [],
        summary: res.data.data?.summary || {},
      });
    } catch (error) {
      setData({ items: [], summary: {} });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [farmId, reportType, period]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReport();
  };

  const summary = data.summary || {};
  const items = data.items || [];

  const renderSummaryCards = () => {
    const entries = Object.entries(summary).filter(([key]) => key !== 'byType');
    if (entries.length === 0) return null;

    return (
      <View style={styles.summaryGrid}>
        {entries.map(([key, value]: [string, any]) => (
          <Card key={key} style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {typeof value === 'number' ? formatNumber(value) : value || 0}
            </Text>
            <Text style={styles.summaryLabel}>
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </Text>
          </Card>
        ))}
      </View>
    );
  };

  const renderTable = () => {
    if (reportType === 'general' || items.length === 0) return null;

    return (
      <Card style={styles.tableCard}>
        {items.map((item: any, index: number) => (
          <View key={item._id || index} style={styles.tableRow}>
            {reportType === 'stock' && (
              <>
                <Text style={styles.tableCellBold}>{item.product}</Text>
                <Text style={styles.tableCell}>{item.unit}</Text>
                <Text style={styles.tableCell}>{item.quantity}</Text>
                <Text style={styles.tableCellRight}>
                  KES {formatNumber((item.quantity || 0) * (item.pricePerUnit || 0))}
                </Text>
              </>
            )}
            {reportType === 'livestock' && (
              <>
                <Text style={styles.tableCellBold}>
                  {item.isBatch ? item.batchName || item.tagId : item.tagId}
                </Text>
                <Text style={styles.tableCell}>{item.type}</Text>
                <Text style={styles.tableCell}>{item.breed || '—'}</Text>
                <Text style={styles.tableCell}>
                  {item.isBatch ? `${item.batchCurrent}/${item.batchQuantity}` : item.gender || '—'}
                </Text>
              </>
            )}
            {reportType === 'production' && (
              <>
                <Text style={styles.tableCellBold}>{formatDate(item.date, 'date')}</Text>
                <Text style={styles.tableCell}>{item.type}</Text>
                <Text style={styles.tableCell}>{item.quantity} {item.unit}</Text>
                <Text style={styles.tableCellRight}>
                  {item.totalValue ? `KES ${formatNumber(item.totalValue)}` : '—'}
                </Text>
              </>
            )}
            {reportType === 'crops' && (
              <>
                <Text style={styles.tableCellBold}>{item.name}</Text>
                <Text style={styles.tableCell}>{item.crop || '—'}</Text>
                <Text style={styles.tableCell}>
                  {item.size?.value ? `${item.size.value} ${item.size.unit}` : '—'}
                </Text>
                <Text style={styles.tableCell}>{item.soilType || '—'}</Text>
              </>
            )}
            {reportType === 'financial' && (
              <>
                <Text style={styles.tableCellBold}>{formatDate(item.date, 'date')}</Text>
                <Text style={styles.tableCell}>{item.category}</Text>
                <Text
                  style={[
                    styles.tableCellRight,
                    { color: item.type === 'income' ? colors.primary[600] : colors.red[600] },
                  ]}
                >
                  {item.type === 'income' ? '+' : '-'} KES {formatNumber(item.amount)}
                </Text>
              </>
            )}
            {reportType === 'vaccination' && (
              <>
                <Text style={styles.tableCellBold}>{formatDate(item.date, 'date')}</Text>
                <Text style={styles.tableCell}>{item.animal?.tagId || '—'}</Text>
                <Text style={styles.tableCell}>{item.medication || '—'}</Text>
                <Text style={styles.tableCell}>
                  {item.nextCheckup ? formatDate(item.nextCheckup, 'date') : '—'}
                </Text>
              </>
            )}
            {reportType === 'inventory' && (
              <>
                <Text style={styles.tableCellBold}>{item.name}</Text>
                <Text style={styles.tableCell}>{item.category}</Text>
                <Text style={styles.tableCell}>{item.quantity} {item.unit}</Text>
                <Text style={styles.tableCellRight}>
                  {item.cost ? `KES ${formatNumber(item.cost)}` : '—'}
                </Text>
              </>
            )}
            {reportType === 'tasks' && (
              <>
                <Text style={styles.tableCellBold}>{item.title}</Text>
                <Text style={styles.tableCell}>{item.assignedTo?.name || '—'}</Text>
                <Text style={styles.tableCell}>{item.priority}</Text>
                <Text style={styles.tableCell}>
                  {item.dueDate ? formatDate(item.dueDate, 'date') : '—'}
                </Text>
              </>
            )}
          </View>
        ))}
      </Card>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Selectors */}
      <Select
        label="Farm"
        value={farmId}
        onChange={setFarmId}
        options={farms.map((f) => ({ value: f._id, label: f.name }))}
        placeholder="Select Farm"
      />
      <Select
        label="Report Type"
        value={reportType}
        onChange={setReportType}
        options={reportTypes.map((r) => ({ value: r.key, label: r.label }))}
        placeholder="Select Report Type"
      />
      <Select
        label="Period"
        value={period}
        onChange={setPeriod}
        options={periodOptions}
        placeholder="Select Period"
      />

      {!farmId ? (
        <EmptyState title="Select a farm and report type" />
      ) : loading ? (
        <Spinner size="lg" />
      ) : reportType !== 'general' && items.length === 0 ? (
        <EmptyState title="No data found" description="Try changing the filters." />
      ) : (
        <>
          {/* Report Header */}
          <View style={styles.reportHeader}>
            <Text style={styles.reportTitle}>
              {reportTypes.find((r) => r.key === reportType)?.label}
            </Text>
            <Text style={styles.reportFarm}>
              {farmName}{farmLocation ? ` — ${farmLocation}` : ''}
            </Text>
            <Text style={styles.reportDate}>
              {periodOptions.find((p) => p.value === period)?.label} • {formatDate(new Date(), 'date')}
            </Text>
          </View>

          {/* Summary Cards */}
          {renderSummaryCards()}

          {/* Table */}
          {renderTable()}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  reportHeader: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary[500],
    paddingBottom: spacing.md,
    gap: 2,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  reportFarm: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
  },
  reportDate: {
    fontSize: 12,
    color: colors.gray[500],
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: spacing.md,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary[600],
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.gray[500],
    textTransform: 'uppercase',
    marginTop: 2,
  },
  tableCard: {
    gap: 0,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    gap: spacing.xs,
  },
  tableCellBold: {
    flex: 2,
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray[900],
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    color: colors.gray[600],
    textAlign: 'center',
  },
  tableCellRight: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[900],
    textAlign: 'right',
  },
});