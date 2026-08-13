import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { validateLogin } from '@/utils/validators';
import { getPublicSettings } from '@/api/api';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
    const { login } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<any>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [allowRegister, setAllowRegister] = useState(true);

    useEffect(() => {
        getPublicSettings()
            .then((res) => setAllowRegister(res.data.data?.allowSelfRegistration ?? true))
            .catch(() => setAllowRegister(true));
    }, []);

    const handleSubmit = async () => {
        const v = validateLogin(form);
        if (Object.keys(v).length > 0) { setErrors(v); return; }
        setLoading(true);
        setAlert(null);
        try {
            const user = await login(form);
            if (user.approvalStatus === 'pending') router.replace('/(auth)/pending-approval');
            else router.replace('/(tabs)/dashboard');
        } catch (err: any) {
            setAlert({ type: 'error', message: err.response?.data?.message || 'Login failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="p-6 pt-20">
                <View className="items-center mb-8">
                    <View className="w-16 h-16 bg-green-600 rounded-2xl items-center justify-center mb-4">
                        <Ionicons name="leaf" size={32} color="#fff" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-900">FarmVexa</Text>
                    <Text className="text-gray-500 mt-1">See. Sense. Predict. Grow.</Text>
                </View>

                <Text className="text-2xl font-bold text-gray-900 text-center mb-6">Welcome Back</Text>

                {alert && (
                    <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                        <Text className="text-red-600 text-sm">{alert.message}</Text>
                    </View>
                )}

                <View className="space-y-4">
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

                    <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                        <Text className="text-right text-green-600 text-sm">Forgot password?</Text>
                    </TouchableOpacity>

                    <Button title="Sign In" onPress={handleSubmit} loading={loading} />

                    {allowRegister ? (
                        <TouchableOpacity onPress={() => router.push('/(auth)/register')} className="mt-4">
                            <Text className="text-center text-gray-500 text-sm">
                                Don't have an account? <Text className="text-green-600">Create one</Text>
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <Text className="text-center text-gray-500 text-sm mt-4">
                            Access is by invitation. Contact your administrator.
                        </Text>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}
