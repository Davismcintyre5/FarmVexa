import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getChats, getChat, startChat, sendMessage, deleteChat } from '@/api/api';
import Spinner from '@/components/ui/Spinner';
import { formatDate } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export default function AIChat() {
    const { user } = useAuth();
    const router = useRouter();
    const [chats, setChats] = useState<any[]>([]);
    const [activeChat, setActiveChat] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [lang, setLang] = useState('en');
    const scrollRef = useRef<ScrollView>(null);

    useEffect(() => {
        getChats().then((res) => setChats(res.data.data.chats || [])).finally(() => setLoading(false));
    }, []);

    const openChat = async (chatId: string) => {
        try {
            const res = await getChat(chatId);
            const c = res.data.data.chat;
            setActiveChat(c);
            setMessages(c.messages || []);
        } catch {}
    };

    const newChat = () => {
        setActiveChat({ _id: null, title: 'New Chat' });
        setMessages([]);
    };

    const handleSend = async () => {
        const msg = input.trim();
        if (!msg || sending) return;
        setInput('');
        const userMsg = { role: 'user', content: msg, timestamp: new Date().toISOString() };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setSending(true);
        try {
            const finalMsg = lang === 'sw' ? `${msg}\n\n[Respond in Swahili]` : msg;
            let res;
            if (!activeChat?._id) {
                res = await startChat({ message: finalMsg });
            } else {
                res = await sendMessage(activeChat._id, finalMsg);
            }
            const c = res.data.data.chat;
            setActiveChat(c);
            setMessages(c.messages);
            getChats().then((r) => setChats(r.data.data.chats || []));
        } catch (err: any) {
            setMessages([...newMessages, { role: 'assistant', content: err.response?.data?.message || 'Sorry, try again.', timestamp: new Date().toISOString() }]);
        } finally {
            setSending(false);
        }
    };

    if (loading) return <Spinner />;

    return (
        <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
                <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2">
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900">AI Assistant</Text>
                <TouchableOpacity onPress={() => setLang(lang === 'en' ? 'sw' : 'en')}>
                    <Ionicons name="language" size={24} color="#16a34a" />
                </TouchableOpacity>
            </View>

            <ScrollView ref={scrollRef} className="flex-1 px-4 py-4" onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
                {messages.length === 0 ? (
                    <View className="items-center justify-center py-12">
                        <Ionicons name="chatbubble-ellipses" size={48} color="#9ca3af" />
                        <Text className="text-lg font-bold mt-4">{lang === 'sw' ? `Habari, ${user?.name?.split(' ')[0]}!` : `Hello, ${user?.name?.split(' ')[0]}!`}</Text>
                        <Text className="text-gray-500 text-sm">{lang === 'sw' ? 'Msaidizi wako wa kilimo.' : 'Your AI farm assistant.'}</Text>
                    </View>
                ) : (
                    messages.map((msg, i) => (
                        <View key={i} className={`flex-row gap-2 mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <View className="w-8 h-8 bg-green-600 rounded-full items-center justify-center">
                                    <Ionicons name="leaf" size={16} color="#fff" />
                                </View>
                            )}
                            <View className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${msg.role === 'user' ? 'bg-green-600' : 'bg-gray-100'}`}>
                                <Text className={`text-sm ${msg.role === 'user' ? 'text-white' : 'text-gray-900'}`}>{msg.content}</Text>
                                <Text className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-green-200' : 'text-gray-400'}`}>
                                    {formatDate(msg.timestamp, 'time')}
                                </Text>
                            </View>
                        </View>
                    ))
                )}
                {sending && (
                    <View className="flex-row gap-2 mb-4">
                        <View className="w-8 h-8 bg-green-600 rounded-full items-center justify-center">
                            <Ionicons name="leaf" size={16} color="#fff" />
                        </View>
                        <View className="bg-gray-100 rounded-2xl px-4 py-3">
                            <Text className="text-gray-400">Typing...</Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            <View className="p-3 border-t border-gray-200 flex-row gap-2">
                <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder={lang === 'en' ? 'Ask about farming...' : 'Uliza kuhusu kilimo...'}
                    className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm"
                    multiline
                    onSubmitEditing={handleSend}
                />
                <TouchableOpacity onPress={handleSend} disabled={!input.trim() || sending} className="bg-green-600 rounded-xl px-4 items-center justify-center">
                    <Ionicons name="send" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}
