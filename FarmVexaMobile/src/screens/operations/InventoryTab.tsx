import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useFarms } from '../../hooks/useFarms';
import { stockApi, inventoryApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDate, formatNumber } from '../../utils/formatters';

export default function InventoryTab({ readOnly = false }: { readOnly?: boolean }) {
  const { user } = useAuth();
  const { farms } = useFarms();
  const isFarmer = user?.role === 'farmer';

  const [farmId, setFarmId] = useState('');
  const [view, setView] = useState<'stock' | 'inventory'>('stock');
  const [items, setItems] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [stockQtyModal, setStockQtyModal] = useState<any>(null);
  const [stockQty, setStockQty] = useState('');
  const [stockDir, setStockDir] = useState<'in' | 'out'>('in');
  const [movementsModal, setMovementsModal] = useState<any>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [form, setForm] = useState({
    product: '',
    unit: 'piece',
    quantity: '',
    pricePerUnit: '',
    minimumStock: '',
    reason: '',
  });
  const [invForm, setInvForm] = useState({
    name: '',
    category: 'feed',
    quantity: '',
    unit: 'kg',
    purchaseDate: '',
    expiryDate: '',
    cost: '',
    supplier: '',
    lowStockAlert: '',
  });

  useEffect(() => {
    if (!isFarmer && user?.farm) {
      setFarmId(user.farm);
    }
  }, [user]);

  useEffect(() => {
    if (farmId) {
      loadData();
    }
  }, [farmId, view]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (view === 'stock') {
        const res = await stockApi.getStock(farmId);
        setItems(res.data.data?.items || []);
        setLowStock(res.data.data?.lowStock || []);
      } else {
        const res = await inventoryApi.getInventory(farmId);
        setItems(res.data.data?.items || []);
        setLowStock(res.data.data?.lowStock || []);
      }
    } catch (error) {
      setItems([]);
      setLowStock([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const openAdd = () => {
    setEditing(null);
    if (view === 'stock') {
      setForm({ product: '', unit: 'piece', quantity: '', pricePerUnit: '', minimumStock: '', reason: '' });
    } else {
      setInvForm({ name: '', category: 'feed', quantity: '', unit: 'kg', purchaseDate: '', expiryDate: '', cost: '', supplier: '', lowStockAlert: '' });
    }
    setShowModal(true);
  };

  const openEdit = (item: any) => {
    setEditing(item);
    if (view === 'stock') {
      setForm({
        product: item.product || item.name,
        unit: item.unit,
        quantity: String(item.quantity || ''),
        pricePerUnit: item.pricePerUnit ? String(item.pricePerUnit) : '',
        minimumStock: item.minimumStock ? String(item.minimumStock) : '',
        reason: '',
      });
    } else {
      setInvForm({
        name: item.name,
        category: item.category,
        quantity: String(item.quantity || ''),
        unit: item.unit,
        purchaseDate: item.purchaseDate?.split('T')[0] || '',
        expiryDate: item.expiryDate?.split('T')[0] || '',
        cost: item.cost ? String(item.cost) : '',
        supplier: item.supplier || '',
        lowStockAlert: item.lowStockAlert ? String(item.lowStockAlert) : '',
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (view === 'stock') {
        if (!form.product) {
          Alert.alert('Error', 'Product required');
          return;
        }
        if (editing) {
          await stockApi.updateStock(editing._id, {
            product: form.product,
            unit: form.unit,
            minimumStock: Number(form.minimumStock) || 0,
            pricePerUnit: Number(form.pricePerUnit) || 0,
          });
          Alert.alert('Success', 'Stock updated');
        } else {
          await stockApi.stockIn(farmId, {
            product: form.product,
            unit: form.unit,
            quantity: Number(form.quantity) || 0,
            pricePerUnit: Number(form.pricePerUnit) || 0,
            reason: form.reason || 'Manual',
          });
          Alert.alert('Success', 'Stock added');
        }
      } else {
        if (!invForm.name) {
          Alert.alert('Error', 'Name required');
          return;
        }
        if (editing) {
          await inventoryApi.updateItem(editing._id, invForm);
          Alert.alert('Success', 'Item updated');
        } else {
          await inventoryApi.addItem(farmId, {
            ...invForm,
            quantity: Number(invForm.quantity),
            cost: Number(invForm.cost),
            lowStockAlert: Number(invForm.lowStockAlert),
          });
          Alert.alert('Success', 'Item added');
        }
      }
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save');
    }
  };

  const handleStockMove = async () => {
    const qty = Number(stockQty);
    if (!qty || qty <= 0) {
      Alert.alert('Error', 'Enter valid quantity');
      return;
    }

    try {
      if (stockDir === 'in') {
        await stockApi.stockIn(farmId, {
          product: stockQtyModal.product || stockQtyModal.name,
          unit: stockQtyModal.unit,
          quantity: qty,
          reason: 'Adjustment',
        });
      } else {
        await stockApi.stockOut(farmId, {
          product: stockQtyModal.product || stockQtyModal.name,
          unit: stockQtyModal.unit,
          quantity: qty,
          reason: 'Adjustment',
        });
      }
      Alert.alert('Success', 'Stock updated');
      setStockQtyModal(null);
      await loadData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed');
    }
  };

  const openMovements = async (item: any) => {
    setMovementsModal(item);
    try {
      const res = await stockApi.getStockMovements(item._id);
      setMovements(res.data.data?.movements || []);
    } catch (error) {
      setMovements([]);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Item', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            if (view === 'stock') {
              await stockApi.deleteStock(id);
            } else {
              await inventoryApi.deleteItem(id);
            }
            setItems((prev) => prev.filter((i) => i._id !== id));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  const isStock = view === 'stock';
  const categories = ['feed', 'medicine', 'fertilizer', 'pesticide', 'seeds', 'tools', 'other'].map((v) => ({
    value: v,
    label: v.charAt(0).toUpperCase() + v.slice(1),
  }));

  return (
    <View style={styles.container}>
      {/* Farm + View Selectors */}
      <View style={styles.selectorRow}>
        {isFarmer && (
          <View style={styles.flex1}>
            <Select
              label="Farm"
              value={farmId}
              onChange={setFarmId}
              options={farms.map((f) => ({ value: f._id, label: f.name }))}
              placeholder="Select Farm"
            />
          </View>
        )}
        <View style={styles.flex1}>
          <Select
            label="View"
            value={view}
            onChange={(value) => setView(value as 'stock' | 'inventory')}
            options={[
              { value: 'stock', label: '📦 Prod Stock' },
              { value: 'inventory', label: '🏗️ Inventory' },
            ]}
            placeholder="Select View"
          />
        </View>
      </View>

      {/* Add Button */}
      {!readOnly && farmId && (
        <View style={styles.addButton}>
          <Button onPress={openAdd} size="sm">
            <Ionicons name="add" size={18} color={colors.white} /> Add {isStock ? 'Stock' : 'Item'}
          </Button>
        </View>
      )}

      {!farmId ? (
        <EmptyState title="Select a farm" />
      ) : loading ? (
        <Spinner size="lg" />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Low Stock Alerts */}
          {lowStock.length > 0 && (
            <Card title="⚠️ Low Stock" style={styles.card}>
              {lowStock.map((item) => (
                <Text key={item._id} style={styles.lowStockText}>
                  {isStock ? item.product : item.name}: {item.quantity} {item.unit} remaining
                </Text>
              ))}
            </Card>
          )}

          {/* Items Grid */}
          {items.length === 0 ? (
            <EmptyState title={`No ${isStock ? 'stock' : 'inventory'} items`} />
          ) : (
            <View style={styles.itemsList}>
              {items.map((item) => (
                <Card key={item._id} style={styles.itemCard}>
                  <Text style={styles.itemName}>{isStock ? item.product : item.name}</Text>
                  <Text style={styles.itemDetail}>
                    {item.quantity} {item.unit}
                    {(item.pricePerUnit || item.cost) ? ` · KES ${formatNumber(item.pricePerUnit || item.cost)}/${item.unit}` : ''}
                  </Text>
                  {!isStock && item.expiryDate && (
                    <Text style={styles.itemExpiry}>
                      Expires: {formatDate(item.expiryDate, 'date')}
                    </Text>
                  )}
                  {isStock && (
                    <Text style={styles.itemValue}>
                      Value: KES {formatNumber((item.quantity || 0) * (item.pricePerUnit || 0))}
                    </Text>
                  )}

                  {!readOnly && (
                    <View style={styles.itemActions}>
                      {isStock && (
                        <>
                          <TouchableOpacity onPress={() => { setStockQtyModal(item); setStockQty(''); setStockDir('in'); }}>
                            <Ionicons name="arrow-down" size={16} color={colors.primary[500]} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => { setStockQtyModal(item); setStockQty(''); setStockDir('out'); }}>
                            <Ionicons name="arrow-up" size={16} color={colors.red[500]} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => openMovements(item)}>
                            <Ionicons name="time" size={16} color={colors.blue[500]} />
                          </TouchableOpacity>
                        </>
                      )}
                      <TouchableOpacity onPress={() => openEdit(item)}>
                        <Ionicons name="pencil" size={16} color={colors.gray[400]} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteButton}>
                        <Ionicons name="trash" size={16} color={colors.red[500]} />
                      </TouchableOpacity>
                    </View>
                  )}
                </Card>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Add/Edit Modal */}
      {!readOnly && (
        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          title={editing ? 'Edit' : `Add ${isStock ? 'Stock' : 'Item'}`}
          size="lg"
        >
          <ScrollView contentContainerStyle={styles.modalContent}>
            {isStock ? (
              <>
                <Input
                  label="Product *"
                  value={form.product}
                  onChangeText={(text) => setForm({ ...form, product: text })}
                  placeholder="e.g., Milk"
                />
                <Input
                  label="Unit"
                  value={form.unit}
                  onChangeText={(text) => setForm({ ...form, unit: text })}
                  placeholder="e.g., litre"
                />
                {!editing && (
                  <Input
                    label="Quantity"
                    value={form.quantity}
                    onChangeText={(text) => setForm({ ...form, quantity: text })}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                )}
                <Input
                  label="Price/Unit (KES)"
                  value={form.pricePerUnit}
                  onChangeText={(text) => setForm({ ...form, pricePerUnit: text })}
                  placeholder="0"
                  keyboardType="numeric"
                />
                <Input
                  label="Min Stock Alert"
                  value={form.minimumStock}
                  onChangeText={(text) => setForm({ ...form, minimumStock: text })}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </>
            ) : (
              <>
                <Input
                  label="Name *"
                  value={invForm.name}
                  onChangeText={(text) => setInvForm({ ...invForm, name: text })}
                  placeholder="e.g., Feed"
                />
                <Select
                  label="Category"
                  value={invForm.category}
                  onChange={(value) => setInvForm({ ...invForm, category: value })}
                  options={categories}
                  placeholder="Select Category"
                />
                <View style={styles.row}>
                  <View style={styles.flex1}>
                    <Input
                      label="Quantity"
                      value={invForm.quantity}
                      onChangeText={(text) => setInvForm({ ...invForm, quantity: text })}
                      placeholder="0"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.flex1}>
                    <Input
                      label="Unit"
                      value={invForm.unit}
                      onChangeText={(text) => setInvForm({ ...invForm, unit: text })}
                      placeholder="kg"
                    />
                  </View>
                </View>
                <Input
                  label="Cost (KES)"
                  value={invForm.cost}
                  onChangeText={(text) => setInvForm({ ...invForm, cost: text })}
                  placeholder="0"
                  keyboardType="numeric"
                />
                <Input
                  label="Supplier"
                  value={invForm.supplier}
                  onChangeText={(text) => setInvForm({ ...invForm, supplier: text })}
                  placeholder="Supplier name"
                />
                <Input
                  label="Low Stock Alert"
                  value={invForm.lowStockAlert}
                  onChangeText={(text) => setInvForm({ ...invForm, lowStockAlert: text })}
                  placeholder="0"
                  keyboardType="numeric"
                />
                <Input
                  label="Purchase Date"
                  value={invForm.purchaseDate}
                  onChangeText={(text) => setInvForm({ ...invForm, purchaseDate: text })}
                  placeholder="YYYY-MM-DD"
                />
                <Input
                  label="Expiry Date"
                  value={invForm.expiryDate}
                  onChangeText={(text) => setInvForm({ ...invForm, expiryDate: text })}
                  placeholder="YYYY-MM-DD"
                />
              </>
            )}

            <View style={styles.modalActions}>
              <Button variant="outline" onPress={() => setShowModal(false)} style={styles.flex1}>
                Cancel
              </Button>
              <Button onPress={handleSave} style={styles.flex1}>
                {editing ? 'Update' : 'Add'}
              </Button>
            </View>
          </ScrollView>
        </Modal>
      )}

      {/* Stock In/Out Modal */}
      <Modal
        open={!!stockQtyModal}
        onClose={() => setStockQtyModal(null)}
        title={`${stockDir === 'in' ? 'Stock In' : 'Stock Out'} — ${stockQtyModal?.product || stockQtyModal?.name}`}
        size="sm"
      >
        <View style={styles.modalContent}>
          <Text style={styles.stockCurrent}>
            Current: {stockQtyModal?.quantity} {stockQtyModal?.unit}
          </Text>
          <Input
            label="Quantity"
            value={stockQty}
            onChangeText={setStockQty}
            placeholder="0"
            keyboardType="numeric"
          />
          <Button onPress={handleStockMove} fullWidth>
            {stockDir === 'in' ? 'Add Stock' : 'Remove Stock'}
          </Button>
        </View>
      </Modal>

      {/* Movements Modal */}
      <Modal
        open={!!movementsModal}
        onClose={() => setMovementsModal(null)}
        title={`Movements — ${movementsModal?.product || movementsModal?.name}`}
        size="md"
      >
        <View style={styles.modalContent}>
          {movements.length === 0 ? (
            <Text style={styles.emptyMovements}>No movements</Text>
          ) : (
            <View style={styles.movementsList}>
              {movements.map((movement: any, index: number) => (
                <View key={index} style={styles.movementItem}>
                  <Text style={styles.movementDate}>
                    {formatDate(movement.date, 'date')}
                  </Text>
                  <Text style={[styles.movementType, { color: movement.type === 'in' ? colors.primary[600] : colors.red[600] }]}>
                    {movement.type === 'in' ? '+' : '-'}
                  </Text>
                  <Text style={styles.movementQty}>{movement.quantity}</Text>
                  <Text style={styles.movementReason}>{movement.reason || '—'}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.md,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  flex1: {
    flex: 1,
  },
  addButton: {
    paddingHorizontal: spacing.md,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  card: {
    gap: spacing.sm,
  },
  lowStockText: {
    fontSize: 13,
    color: colors.orange[600],
  },
  itemsList: {
    gap: spacing.sm,
  },
  itemCard: {
    gap: spacing.xs,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  itemDetail: {
    fontSize: 13,
    color: colors.gray[500],
  },
  itemExpiry: {
    fontSize: 11,
    color: colors.gray[400],
  },
  itemValue: {
    fontSize: 11,
    color: colors.gray[400],
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  deleteButton: {
    marginLeft: 'auto',
  },
  modalContent: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stockCurrent: {
    fontSize: 14,
    color: colors.gray[500],
  },
  emptyMovements: {
    fontSize: 14,
    color: colors.gray[400],
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  movementsList: {
    gap: spacing.xs,
  },
  movementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  movementDate: {
    flex: 1,
    fontSize: 12,
    color: colors.gray[500],
  },
  movementType: {
    width: 30,
    fontSize: 14,
    fontWeight: 'bold',
  },
  movementQty: {
    width: 50,
    fontSize: 14,
    color: colors.gray[900],
  },
  movementReason: {
    flex: 1,
    fontSize: 12,
    color: colors.gray[400],
  },
});