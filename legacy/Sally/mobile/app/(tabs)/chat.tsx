import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Animated,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, CHAT_MODES } from '../lib/constants';
import { detectSallieMode, SOVEREIGN_TO_CHAT_MODE, SOVEREIGN_MODE_LABELS, type SovereignModeKey } from '../lib/ai';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';
import { useNotifications } from '../lib/notifications-context';

interface Message {
  id: string;
  dbId?: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mode: string;
}

interface Conversation {
  id: string;
  title: string;
  mode: string;
  message_count: number;
  last_message_preview: string;
  created_at: string;
  updated_at: string;
}

function ModeSelector({ selectedMode, onSelect }: { selectedMode: string; onSelect: (mode: string) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modeScroll}>
      {CHAT_MODES.map((mode) => (
        <TouchableOpacity
          key={mode.id}
          style={[
            styles.modeChip,
            selectedMode === mode.id && { backgroundColor: mode.color + '25', borderColor: mode.color },
          ]}
          onPress={() => onSelect(mode.id)}
          activeOpacity={0.7}
        >
          <Ionicons name={mode.icon as any} size={16} color={selectedMode === mode.id ? mode.color : COLORS.textLight} />
          <Text style={[styles.modeChipText, selectedMode === mode.id && { color: mode.color }]}>
            {mode.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const timeStr = `${String(message.timestamp.getHours()).padStart(2, '0')}:${String(message.timestamp.getMinutes()).padStart(2, '0')}`;

  return (
    <Animated.View
      style={[
        styles.messageBubbleContainer,
        isUser ? styles.userBubbleContainer : styles.assistantBubbleContainer,
        { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] },
      ]}
    >
      {!isUser && (
        <View style={styles.assistantAvatar}>
          <Ionicons name="sparkles" size={16} color={COLORS.primaryLight} />
        </View>
      )}
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.assistantMessageText]}>
          {message.content}
        </Text>
        <Text style={[styles.messageTime, isUser && { color: 'rgba(255,255,255,0.5)' }]}>
          {timeStr}
        </Text>
      </View>
    </Animated.View>
  );
}

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      ).start();
    };
    animate(dot1, 0);
    animate(dot2, 200);
    animate(dot3, 400);
  }, []);

  return (
    <View style={[styles.messageBubbleContainer, styles.assistantBubbleContainer]}>
      <View style={styles.assistantAvatar}>
        <Ionicons name="sparkles" size={16} color={COLORS.primaryLight} />
      </View>
      <View style={[styles.messageBubble, styles.assistantBubble, styles.typingBubble]}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            style={[
              styles.typingDot,
              { opacity: dot, transform: [{ scale: dot.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.2] }) }] },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const WELCOME_SUGGESTIONS = [
  'Help me brainstorm ideas for a new project',
  'Create a daily productivity plan',
  'Explain quantum computing simply',
  'Guide me through a mindfulness exercise',
];

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function ChatScreen() {
  const { user, sessionToken, recordActivity, incrementMessageCount } = useAuth();
  const { generateStreakReminder } = useNotifications();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState('general');
  const [showModes, setShowModes] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [detectedSovereign, setDetectedSovereign] = useState<SovereignModeKey | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const hasRecordedActivity = useRef(false);
  const detectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentMode = CHAT_MODES.find((m) => m.id === selectedMode) || CHAT_MODES[0];

  // Chameleon effect: detect Sovereign Mode from input as user types
  useEffect(() => {
    if (detectTimeoutRef.current) clearTimeout(detectTimeoutRef.current);
    if (!inputText.trim()) {
      setDetectedSovereign(null);
      return;
    }
    detectTimeoutRef.current = setTimeout(() => {
      const mode = detectSallieMode(inputText);
      setDetectedSovereign(mode === 'ORACLE' ? null : mode);
    }, 400);
    return () => {
      if (detectTimeoutRef.current) clearTimeout(detectTimeoutRef.current);
    };
  }, [inputText]);

  // Load conversation history
  const loadConversations = useCallback(async () => {
    if (!user?.user_id) return;
    setLoadingHistory(true);
    try {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.user_id)
        .order('updated_at', { ascending: false })
        .limit(50);
      if (data) setConversations(data as Conversation[]);
    } catch (e) {
      console.log('Error loading conversations:', e);
    }
    setLoadingHistory(false);
  }, [user?.user_id]);

  useEffect(() => {
    if (user?.user_id) loadConversations();
  }, [user?.user_id]);

  // Create a new conversation
  const createConversation = useCallback(async (firstMessage: string): Promise<string | null> => {
    if (!user?.user_id) return null;
    try {
      const title = firstMessage.length > 50 ? firstMessage.substring(0, 50) + '...' : firstMessage;
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.user_id,
          title,
          mode: selectedMode,
          message_count: 0,
          last_message_preview: firstMessage.substring(0, 100),
        })
        .select()
        .single();
      if (error || !data) return null;
      setCurrentConversationId(data.id);
      return data.id;
    } catch (e) {
      console.log('Error creating conversation:', e);
      return null;
    }
  }, [user?.user_id, selectedMode]);

  // Save a message to the database
  const saveMessage = useCallback(async (conversationId: string, role: string, content: string, mode: string) => {
    if (!user?.user_id) return;
    try {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role,
        content,
        mode,
      });
      // Update conversation metadata
      const preview = content.length > 100 ? content.substring(0, 100) + '...' : content;
      await supabase
        .from('conversations')
        .update({
          last_message_preview: preview,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId);
    } catch (e) {
      console.log('Error saving message:', e);
    }
  }, [user?.user_id]);

  // Load messages for a conversation
  const loadConversationMessages = useCallback(async (conversationId: string) => {
    if (!user?.user_id) return;
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (data) {
        const msgs: Message[] = data.map((m: any) => ({
          id: String(m.id),
          dbId: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.created_at),
          mode: m.mode,
        }));
        setMessages(msgs);
        setCurrentConversationId(conversationId);
        // Get conversation mode
        const conv = conversations.find(c => c.id === conversationId);
        if (conv) setSelectedMode(conv.mode);
      }
    } catch (e) {
      console.log('Error loading messages:', e);
    }
  }, [user?.user_id, conversations]);

  // Delete a conversation
  const deleteConversation = useCallback(async (id: string) => {
    try {
      await supabase.from('conversations').delete().eq('id', id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (currentConversationId === id) {
        setMessages([]);
        setCurrentConversationId(null);
      }
    } catch (e) {
      console.log('Error deleting conversation:', e);
    }
  }, [currentConversationId]);

  const sendMessage = useCallback(async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || isLoading) return;

    // Record activity for streak tracking
    if (!hasRecordedActivity.current && user?.user_id) {
      hasRecordedActivity.current = true;
      const { milestone } = await recordActivity();
      if (milestone) {
        // Create milestone notification
        try {
          await supabase.from('app_notifications').insert({
            user_id: user.user_id,
            type: 'achievement',
            title: `${milestone}-Day Streak!`,
            body: milestone >= 30
              ? `Incredible! You've maintained a ${milestone}-day streak with Sallie. Your dedication to cognitive growth is truly inspiring!`
              : `Amazing! You've hit a ${milestone}-day streak! Keep the momentum going and watch your cognitive abilities grow.`,
            icon: 'trophy',
            color: milestone >= 30 ? COLORS.gold : '#10b981',
            read: false,
          });
        } catch (e) {
          console.log('Error creating milestone notification:', e);
        }
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
      mode: selectedMode,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Create or use existing conversation
    let convId = currentConversationId;
    if (!convId && user?.user_id) {
      convId = await createConversation(messageText) ?? null;
    }

    // Save user message
    if (convId) {
      await saveMessage(convId, 'user', messageText, selectedMode);
    }

    // Increment message count
    if (user?.user_id) {
      incrementMessageCount();
    }

    try {
      const conversationMessages = [...messages, userMessage].slice(-20).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      let reply = "I'm having trouble responding right now. Please try again.";
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      try {
        // Prefer Next.js API (Azure OpenAI) when configured — no Supabase Edge Functions required
        if (apiUrl) {
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (sessionToken) headers['Authorization'] = `Bearer ${sessionToken}`;
          const res = await fetch(`${apiUrl.replace(/\/$/, '')}/api/chat`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              messages: conversationMessages,
              mode: selectedMode,
              user_id: user?.user_id ?? undefined,
              conversation_id: convId ?? undefined,
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok && data?.reply) reply = data.reply;
        }
        if (reply === "I'm having trouble responding right now. Please try again.") {
          const { data, error } = await supabase.functions.invoke('sallie-chat', {
            body: {
              messages: conversationMessages,
              mode: selectedMode,
              user_id: user?.user_id ?? undefined,
              conversation_id: convId ?? undefined,
            },
          });
          if (!error && data?.reply) reply = data.reply;
        }
      } catch (_) {}

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
        mode: selectedMode,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Save assistant message
      if (convId) {
        await saveMessage(convId, 'assistant', assistantMessage.content, selectedMode);
        // Update message count on conversation
        const newCount = messages.length + 2; // +2 for user + assistant
        await supabase.from('conversations').update({ message_count: newCount }).eq('id', convId);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm experiencing a connection issue. Please check your internet and try again.",
        timestamp: new Date(),
        mode: selectedMode,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, messages, selectedMode, currentConversationId, user?.user_id, sessionToken, recordActivity, incrementMessageCount, createConversation, saveMessage]);

  const startNewChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
    hasRecordedActivity.current = false;
  };

  const clearChat = () => {
    Alert.alert('New Chat', 'Start a new conversation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'New Chat', onPress: () => {
          startNewChat();
          loadConversations();
        }
      },
    ]);
  };

  const filteredConversations = searchQuery
    ? conversations.filter(c =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.last_message_preview.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : conversations;

  // Group conversations by date
  const groupedConversations = filteredConversations.reduce<Record<string, Conversation[]>>((groups, conv) => {
    const date = new Date(conv.updated_at);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let key: string;
    if (date.toDateString() === today.toDateString()) key = 'Today';
    else if (date.toDateString() === yesterday.toDateString()) key = 'Yesterday';
    else if (date.getTime() > today.getTime() - 7 * 86400000) key = 'This Week';
    else if (date.getTime() > today.getTime() - 30 * 86400000) key = 'This Month';
    else key = 'Older';

    if (!groups[key]) groups[key] = [];
    groups[key].push(conv);
    return groups;
  }, {});

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="sparkles" size={48} color={COLORS.gold} />
      </View>
      <Text style={styles.emptyTitle}>Hello! I'm Sallie</Text>
      <Text style={styles.emptySubtitle}>
        Your AI cognitive partner. Choose a mode above or start chatting — I'm here to help you think better.
      </Text>
      <View style={styles.suggestionsContainer}>
        {WELCOME_SUGGESTIONS.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestionChip}
            onPress={() => sendMessage(suggestion)}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-forward-circle" size={16} color={COLORS.gold} />
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const getModeColor = (modeId: string) => {
    const mode = CHAT_MODES.find(m => m.id === modeId);
    return mode?.color || COLORS.primaryLight;
  };

  const getModeIcon = (modeId: string) => {
    const mode = CHAT_MODES.find(m => m.id === modeId);
    return mode?.icon || 'chatbubbles';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Ionicons name="sparkles" size={20} color={COLORS.primaryLight} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Sallie</Text>
            <Text style={styles.headerMode}>
              <Ionicons name={currentMode.icon as any} size={11} color={currentMode.color} />{' '}
              {currentMode.label} Mode
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => { loadConversations(); setShowHistory(true); }}
            activeOpacity={0.7}
          >
            <Ionicons name="time-outline" size={22} color={COLORS.textLight} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowModes(!showModes)}
            activeOpacity={0.7}
          >
            <Ionicons name="options" size={22} color={COLORS.textLight} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={clearChat}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={22} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Mode Selector */}
      {showModes && (
        <ModeSelector selectedMode={selectedMode} onSelect={(mode) => { setSelectedMode(mode); setShowModes(false); }} />
      )}

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {messages.length === 0 ? (
          <ScrollView contentContainerStyle={{ flex: 1 }}>{renderEmpty()}</ScrollView>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MessageBubble message={item} />}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListFooterComponent={isLoading ? <TypingIndicator /> : null}
          />
        )}

        {/* Sallie senses chip — tap to switch mode */}
        {detectedSovereign && SOVEREIGN_TO_CHAT_MODE[detectedSovereign] !== selectedMode && (
          <TouchableOpacity
            style={styles.sensesChip}
            onPress={() => setSelectedMode(SOVEREIGN_TO_CHAT_MODE[detectedSovereign as SovereignModeKey])}
            activeOpacity={0.8}
          >
            <Ionicons name="sparkles" size={14} color={COLORS.gold} />
            <Text style={styles.sensesChipText}>
              Sallie senses: {SOVEREIGN_MODE_LABELS[detectedSovereign as SovereignModeKey]} — tap to switch
            </Text>
          </TouchableOpacity>
        )}
        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder={`Message Sallie (${currentMode.label})...`}
              placeholderTextColor={COLORS.textLight}
              multiline
              maxLength={4000}
              onSubmitEditing={() => sendMessage()}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
              onPress={() => sendMessage()}
              disabled={!inputText.trim() || isLoading}
              activeOpacity={0.7}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Ionicons name="send" size={20} color={COLORS.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Conversation History Modal */}
      <Modal visible={showHistory} animationType="slide" transparent>
        <View style={styles.historyOverlay}>
          <View style={styles.historyContent}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Chat History</Text>
              <TouchableOpacity onPress={() => setShowHistory(false)}>
                <Ionicons name="close" size={24} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color={COLORS.textLight} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search conversations..."
                placeholderTextColor={COLORS.textLight}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* New Chat Button */}
            <TouchableOpacity
              style={styles.newChatBtn}
              onPress={() => { startNewChat(); setShowHistory(false); }}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle" size={20} color={COLORS.primaryLight} />
              <Text style={styles.newChatBtnText}>New Conversation</Text>
            </TouchableOpacity>

            {/* Conversation List */}
            <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
              {loadingHistory ? (
                <View style={styles.historyLoading}>
                  <ActivityIndicator size="small" color={COLORS.primaryLight} />
                  <Text style={styles.historyLoadingText}>Loading conversations...</Text>
                </View>
              ) : filteredConversations.length === 0 ? (
                <View style={styles.historyEmpty}>
                  <Ionicons name="chatbubbles-outline" size={48} color={COLORS.textLight} />
                  <Text style={styles.historyEmptyTitle}>
                    {searchQuery ? 'No results found' : 'No conversations yet'}
                  </Text>
                  <Text style={styles.historyEmptySubtitle}>
                    {searchQuery ? 'Try a different search term' : 'Start chatting with Sallie to see your history here'}
                  </Text>
                </View>
              ) : (
                Object.entries(groupedConversations).map(([group, convs]) => (
                  <View key={group}>
                    <Text style={styles.historyGroupTitle}>{group}</Text>
                    {convs.map((conv) => (
                      <TouchableOpacity
                        key={conv.id}
                        style={[
                          styles.historyItem,
                          currentConversationId === conv.id && styles.historyItemActive,
                        ]}
                        onPress={() => {
                          loadConversationMessages(conv.id);
                          setShowHistory(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.historyItemLeft}>
                          <View style={[styles.historyItemIcon, { backgroundColor: getModeColor(conv.mode) + '20' }]}>
                            <Ionicons name={getModeIcon(conv.mode) as any} size={16} color={getModeColor(conv.mode)} />
                          </View>
                          <View style={styles.historyItemContent}>
                            <Text style={styles.historyItemTitle} numberOfLines={1}>{conv.title}</Text>
                            <Text style={styles.historyItemPreview} numberOfLines={1}>{conv.last_message_preview}</Text>
                            <View style={styles.historyItemMeta}>
                              <Text style={styles.historyItemTime}>{formatTimeAgo(conv.updated_at)}</Text>
                              <Text style={styles.historyItemCount}>{conv.message_count} messages</Text>
                            </View>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={styles.historyDeleteBtn}
                          onPress={() => {
                            Alert.alert('Delete Conversation', 'Are you sure you want to delete this conversation?', [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Delete', style: 'destructive', onPress: () => deleteConversation(conv.id) },
                            ]);
                          }}
                        >
                          <Ionicons name="trash-outline" size={18} color={COLORS.textLight} />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))
              )}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
  },
  headerMode: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  modeScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  modeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  chatArea: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  messageBubbleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  userBubbleContainer: {
    alignSelf: 'flex-end',
  },
  assistantBubbleContainer: {
    alignSelf: 'flex-start',
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '100%',
  },
  userBubble: {
    backgroundColor: COLORS.primaryLight,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: COLORS.white,
  },
  assistantMessageText: {
    color: 'rgba(255,255,255,0.85)',
  },
  messageTime: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primaryLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  suggestionsContainer: {
    width: '100%',
    gap: 10,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  suggestionText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
  },
  sensesChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
  },
  sensesChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gold,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: COLORS.bgDark,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.white,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.4)',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderColor: 'transparent',
  },
  // History Modal
  historyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  historyContent: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
    marginTop: 60,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.white,
    paddingVertical: 12,
  },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  newChatBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primaryLight,
  },
  historyList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  historyLoading: {
    alignItems: 'center',
    paddingTop: 40,
    gap: 12,
  },
  historyLoadingText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  historyEmpty: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  historyEmptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 16,
  },
  historyEmptySubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  historyGroupTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  historyItemActive: {
    borderColor: COLORS.primaryLight + '40',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  historyItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 3,
  },
  historyItemPreview: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  historyItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyItemTime: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  historyItemCount: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  historyDeleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.08)',
    marginLeft: 8,
  },
});
