import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { validateRegister } from '@/utils/validators';
import { Ionicons } from '@expo/vector-icons';

export default function Register() {
    const { register } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        county: '',
        role: 'farmer',
    });
    const [errors, setErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<any>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async () => {
        const v = validateRegister(form);
        if (Object.keys(v).length > 0) { setErrors(v); return; }
        setLoading(true);
        setAlert(null);
        try {
            const res = await register({
                name: form.name,
                email: form.email,
                phone: form.phone,
                password: form.password,
                county: form.county,
                role: form.role,
            });
            setAlert({ type: 'success', message: res.message || 'Registration successful! Please login.' });
            setTimeout(() => router.replace('/(auth)/login'), 2000);
        } catch (err: any) {
            setAlert({ type: 'error', message: err.response?.data?.message || 'Registration failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="p-6 pt-16">
                <TouchableOpacity onPress={() => router.back()} className="mb-4">
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>

                <Text className="text-2xl font-bold text-gray-900 text-center mb-6">Create Account</Text>

                {alert && (
                    <View className={`${alert.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-xl p-3 mb-4`}>
                        <Text className={`${alert.type === 'success' ? 'text-green-600' : 'text-red-600'} text-sm`}>{alert.message}</Text>
                    </View>
                )}

                <View className="space-y-4">
                    <Input
                        label="Full Name"
                        value={form.name}
                        onChangeText={(text) => { setForm({ ...form, name: text }); setErrors({ ...errors, name: '' }); }}
                        placeholder="John Doe"
                        error={errors.name}
                    />
                    <Input
                        label="Email"
                        value={form.email}
                        onChangeText={(text) => { setForm({ ...form, email: text }); setErrors({ ...errors, email: '' }); }}
                        placeholder="you@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={errors.email}
                    />
                    <Input
                        label="Phone"
                        value={form.phone}
                        onChangeText={(text) => setForm({ ...form, phone: text })}
                        placeholder="+254..."
                        keyboardType="phone-pad"
                    />
                    <Input
                        label="County"
                        value={form.county}
                        onChangeText={(text) => setForm({ ...form, county: text })}
                        placeholder="Kiambu"
                    />
                    <Input
                        label="Password"
                        value={form.password}
                        onChangeText={(text) => { setForm({ ...form, password: text }); setErrors({ ...errors, password: '' }); }}
                        placeholder="••••••••"
                        secureTextEntry={!showPassword}
                        error={errors.password}
                        rightIcon={
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        }
                    />
                    <Input
                        label="Confirm Password"
                        value={form.confirmPassword}
                        onChangeText={(text) => { setForm({ ...form, confirmPassword: text }); setErrors({ ...errors, confirmPassword: '' }); }}
                        placeholder="••••••••"
                        secureTextEntry={!showPassword}
                        error={errors.confirmPassword}
                    />

                    <Button title="Create Account" onPress={handleSubmit} loading={loading} />

                    <TouchableOpacity onPress={() => router.push('/(auth)/login')} className="mt-4">
                        <Text className="text-center text-gray-500 text-sm">
                            Already have an account? <Text className="text-green-600">Sign in</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
