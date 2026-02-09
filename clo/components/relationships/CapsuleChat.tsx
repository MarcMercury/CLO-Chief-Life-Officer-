import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeIn, FadeInUp, SlideInRight, SlideInLeft } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useCapsuleMessages, useSendMessage, useCapsule } from '@/hooks/useCapsules';
import { supabase } from '@/lib/supabase';

const ACCENT = '#e17055';

interface CapsuleChatProps {
  capsuleId: string;
}

export default function CapsuleChat({ capsuleId }: CapsuleChatProps) {
  const [message, setMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const { data: messages, isLoading } = useCapsuleMessages(capsuleId);
  const { data: capsule } = useCapsule(capsuleId);
  const { mutate: sendMessage, isPending: sending } = useSendMessage();

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
  }, []);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendMessage({
      capsule_id: capsuleId,
      content: message.trim(),
    }, {
      onSuccess: () => {
        setMessage('');
      },
    });
  };

  const getPartnerName = () => {
    if (!capsule || !currentUserId) return 'Partner';
    // In a real app, you'd fetch partner details
    const partnerId = capsule.user_b_id || capsule.partner_id;
    return partnerId === currentUserId ? 'Partner 1' : 'Partner 2';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Group messages by date
  const groupedMessages = messages?.reduce((groups: any, msg: any) => {
    const date = new Date(msg.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(msg);
    return groups;
  }, {}) || {};

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={120}
    >
      {/* Messages List */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={ACCENT} />
          </View>
        ) : messages && messages.length > 0 ? (
          Object.entries(groupedMessages).map(([date, msgs]: [string, any]) => (
            <View key={date}>
              {/* Date Separator */}
              <View style={styles.dateSeparator}>
                <View style={styles.dateLine} />
                <Text style={styles.dateText}>{formatDate((msgs as any[])[0].created_at)}</Text>
                <View style={styles.dateLine} />
              </View>

              {/* Messages for this date */}
              {(msgs as any[]).map((msg: any, index: number) => {
                const isMe = msg.sender_id === currentUserId;
                const Animation = isMe ? SlideInRight : SlideInLeft;

                return (
                  <Animated.View
                    key={msg.id}
                    entering={Animation.delay(index * 30).duration(200)}
                    style={[
                      styles.messageRow,
                      isMe ? styles.messageRowMe : styles.messageRowOther
                    ]}
                  >
                    <View style={[
                      styles.messageBubble,
                      isMe ? styles.bubbleMe : styles.bubbleOther
                    ]}>
                      <Text style={[
                        styles.messageText,
                        isMe ? styles.textMe : styles.textOther
                      ]}>
                        {msg.encrypted_content}
                      </Text>
                      <Text style={[
                        styles.messageTime,
                        isMe ? styles.timeMe : styles.timeOther
                      ]}>
                        {formatTime(msg.created_at)}
                      </Text>
                    </View>
                  </Animated.View>
                );
              })}
            </View>
          ))
        ) : (
          <Animated.View entering={FadeIn.delay(200)} style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>Start a Conversation</Text>
            <Text style={styles.emptyText}>
              Messages are private between you two
            </Text>
            <View style={styles.securityNote}>
              <Text style={styles.securityIcon}>🔒</Text>
              <Text style={styles.securityText}>
                End-to-end encryption coming soon
              </Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Message Input */}
      <Animated.View 
        entering={FadeInUp.delay(100).duration(200)}
        style={styles.inputContainer}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#666"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
            returnKeyType="default"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!message.trim() || sending) && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!message.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.sendIcon}>↑</Text>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    paddingHorizontal: 12,
  },
  messageRow: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMe: {
    backgroundColor: ACCENT,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  textMe: {
    color: '#fff',
  },
  textOther: {
    color: '#E0E0E0',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  timeMe: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  timeOther: {
    color: '#666',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#E0E0E0',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  securityIcon: {
    fontSize: 14,
  },
  securityText: {
    fontSize: 12,
    color: '#666',
  },
  inputContainer: {
    padding: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#E0E0E0',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendIcon: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
