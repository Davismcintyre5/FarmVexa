import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { chatApi, publicApi } from '../../api/axios';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../../utils/formatters';

// Typing dots component
function TypingIndicator() {
  const [dot1] = useState(new Animated.Value(0));
  const [dot2] = useState(new Animated.Value(0));
  const [dot3] = useState(new Animated.Value(0));

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);

    return () => {
      dot1.stopAnimation();
      dot2.stopAnimation();
      dot3.stopAnimation();
    };
  }, []);

  const renderDot = (dot: Animated.Value) => (
    <Animated.View
      style={[
        styles.typingDot,
        {
          transform: [
            {
              translateY: dot.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -8],
              }),
            },
          ],
          opacity: dot.interpolate({
            inputRange: [0, 1],
            outputRange: [0.4, 1],
          }),
        },
      ]}
    />
  );

  return (
    <View style={styles.typingRow}>
      <View style={styles.assistantAvatar}>
        <Ionicons name="chatbubble" size={16} color={colors.primary[500]} />
      </View>
      <View style={styles.typingBubble}>
        <View style={styles.typingDots}>
          {renderDot(dot1)}
          {renderDot(dot2)}
          {renderDot(dot3)}
        </View>
      </View>
    </View>
  );
}

export default function AIChat() {
  const navigation = useNavigation<any>();
  const flatListRef = useRef<FlatList>(null);
  
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showChatsList, setShowChatsList] = useState(false);
  const [chatbotConfig, setChatbotConfig] = useState<any>({});

  useEffect(() => {
    loadChats();
    loadChatbotConfig();
  }, []);

  useEffect(() => {
    if (activeChat?._id) {
      loadMessages(activeChat._id);
    }
  }, [activeChat?._id]);

  const loadChatbotConfig = async () => {
    try {
      const res = await publicApi.getPublicSettings();
      setChatbotConfig(res.data.data?.chatbot || {});
    } catch (error) {
      setChatbotConfig({});
    }
  };

  const loadChats = async () => {
    try {
      const res = await chatApi.getChats();
      const chatList = res.data.data?.chats || [];
      setChats(chatList);
      
      if (chatList.length > 0 && !activeChat) {
        setActiveChat(chatList[0]);
        setMessages(chatList[0].messages || []);
      }
    } catch (error) {
      setChats([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const res = await chatApi.getChat(chatId);
      const chat = res.data.data?.chat;
      setMessages(chat?.messages || []);
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error) {
      setMessages([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChats();
    if (activeChat?._id) {
      await loadMessages(activeChat._id);
    }
  };

  const handleSend = async () => {
    const msg = inputMessage.trim();
    if (!msg || sending) return;

    setInputMessage('');
    setSending(true);

    const userMsg = { role: 'user', content: msg, timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      let res;
      
      if (!activeChat?._id) {
        res = await chatApi.startChat({ message: msg });
      } else {
        res = await chatApi.sendMessage(activeChat._id, msg);
      }

      const chat = res.data?.data?.chat || res.data?.chat;
      
      if (chat) {
        setActiveChat(chat);
        setMessages(chat.messages || []);
      }

      loadChats();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleDeleteChat = (chatId: string) => {
    Alert.alert('Delete Chat', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await chatApi.deleteChat(chatId);
            setChats((prev) => prev.filter((c) => c._id !== chatId));
            
            if (activeChat?._id === chatId) {
              setActiveChat(null);
              setMessages([]);
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to delete chat');
          }
        },
      },
    ]);
  };

  const handleClearAllChats = () => {
    Alert.alert('Clear All Chats', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: async () => {
          try {
            await chatApi.clearChats();
            setChats([]);
            setActiveChat(null);
            setMessages([]);
          } catch (error) {
            Alert.alert('Error', 'Failed to clear chats');
          }
        },
      },
    ]);
  };

  const renderMessage = ({ item, index }: { item: any; index: number }) => {
    const isUser = item.role === 'user';
    
    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.userMessageRow : styles.assistantMessageRow,
        ]}
      >
        {!isUser && (
          <View style={styles.assistantAvatar}>
            <Ionicons name="chatbubble" size={16} color={colors.primary[500]} />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {item.content}
          </Text>
          {item.timestamp && (
            <Text style={[styles.messageTime, isUser && styles.userMessageTime]}>
              {formatDate(item.timestamp, 'time')}
            </Text>
          )}
        </View>
        {isUser && (
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={16} color={colors.white} />
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return <Spinner size="lg" />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.chatsButton}
          onPress={() => setShowChatsList(true)}
        >
          <Ionicons name="menu" size={24} color={colors.gray[700]} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            {activeChat?.title || chatbotConfig.name || 'FarmVexa AI'}
          </Text>
          <Text style={styles.headerStatus}>
            {chatbotConfig.enabled !== false ? '● Online' : '○ Offline'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.newChatButton}
          onPress={() => {
            setActiveChat(null);
            setMessages([]);
          }}
        >
          <Ionicons name="add" size={24} color={colors.primary[500]} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {messages.length === 0 && !sending ? (
        <EmptyState
          icon="chatbubble-ellipses-outline"
          title="Start Chatting"
          description={chatbotConfig.greeting || 'Ask me anything about your farm!'}
        />
      ) : (
        <FlatList
          ref={flatListRef}
          data={[...messages, ...(sending ? [{ _id: 'typing', role: 'assistant', content: '', typing: true }] : [])]}
          keyExtractor={(item, index) => item._id || `msg_${index}`}
          renderItem={({ item }) => {
            if (item.typing) {
              return <TypingIndicator />;
            }
            return renderMessage({ item, index: 0 });
          }}
          contentContainerStyle={styles.messagesList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Ask about farming..."
          placeholderTextColor={colors.gray[400]}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputMessage.trim() || sending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputMessage.trim() || sending}
        >
          {sending ? (
            <Ionicons name="hourglass" size={20} color={colors.white} />
          ) : (
            <Ionicons name="send" size={20} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>

      {/* Chats List Modal */}
      <Modal
        open={showChatsList}
        onClose={() => setShowChatsList(false)}
        title="Chats"
        size="md"
      >
        <View style={styles.modalContent}>
          {chats.length === 0 ? (
            <Text style={styles.emptyChats}>No chats yet</Text>
          ) : (
            <View style={styles.chatsList}>
              {chats.map((chat) => (
                <TouchableOpacity
                  key={chat._id}
                  style={[
                    styles.chatItem,
                    activeChat?._id === chat._id && styles.chatItemActive,
                  ]}
                  onPress={() => {
                    setActiveChat(chat);
                    setMessages(chat.messages || []);
                    setShowChatsList(false);
                  }}
                >
                  <View style={styles.chatItemInfo}>
                    <Text style={styles.chatItemTitle}>{chat.title || 'New Chat'}</Text>
                    <Text style={styles.chatItemDate}>
                      {chat.messages?.length || 0} msgs · {formatDate(chat.lastMessageAt || chat.createdAt, 'relative')}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteChat(chat._id)}>
                    <Ionicons name="trash-outline" size={18} color={colors.red[500]} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {chats.length > 0 && (
            <Button variant="outline" onPress={handleClearAllChats} fullWidth>
              <Ionicons name="trash" size={16} color={colors.red[500]} /> Clear All Chats
            </Button>
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    gap: spacing.md,
  },
  chatsButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  headerStatus: {
    fontSize: 12,
    color: colors.primary[500],
  },
  newChatButton: {
    padding: 8,
  },
  messagesList: {
    padding: spacing.md,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  assistantMessageRow: {
    justifyContent: 'flex-start',
  },
  assistantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  userBubble: {
    backgroundColor: colors.primary[500],
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  messageText: {
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 20,
  },
  userMessageText: {
    color: colors.white,
  },
  messageTime: {
    fontSize: 10,
    color: colors.gray[400],
    marginTop: 4,
  },
  userMessageTime: {
    color: colors.white,
    opacity: 0.8,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  typingBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[400],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.gray[900],
    backgroundColor: colors.gray[50],
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  modalContent: {
    gap: spacing.md,
  },
  chatsList: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  chatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[50],
  },
  chatItemActive: {
    backgroundColor: colors.primary[50],
  },
  chatItemInfo: {
    flex: 1,
    gap: 2,
  },
  chatItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
  },
  chatItemDate: {
    fontSize: 12,
    color: colors.gray[400],
  },
  emptyChats: {
    fontSize: 14,
    color: colors.gray[400],
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});