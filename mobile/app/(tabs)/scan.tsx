import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/contexts/AuthContext';
import { uploadImage, getFarms, getFields } from '@/api/api';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { CROP_TYPES } from '@/utils/config';
import { Ionicons } from '@expo/vector-icons';

export default function Scan() {
    const { user } = useAuth();
    const router = useRouter();
    const isFarmer = user?.role === 'farmer';

    const [image, setImage] = useState<any>(null);
    const [farmId, setFarmId] = useState('');
    const [fieldId, setFieldId] = useState('');
    const [cropType, setCropType] = useState('');
    const [farms, setFarms] = useState<any[]>([]);
    const [fields, setFields] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isFarmer) {
            getFarms().then((res) => setFarms(res.data.data.farms || []));
        } else if (user?.farm) {
            setFarmId(user.farm);
            setFarms([{ _id: user.farm, name: 'Assigned Farm' }]);
            getFields(user.farm).then((res) => setFields(res.data.data.fields || []));
        }
    }, [user]);

    const handleFarmChange = async (id: string) => {
        setFarmId(id);
        setFieldId('');
        if (id) {
            const res = await getFields(id);
            setFields(res.data.data.fields || []);
        }
    };

    const pickImage = async (useCamera: boolean) => {
        const result = useCamera
            ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
            : await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const handleUpload = async () => {
        if (!image) return;
        if (!fieldId) return;
        if (!cropType) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('cropImage', {
            uri: image.uri,
            type: 'image/jpeg',
            name: `crop_${Date.now()}.jpg`,
        } as any);
        formData.append('fieldId', fieldId);
        formData.append('cropType', cropType);

        try {
            const res = await uploadImage(formData);
            router.push(`/scan-result?id=${res.data.data.cropImage._id}`);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-4 space-y-4">
                <Text className="text-2xl font-bold text-gray-900">Scan Crop</Text>

                <Card>
                    <View className="space-y-4">
                        {isFarmer && (
                            <Select
                                label="Farm"
                                value={farmId}
                                onChange={handleFarmChange}
                                options={farms.map((f) => ({ value: f._id, label: f.name }))}
                            />
                        )}
                        <Select
                            label="Field"
                            value={fieldId}
                            onChange={setFieldId}
                            options={fields.map((f) => ({ value: f._id, label: f.name }))}
                        />
                        <Select
                            label="Crop Type"
                            value={cropType}
                            onChange={setCropType}
                            options={CROP_TYPES}
                        />
                    </View>
                </Card>

                <Card>
                    {image ? (
                        <View className="space-y-3">
                            <Image source={{ uri: image.uri }} className="w-full h-64 rounded-xl" />
                            <View className="flex-row gap-2">
                                <Button variant="outline" title="Remove" onPress={() => setImage(null)} style={{ flex: 1 }} />
                                <Button variant="outline" title="Change" onPress={() => pickImage(false)} style={{ flex: 1 }} />
                            </View>
                        </View>
                    ) : (
                        <View className="space-y-3">
                            <TouchableOpacity
                                onPress={() => pickImage(false)}
                                className="border-2 border-dashed border-gray-300 rounded-xl p-8 items-center"
                            >
                                <Ionicons name="image" size={48} color="#9ca3af" />
                                <Text className="text-gray-500 font-medium mt-2">Tap to select image</Text>
                                <Text className="text-sm text-gray-400 mt-1">JPG, PNG (max 10MB)</Text>
                            </TouchableOpacity>
                            <View className="flex-row gap-3">
                                <Button variant="outline" title="Gallery" onPress={() => pickImage(false)} style={{ flex: 1 }} />
                                <Button variant="outline" title="Camera" onPress={() => pickImage(true)} style={{ flex: 1 }} />
                            </View>
                        </View>
                    )}
                </Card>

                <Button
                    title={loading ? 'Analyzing...' : 'Upload & Analyze Crop'}
                    onPress={handleUpload}
                    loading={loading}
                    disabled={!image || !fieldId || !cropType}
                />
            </View>
        </ScrollView>
    );
}
