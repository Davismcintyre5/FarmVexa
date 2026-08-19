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
import { financeApi, stockApi, priceApi } from '../../api/axios';
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

export default function FinanceTab() {
  const { user } = useAuth();
  const { farms, activeFarm } = useFarms();
  const isFarmer = user?.role === 'farmer';

  const [farmId, setFarmId] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [prices, setPrices] = useState<any[]>([]);
  const [suggested, setSuggested] = useState<any[]>([]);
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [editingPrice, setEditingPrice] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [cartItem, setCartItem] = useState({
    product: '',
    quantity: '1',
    pricePerUnit: '',
    discount: '0',
  });
  const [expenseForm, setExpenseForm] = useState({
    category: 'inputs',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [priceForm, setPriceForm] = useState({
    product: '',
    category: 'animal',
    unit: '',
    pricePerUnit: '',
    quality: 'grade_a',
  });
  const [newPriceForm, setNewPriceForm] = useState({
    product: '',
    unit: '',
    category: '',
    quality: 'grade_a',
    pricePerUnit: '',
  });

  useEffect(() => {
    if (!isFarmer && user?.farm) {
      setFarmId(user.farm);
    } else if (isFarmer && farms.length > 0) {
      setFarmId(activeFarm?._id || farms[0]._id);
    }
  }, [user, farms, activeFarm]);

  useEffect(() => {
    if (farmId) {
      loadData();
    }
  }, [farmId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [transRes, summaryRes, stockRes, pricesRes, suggestedRes] = await Promise.all([
        financeApi.getTransactions(farmId).catch(() => ({ data: { data: { transactions: [] } } })),
        financeApi.getSummary(farmId, 'month').catch(() => ({ data: { data: { summary: null } } })),
        stockApi.getStock(farmId).catch(() => ({ data: { data: { items: [] } } })),
        priceApi.getPrices(farmId).catch(() => ({ data: { data: { prices: [] } } })),
        priceApi.getSuggestedProducts(farmId).catch(() => ({ data: { data: { suggested: [], existing: [] } } })),
      ]);
      setTransactions(transRes.data.data?.transactions || []);
      setSummary(summaryRes.data.data?.summary || null);
      setStock(stockRes.data.data?.items || []);
      setPrices(pricesRes.data.data?.prices || []);
      setSuggested(suggestedRes.data.data?.suggested || []);
    } catch (error) {
      setTransactions([]);
      setSummary(null);
      setStock([]);
      setPrices([]);
      setSuggested([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  // Cart handlers
  const handleCartProductChange = (productId: string) => {
    const item = stock.find((s) => s._id === productId);
    if (item) {
      setCartItem({
        ...cartItem,
        product: productId,
        pricePerUnit: item.pricePerUnit ? String(item.pricePerUnit) : '',
      });
    }
  };

  const addToCart = () => {
    const item = stock.find((s) => s._id === cartItem.product);
    if (!item) {
      Alert.alert('Error', 'Select a product');
      return;
    }
    const qty = Number(cartItem.quantity);
    if (!qty || qty <= 0) {
      Alert.alert('Error', 'Enter quantity');
      return;
    }
    if (qty > item.quantity) {
      Alert.alert('Error', `Only ${item.quantity} available`);
      return;
    }
    const ppu = Number(cartItem.pricePerUnit) || 0;
    const disc = Number(cartItem.discount) || 0;
    const total = ppu * qty - disc;

    const existing = cart.find((c) => c.productId === cartItem.product);
    if (existing) {
      const newQty = existing.quantity + qty;
      if (newQty > item.quantity) {
        Alert.alert('Error', `Only ${item.quantity} available (${existing.quantity} already in cart)`);
        return;
      }
      setCart(
        cart.map((c) =>
          c.productId === cartItem.product
            ? { ...c, quantity: newQty, total: ppu * newQty - (Number(c.discount) || 0) }
            : c
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: cartItem.product,
          product: item.product || item.name,
          unit: item.unit,
          quantity: qty,
          pricePerUnit: ppu,
          discount: disc,
          total: total > 0 ? total : 0,
        },
      ]);
    }
    setCartItem({ product: '', quantity: '1', pricePerUnit: '', discount: '0' });
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.total, 0);

  const handleSale = async () => {
    if (cart.length === 0) {
      Alert.alert('Error', 'Cart is empty');
      return;
    }

    try {
      const description = cart.map((c) => `${c.product} x${c.quantity} ${c.unit}`).join(', ');
      const totalDiscount = cart.reduce((s, c) => s + (Number(c.discount) || 0), 0);
      const desc = totalDiscount > 0 ? `${description} (disc: KES ${totalDiscount})` : description;

      await financeApi.addTransaction(farmId, {
        type: 'income',
        category: 'sales',
        amount: cartTotal,
        date: new Date().toISOString().split('T')[0],
        description: desc,
      });

      for (const c of cart) {
        await stockApi.stockOut(farmId, {
          product: c.product,
          unit: c.unit,
          quantity: c.quantity,
          reason: 'Sale',
        });
      }

      Alert.alert('Success', 'Sale recorded');
      setCart([]);
      await loadData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to record sale');
    }
  };

  // Expense handlers
  const handleExpense = async () => {
    if (!expenseForm.amount || Number(expenseForm.amount) <= 0) {
      Alert.alert('Error', 'Amount required');
      return;
    }

    try {
      await financeApi.addTransaction(farmId, {
        type: 'expense',
        ...expenseForm,
        amount: Number(expenseForm.amount),
      });
      Alert.alert('Success', 'Expense recorded');
      setShowExpenseModal(false);
      setExpenseForm({
        category: 'inputs',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
      await loadData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to record expense');
    }
  };

  // Price handlers
  const handleAddSuggested = (item: any) => {
    setNewPriceForm({
      product: item.product,
      unit: item.unit,
      category: item.category,
      quality: item.quality || 'grade_a',
      pricePerUnit: '',
    });
    setShowPriceModal(true);
  };

  const handleSetPrice = async () => {
    if (!newPriceForm.pricePerUnit || Number(newPriceForm.pricePerUnit) <= 0) {
      Alert.alert('Error', 'Enter valid price');
      return;
    }

    try {
      await priceApi.setPrice(farmId, {
        ...newPriceForm,
        pricePerUnit: Number(newPriceForm.pricePerUnit),
      });
      Alert.alert('Success', `Price set for ${newPriceForm.product}`);
      setShowPriceModal(false);
      const [pricesRes, suggestedRes] = await Promise.all([
        priceApi.getPrices(farmId),
        priceApi.getSuggestedProducts(farmId),
      ]);
      setPrices(pricesRes.data.data?.prices || []);
      setSuggested(suggestedRes.data.data?.suggested || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to set price');
    }
  };

  const handleEditPrice = (price: any) => {
    setEditingPrice(price);
    setPriceForm({
      product: price.product,
      category: price.category,
      unit: price.unit,
      pricePerUnit: String(price.pricePerUnit),
      quality: price.quality || 'grade_a',
    });
  };

  const handleUpdatePrice = async () => {
    if (!editingPrice) return;
    try {
      await priceApi.updatePrice(editingPrice._id, priceForm);
      Alert.alert('Success', 'Price updated');
      setEditingPrice(null);
      const res = await priceApi.getPrices(farmId);
      setPrices(res.data.data?.prices || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to update price');
    }
  };

  const handleDeletePrice = (id: string) => {
    Alert.alert('Delete Price', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await priceApi.deletePrice(id);
            setPrices((prev) => prev.filter((p) => p._id !== id));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete price');
          }
        },
      },
    ]);
  };

  // Transaction handlers
  const handleDeleteTransaction = (id: string) => {
    Alert.alert('Delete Transaction', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await financeApi.deleteTransaction(id);
            setTransactions((prev) => prev.filter((t) => t._id !== id));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  const expenseCategories = ['inputs', 'labour', 'vet', 'transport', 'equipment', 'other'].map((v) => ({
    value: v,
    label: v.charAt(0).toUpperCase() + v.slice(1),
  }));

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
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
        {farmId && (
          <TouchableOpacity
            style={styles.expenseButton}
            onPress={() => setShowExpenseModal(true)}
          >
            <Ionicons name="arrow-down" size={16} color={colors.red[500]} />
            <Text style={styles.expenseButtonText}>Expense</Text>
          </TouchableOpacity>
        )}
      </View>

      {!farmId ? (
        <EmptyState title="Select a farm" />
      ) : loading ? (
        <Spinner size="lg" />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Summary */}
          {summary && (
            <View style={styles.summaryGrid}>
              <Card style={styles.summaryCard}>
                <Text style={[styles.summaryValue, { color: colors.primary[600] }]}>
                  KES {formatNumber(summary.income || 0)}
                </Text>
                <Text style={styles.summaryLabel}>Income</Text>
              </Card>
              <Card style={styles.summaryCard}>
                <Text style={[styles.summaryValue, { color: colors.red[600] }]}>
                  KES {formatNumber(summary.expense || 0)}
                </Text>
                <Text style={styles.summaryLabel}>Expense</Text>
              </Card>
              <Card style={styles.summaryCard}>
                <Text style={[styles.summaryValue, { color: (summary.net || 0) >= 0 ? colors.primary[600] : colors.red[600] }]}>
                  KES {formatNumber(summary.net || 0)}
                </Text>
                <Text style={styles.summaryLabel}>Net</Text>
              </Card>
            </View>
          )}

          {/* Sale Cart */}
          <Card title="🛒 Sale Cart" style={styles.card}>
            <Select
              label="Product"
              value={cartItem.product}
              onChange={handleCartProductChange}
              options={stock.map((s) => ({
                value: s._id,
                label: `${s.product || s.name} (${s.quantity} ${s.unit} available)`,
              }))}
              placeholder="Select Product"
            />
            <View style={styles.row}>
              <View style={styles.flex1}>
                <Input
                  label="Qty"
                  value={cartItem.quantity}
                  onChangeText={(text) => setCartItem({ ...cartItem, quantity: text })}
                  placeholder="1"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.flex1}>
                <Input
                  label="Price (KES)"
                  value={cartItem.pricePerUnit}
                  onChangeText={(text) => setCartItem({ ...cartItem, pricePerUnit: text })}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.flex1}>
                <Input
                  label="Disc (KES)"
                  value={cartItem.discount}
                  onChangeText={(text) => setCartItem({ ...cartItem, discount: text })}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>
            <Button onPress={addToCart} variant="outline" fullWidth>
              <Ionicons name="add" size={16} color={colors.primary[500]} /> Add to Cart
            </Button>

            {cart.length > 0 && (
              <View style={styles.cartList}>
                {cart.map((item, index) => (
                  <View key={index} style={styles.cartItem}>
                    <View style={styles.cartItemInfo}>
                      <Text style={styles.cartItemName}>{item.product}</Text>
                      <Text style={styles.cartItemDetail}>
                        {item.quantity} {item.unit} x KES {formatNumber(item.pricePerUnit)}
                        {item.discount > 0 ? ` (−KES ${item.discount})` : ''}
                      </Text>
                    </View>
                    <View style={styles.cartItemActions}>
                      <Text style={styles.cartItemTotal}>KES {formatNumber(item.total)}</Text>
                      <TouchableOpacity onPress={() => removeFromCart(index)}>
                        <Ionicons name="close" size={16} color={colors.red[500]} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                <View style={styles.cartTotalRow}>
                  <Text style={styles.cartTotalLabel}>Total</Text>
                  <Text style={styles.cartTotalValue}>KES {formatNumber(cartTotal)}</Text>
                </View>
              </View>
            )}

            <Button onPress={handleSale} disabled={cart.length === 0} fullWidth size="lg">
              <Ionicons name="cart" size={18} color={colors.white} /> Complete Sale ({cart.length} items)
            </Button>
          </Card>

          {/* Pricing */}
          <Card title="🏷️ Pricing" style={styles.card}>
            {suggested.length > 0 && (
              <View style={styles.suggestedRow}>
                {suggested.map((item, index) => (
                  <TouchableOpacity
                    key={`${item.product}-${item.unit}-${index}`}
                    style={styles.suggestedBadge}
                    onPress={() => handleAddSuggested(item)}
                  >
                    <Text style={styles.suggestedText}>
                      + {item.product} ({item.unit})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {prices.length === 0 ? (
              <Text style={styles.emptyText}>No prices set</Text>
            ) : (
              <View style={styles.pricesList}>
                {prices.map((price) => (
                  <View key={price._id} style={styles.priceItem}>
                    <Text style={styles.priceProduct}>{price.product}</Text>
                    <Text style={styles.priceValue}>
                      KES {price.pricePerUnit}/{price.unit}
                    </Text>
                    <View style={styles.priceActions}>
                      <TouchableOpacity onPress={() => handleEditPrice(price)}>
                        <Ionicons name="pencil" size={14} color={colors.gray[400]} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeletePrice(price._id)}>
                        <Ionicons name="trash" size={14} color={colors.red[500]} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Card>

          {/* Recent Transactions */}
          {transactions.length > 0 && (
            <Card title="Recent Transactions" style={styles.card}>
              {transactions.slice(0, 30).map((transaction) => (
                <View key={transaction._id} style={styles.transactionItem}>
                  <View style={styles.transactionInfo}>
                    <View style={styles.transactionDotRow}>
                      <View
                        style={[
                          styles.transactionDot,
                          { backgroundColor: transaction.type === 'income' ? colors.primary[500] : colors.red[500] },
                        ]}
                      />
                      <Text style={styles.transactionDesc} numberOfLines={1}>
                        {transaction.description || transaction.category}
                      </Text>
                    </View>
                    <Text style={styles.transactionDate}>
                      {formatDate(transaction.date, 'date')}
                    </Text>
                  </View>
                  <View style={styles.transactionActions}>
                    <Text
                      style={[
                        styles.transactionAmount,
                        { color: transaction.type === 'income' ? colors.primary[600] : colors.red[600] },
                      ]}
                    >
                      {transaction.type === 'income' ? '+' : '-'} KES {formatNumber(transaction.amount)}
                    </Text>
                    <TouchableOpacity onPress={() => handleDeleteTransaction(transaction._id)}>
                      <Ionicons name="trash" size={14} color={colors.red[500]} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </Card>
          )}
        </ScrollView>
      )}

      {/* Expense Modal */}
      <Modal
        open={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        title="Add Expense"
        size="sm"
      >
        <View style={styles.modalContent}>
          <Select
            label="Category"
            value={expenseForm.category}
            onChange={(value) => setExpenseForm({ ...expenseForm, category: value })}
            options={expenseCategories}
            placeholder="Select Category"
          />
          <Input
            label="Amount (KES)"
            value={expenseForm.amount}
            onChangeText={(text) => setExpenseForm({ ...expenseForm, amount: text })}
            placeholder="0"
            keyboardType="numeric"
          />
          <Input
            label="Date"
            value={expenseForm.date}
            onChangeText={(text) => setExpenseForm({ ...expenseForm, date: text })}
            placeholder="YYYY-MM-DD"
          />
          <Input
            label="Description"
            value={expenseForm.description}
            onChangeText={(text) => setExpenseForm({ ...expenseForm, description: text })}
            placeholder="Description"
          />
          <Button onPress={handleExpense} fullWidth>
            Save Expense
          </Button>
        </View>
      </Modal>

      {/* Set Price Modal */}
      <Modal
        open={showPriceModal}
        onClose={() => setShowPriceModal(false)}
        title={`Set Price — ${newPriceForm.product}`}
        size="sm"
      >
        <View style={styles.modalContent}>
          <Text style={styles.priceModalInfo}>
            {newPriceForm.product} · {newPriceForm.unit} · {newPriceForm.quality}
          </Text>
          <Input
            label="Price per Unit (KES) *"
            value={newPriceForm.pricePerUnit}
            onChangeText={(text) => setNewPriceForm({ ...newPriceForm, pricePerUnit: text })}
            placeholder="0"
            keyboardType="numeric"
          />
          <Button onPress={handleSetPrice} fullWidth>
            Set Price
          </Button>
        </View>
      </Modal>

      {/* Edit Price Modal */}
      <Modal
        open={!!editingPrice}
        onClose={() => setEditingPrice(null)}
        title="Edit Price"
        size="sm"
      >
        <View style={styles.modalContent}>
          <Input
            label="Product"
            value={priceForm.product}
            onChangeText={(text) => setPriceForm({ ...priceForm, product: text })}
            editable={false}
          />
          <Input
            label="Price per Unit (KES)"
            value={priceForm.pricePerUnit}
            onChangeText={(text) => setPriceForm({ ...priceForm, pricePerUnit: text })}
            placeholder="0"
            keyboardType="numeric"
          />
          <Button onPress={handleUpdatePrice} fullWidth>
            Update
          </Button>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  flex1: {
    flex: 1,
  },
  expenseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.red[200],
    marginBottom: 1,
  },
  expenseButtonText: {
    fontSize: 14,
    color: colors.red[500],
    fontWeight: '600',
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.gray[500],
    marginTop: 2,
  },
  card: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cartList: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  cartItemInfo: {
    flex: 1,
    gap: 2,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
  },
  cartItemDetail: {
    fontSize: 12,
    color: colors.gray[500],
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cartItemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  cartTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.primary[50],
  },
  cartTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  cartTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary[600],
  },
  suggestedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  suggestedBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  suggestedText: {
    fontSize: 11,
    color: colors.primary[600],
    fontWeight: '500',
  },
  pricesList: {
    gap: spacing.xs,
  },
  priceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  priceProduct: {
    flex: 1,
    fontSize: 13,
    color: colors.gray[900],
    textTransform: 'capitalize',
  },
  priceValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray[700],
  },
  priceActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginLeft: spacing.sm,
  },
  emptyText: {
    fontSize: 13,
    color: colors.gray[400],
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  transactionInfo: {
    flex: 1,
    gap: 2,
  },
  transactionDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  transactionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  transactionDesc: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[900],
    flex: 1,
  },
  transactionDate: {
    fontSize: 11,
    color: colors.gray[400],
  },
  transactionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalContent: {
    gap: spacing.md,
  },
  priceModalInfo: {
    fontSize: 14,
    color: colors.gray[600],
    textTransform: 'capitalize',
  },
});