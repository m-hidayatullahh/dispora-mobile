import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme, useThemedStyles, spacing, radius } from '../theme';
import { useI18n } from '../i18n/i18n';
import { sendChatMessage, cleanText } from '../api/dispora';

let idSeq = 0;
const nextId = () => `m${Date.now()}_${idSeq++}`;

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useI18n();
  const s = useThemedStyles(makeStyles);
  const listRef = useRef(null);

  const [sessionId, setSessionId] = useState(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([
    { id: nextId(), role: 'bot', text: t('chat.greeting'), at: Date.now() },
  ]);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const mine = { id: nextId(), role: 'user', text, at: Date.now() };
    setMessages((prev) => [...prev, mine]);
    setInput('');
    setSending(true);
    scrollToEnd();

    try {
      const res = await sendChatMessage({
        sessionId,
        message: text,
        attachmentUrl: null,
        attachmentName: null,
      });

      if (res.sessionId) setSessionId(res.sessionId);

      const reply = cleanText(res.reply) || JSON.stringify(res.raw ?? {}).slice(0, 400);
      setMessages((prev) => [...prev, { id: nextId(), role: 'bot', text: reply, at: Date.now() }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'bot', text: t('chat.error'), at: Date.now(), error: true },
      ]);
    } finally {
      setSending(false);
      scrollToEnd();
    }
  };

  const renderItem = ({ item }) => {
    const mine = item.role === 'user';
    return (
      <View style={[s.row, mine ? s.rowMine : s.rowBot]}>
        {!mine ? (
          <View style={s.avatar}>
            <Ionicons name="sparkles" size={13} color={colors.onPrimary} />
          </View>
        ) : null}
        <View style={[s.bubble, mine ? s.bubbleMine : s.bubbleBot, item.error && s.bubbleError]}>
          <Text style={[s.bubbleText, mine && s.bubbleTextMine]}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={s.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToEnd}
        ListFooterComponent={
          sending ? (
            <View style={[s.row, s.rowBot]}>
              <View style={s.avatar}>
                <Ionicons name="sparkles" size={13} color={colors.onPrimary} />
              </View>
              <View style={[s.bubble, s.bubbleBot, s.typing]}>
                <ActivityIndicator size="small" color={colors.textMuted} />
                <Text style={s.typingText}>{t('chat.typing')}</Text>
              </View>
            </View>
          ) : null
        }
      />

      <View style={[s.composer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={t('chat.placeholder')}
          placeholderTextColor={colors.textFaint}
          style={s.input}
          multiline
          maxLength={1000}
          onSubmitEditing={send}
        />
        <Pressable
          onPress={send}
          disabled={!input.trim() || sending}
          style={({ pressed }) => [
            s.sendButton,
            (!input.trim() || sending) && s.sendDisabled,
            pressed && { opacity: 0.8 },
          ]}
        >
          <Ionicons name="send" size={17} color={colors.onPrimary} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (c, t) => ({
  screen: { flex: 1, backgroundColor: c.base },
  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },

  row: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, marginBottom: spacing.md },
  rowMine: { justifyContent: 'flex-end' },
  rowBot: { justifyContent: 'flex-start' },

  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: c.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bubble: {
    maxWidth: '78%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
  },
  bubbleBot: {
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.line,
    borderBottomLeftRadius: radius.sm,
  },
  bubbleMine: {
    backgroundColor: c.primary,
    borderBottomRightRadius: radius.sm,
  },
  bubbleError: { borderColor: c.danger },
  bubbleText: { ...t.body, color: c.text, fontSize: 14 },
  bubbleTextMine: { color: c.onPrimary },

  typing: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  typingText: { ...t.small },

  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: c.line,
    backgroundColor: c.surface,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: spacing.lg,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: c.base,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.line,
    color: c.text,
    fontSize: 14,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.45 },
});
