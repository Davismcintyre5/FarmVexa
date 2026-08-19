import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useFarms } from '../../hooks/useFarms';
import { marketApi, publicApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { useCamera } from '../../hooks/useCamera';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { PRODUCT_CATEGORIES } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

export default function MarketTab() {
  const { user } = useAuth();
  const { farms } = useFarms();
  const { pickMultipleImages } = useCamera();
  const isFarmer = user?.role === 'farmer';

  const [enabled, setEnabled] = useState(true);
  const [supportPhone, setSupportPhone] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [unreadInquiries, setUnreadInquiries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [photoFiles, setPhotoFiles] = useState<any[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'vegetables',
    price: '',
    unit: 'kg',
    quantity: '',
    contactPhone: '',
    contactWhatsapp: '',
    contactEmail: '',
    exactDirection: '',
    farm: '',
    photos: [],
    status: 'active',
  });

  useEffect(() => {
    loadSettings();
    loadData();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await publicApi.getPublicSettings();
      setSupportPhone(res.data.data?.supportPhone || '');
    } catch (error) {
      setSupportPhone('');
    }
  };

  const loadData = async () => {
    try {
      const [statusRes, productsRes, inquiriesRes] = await Promise.all([
        marketApi.getMarketStatus(),
        marketApi.getMyProducts(),
        marketApi.getInquiries(),
      ]);
      setEnabled(statusRes.data.data?.enabled !== false);
      setProducts(productsRes.data.data?.products || []);
      setInquiries(inquiriesRes.data.data?.inquiries || []);
      setUnreadInquiries(productsRes.data.data?.unreadInquiries || 0);
    } catch (error) {
      setProducts([]);
      setInquiries([]);
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
    setPhotoFiles([]);
    setPhotoPreviews([]);
    setForm({
      name: '',
      description: '',
      category: 'vegetables',
      price: '',
      unit: 'kg',
      quantity: '',
      contactPhone: user?.phone || '',
      contactWhatsapp: '',
      contactEmail: user?.email || '',
      exactDirection: '',
      farm: farms[0]?._id || '',
      photos: [],
      status: 'active',
    });
    setShowModal(true);
  };

  const openEdit = (product: any) => {
    setEditing(product);
    setPhotoFiles([]);
    setPhotoPreviews([]);
    setForm({
      name: product.name,
      description: product.description || '',
      category: product.category,
      price: String(product.price),
      unit: product.unit,
      quantity: String(product.quantity),
      contactPhone: product.contactPhone || '',
      contactWhatsapp: product.contactWhatsapp || '',
      contactEmail: product.contactEmail || '',
      exactDirection: product.location?.exactDirection || '',
      farm: product.farm?._id || product.farm || '',
      photos: product.photos || [],
      status: product.status,
    });
    setShowModal(true);
  };

  const handlePhotoSelect = async () => {
    const remaining = 5 - (form.photos?.length || 0) - photoFiles.length;
    if (remaining <= 0) return;
    
    const images = await pickMultipleImages(remaining);
    if (images.length > 0) {
      setPhotoFiles((prev) => [...prev, ...images]);
      setPhotoPreviews((prev) => [...prev, ...images.map((img) => img.uri)]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingPhoto = (index: number) => {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const uploadPhotos = async () => {
    if (photoFiles.length === 0) return [];
    const uploadedUrls: string[] = [];
    
    for (const file of photoFiles) {
      try {
        const formData = new FormData();
        formData.append('image', {
          uri: file.uri,
          name: `product_${Date.now()}.jpg`,
          type: 'image/jpeg',
        } as any);
        const res = await marketApi.uploadImage(formData);
        if (res.data?.data?.url) {
          uploadedUrls.push(res.data.data.url);
        }
      } catch (error) {
        // Silently fail for individual photos
      }
    }
    return uploadedUrls;
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.unit || !form.quantity || !form.farm) {
      Alert.alert('Error', 'Name, price, unit, quantity, and farm are required');
      return;
    }

    try {
      const uploadedPhotos = await uploadPhotos();
      const finalForm = {
        ...form,
        photos: [...(form.photos || []), ...uploadedPhotos],
      };

      if (editing) {
        await marketApi.updateProduct(editing._id, finalForm);
        Alert.alert('Success', 'Product updated');
      } else {
        await marketApi.addProduct(finalForm);
        Alert.alert('Success', 'Product added to market');
      }

      setShowModal(false);
      setPhotoFiles([]);
      setPhotoPreviews([]);
      await loadData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await marketApi.updateProductStatus(id, status);
      await loadData();
      Alert.alert('Success', `Product marked as ${status}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remove Product', 'Remove this product from market?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await marketApi.deleteProduct(id);
            await loadData();
            Alert.alert('Success', 'Product removed');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete product');
          }
        },
      },
    ]);
  };

  const handleMarkRead = async (id: string) => {
    try {
      await marketApi.markInquiryRead(id);
      await loadData();
    } catch (error) {
      // Silently fail
    }
  };

  const handleDeleteInquiry = (id: string) => {
    Alert.alert('Delete Inquiry', 'Delete this inquiry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await marketApi.deleteInquiry(id);
            await loadData();
            Alert.alert('Success', 'Inquiry deleted');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete inquiry');
          }
        },
      },
    ]);
  };

  if (loading) {
    return <Spinner size="lg" />;
  }

  if (!enabled) {
    return (
      <View style={styles.disabledContainer}>
        <Ionicons name="storefront" size={64} color={colors.gray[300]} />
        <Text style={styles.disabledTitle}>Market is currently disabled</Text>
        <Text style={styles.disabledText}>
          The farmers market has been temporarily disabled by the administrator.
          Please check back later.
        </Text>
        {supportPhone && (
          <Text style={styles.supportText}>
            For urgent matters, contact support: {supportPhone}
          </Text>
        )}
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🧺 My Market Products</Text>
          <Text style={styles.subtitle}>{products.length} products listed</Text>
        </View>
        {isFarmer && (
          <Button onPress={openAdd} size="sm">
            <Ionicons name="add" size={18} color={colors.white} /> Add Product
          </Button>
        )}
      </View>

      {/* Products */}
      {products.length === 0 ? (
        <EmptyState
          icon="storefront-outline"
          title="No products yet"
          description="Add your farm products to the public market."
          actionLabel={isFarmer ? 'Add Product' : undefined}
          onAction={isFarmer ? openAdd : undefined}
        />
      ) : (
        <View style={styles.productsList}>
          {products.map((product) => (
            <Card key={product._id} style={styles.productCard}>
              {product.photos?.[0] && (
                <Image
                  source={{ uri: product.photos[0] }}
                  style={styles.productImage}
                />
              )}
              <View style={styles.productHeader}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={styles.productCategory}>{product.category}</Text>
                  <Text style={styles.productPrice}>
                    KES {product.price}/{product.unit}
                  </Text>
                  <Text style={styles.productQuantity}>
                    {product.quantity} {product.unit} available
                  </Text>
                  {product.location?.county && (
                    <Text style={styles.productLocation}>
                      📍 {product.location.county}, {product.location.subCounty}
                    </Text>
                  )}
                </View>
                <Badge status={product.status} />
              </View>

              <View style={styles.productActions}>
                {product.status === 'active' && (
                  <>
                    <TouchableOpacity onPress={() => handleStatusChange(product._id, 'sold')}>
                      <Text style={styles.soldText}>Mark Sold</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleStatusChange(product._id, 'inactive')}>
                      <Text style={styles.deactivateText}>Deactivate</Text>
                    </TouchableOpacity>
                  </>
                )}
                {(product.status === 'sold' || product.status === 'inactive') && (
                  <TouchableOpacity onPress={() => handleStatusChange(product._id, 'active')}>
                    <Text style={styles.activateText}>Activate</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => openEdit(product)}>
                  <Ionicons name="pencil" size={16} color={colors.gray[400]} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(product._id)} style={styles.deleteButton}>
                  <Ionicons name="trash" size={16} color={colors.red[500]} />
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Inquiries */}
      <View style={styles.inquiriesSection}>
        <Text style={styles.inquiriesTitle}>
          📥 Inquiries{' '}
          {unreadInquiries > 0 && (
            <Text style={styles.unreadBadge}>({unreadInquiries} unread)</Text>
          )}
        </Text>

        {inquiries.length === 0 ? (
          <Text style={styles.emptyInquiries}>No inquiries yet.</Text>
        ) : (
          <View style={styles.inquiriesList}>
            {inquiries.map((inquiry) => (
              <Card
                key={inquiry._id}
                style={[
                  styles.inquiryCard,
                  !inquiry.isRead && styles.inquiryUnread,
                ]}
              >
                <View style={styles.inquiryHeader}>
                  <View style={styles.inquiryInfo}>
                    <Text style={styles.inquiryBuyer}>
                      {inquiry.buyerName}{' '}
                      <Text style={styles.inquiryProduct}>→ {inquiry.product?.name}</Text>
                    </Text>
                    <Text style={styles.inquiryMessage}>{inquiry.message}</Text>
                    {inquiry.buyerPhone && (
                      <Text style={styles.inquiryDetail}>📞 {inquiry.buyerPhone}</Text>
                    )}
                    {inquiry.buyerEmail && (
                      <Text style={styles.inquiryDetail}>📧 {inquiry.buyerEmail}</Text>
                    )}
                    <Text style={styles.inquiryDate}>
                      {formatDate(inquiry.createdAt, 'relative')}
                    </Text>
                  </View>
                  <View style={styles.inquiryActions}>
                    {!inquiry.isRead && (
                      <TouchableOpacity onPress={() => handleMarkRead(inquiry._id)}>
                        <Text style={styles.markReadText}>Mark read</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => handleDeleteInquiry(inquiry._id)}>
                      <Ionicons name="trash" size={16} color={colors.red[500]} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>

      {/* Add/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Product' : 'Add Product to Market'}
        size="lg"
      >
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Input
            label="Product Name *"
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
            placeholder="Tomatoes, Eggs, Milk..."
          />
          <Select
            label="Category"
            value={form.category}
            onChange={(value) => setForm({ ...form, category: value })}
            options={PRODUCT_CATEGORIES}
            placeholder="Select Category"
          />
          <Input
            label="Description"
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
            placeholder="Product description"
            multiline
          />
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Input
                label="Price (KES) *"
                value={form.price}
                onChangeText={(text) => setForm({ ...form, price: text })}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.flex1}>
              <Input
                label="Unit *"
                value={form.unit}
                onChangeText={(text) => setForm({ ...form, unit: text })}
                placeholder="kg, piece..."
              />
            </View>
            <View style={styles.flex1}>
              <Input
                label="Quantity *"
                value={form.quantity}
                onChangeText={(text) => setForm({ ...form, quantity: text })}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Photo Upload */}
          <View style={styles.photoSection}>
            <Text style={styles.photoLabel}>Product Photos (up to 5)</Text>
            <View style={styles.photoGrid}>
              {(form.photos || []).map((photo: string, i: number) => (
                <View key={`existing-${i}`} style={styles.photoItem}>
                  <Image source={{ uri: photo }} style={styles.photo} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removeExistingPhoto(i)}
                  >
                    <Ionicons name="close" size={14} color={colors.white} />
                  </TouchableOpacity>
                </View>
              ))}
              {photoPreviews.map((preview, i) => (
                <View key={`new-${i}`} style={styles.photoItem}>
                  <Image source={{ uri: preview }} style={styles.photo} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(i)}
                  >
                    <Ionicons name="close" size={14} color={colors.white} />
                  </TouchableOpacity>
                </View>
              ))}
              {(form.photos?.length || 0) + photoPreviews.length < 5 && (
                <TouchableOpacity style={styles.addPhotoButton} onPress={handlePhotoSelect}>
                  <Ionicons name="camera" size={24} color={colors.gray[400]} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Input
                label="Contact Phone"
                value={form.contactPhone}
                onChangeText={(text) => setForm({ ...form, contactPhone: text })}
                placeholder="+254 700 000 000"
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.flex1}>
              <Input
                label="WhatsApp"
                value={form.contactWhatsapp}
                onChangeText={(text) => setForm({ ...form, contactWhatsapp: text })}
                placeholder="+254 700 000 000"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <Input
            label="Contact Email"
            value={form.contactEmail}
            onChangeText={(text) => setForm({ ...form, contactEmail: text })}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Select
            label="Farm *"
            value={form.farm}
            onChange={(value) => setForm({ ...form, farm: value })}
            options={farms.map((f) => ({ value: f._id, label: f.name }))}
            placeholder="Select Farm"
          />

          <Input
            label="Exact Direction"
            value={form.exactDirection}
            onChangeText={(text) => setForm({ ...form, exactDirection: text })}
            placeholder="Near Total Petrol Station..."
          />

          <View style={styles.modalActions}>
            <Button variant="outline" onPress={() => setShowModal(false)} style={styles.flex1}>
              Cancel
            </Button>
            <Button onPress={handleSave} style={styles.flex1}>
              {editing ? 'Update' : 'Add Product'}
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  subtitle: {
    fontSize: 13,
    color: colors.gray[500],
  },
  productsList: {
    gap: spacing.md,
  },
  productCard: {
    gap: spacing.sm,
  },
  productImage: {
    width: '100%',
    height: 140,
    borderRadius: borderRadius.md,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productInfo: {
    flex: 1,
    gap: 2,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  productCategory: {
    fontSize: 12,
    color: colors.gray[500],
    textTransform: 'capitalize',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[600],
  },
  productQuantity: {
    fontSize: 12,
    color: colors.gray[500],
  },
  productLocation: {
    fontSize: 11,
    color: colors.gray[400],
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    flexWrap: 'wrap',
  },
  soldText: {
    fontSize: 12,
    color: colors.yellow[600],
  },
  deactivateText: {
    fontSize: 12,
    color: colors.gray[400],
  },
  activateText: {
    fontSize: 12,
    color: colors.primary[500],
  },
  deleteButton: {
    marginLeft: 'auto',
  },
  inquiriesSection: {
    gap: spacing.sm,
  },
  inquiriesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  unreadBadge: {
    fontSize: 14,
    color: colors.red[500],
  },
  emptyInquiries: {
    fontSize: 14,
    color: colors.gray[400],
  },
  inquiriesList: {
    gap: spacing.sm,
  },
  inquiryCard: {
    gap: spacing.sm,
  },
  inquiryUnread: {
    borderLeftWidth: 4,
    borderLeftColor: colors.blue[500],
  },
  inquiryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  inquiryInfo: {
    flex: 1,
    gap: 2,
  },
  inquiryBuyer: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
  },
  inquiryProduct: {
    fontSize: 12,
    color: colors.gray[500],
  },
  inquiryMessage: {
    fontSize: 13,
    color: colors.gray[600],
  },
  inquiryDetail: {
    fontSize: 12,
    color: colors.gray[500],
  },
  inquiryDate: {
    fontSize: 11,
    color: colors.gray[400],
  },
  inquiryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  markReadText: {
    fontSize: 12,
    color: colors.primary[500],
  },
  modalContent: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  photoSection: {
    gap: spacing.sm,
  },
  photoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  photoItem: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 2,
  },
  addPhotoButton: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.gray[300],
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  disabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.gray[50],
  },
  disabledTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  disabledText: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
  supportText: {
    fontSize: 14,
    color: colors.gray[400],
  },
});