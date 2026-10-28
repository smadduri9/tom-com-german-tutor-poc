import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { ScrollViewInstance } from 'react-native';
import { router } from 'expo-router';
import { TutorMessage } from '../../src/components/TutorMessage';
import { useApp } from '../../src/state/AppContext';
import { useTutor } from '../../src/state/TutorContext';
import { t } from '../../src/i18n/t';
import type { TutorMode } from '../../src/backend';
import { colors, space, type } from '../../src/theme';

export default function TutorTab() {
  const { lang } = useApp();
  const { turns, busy, error, ask } = useTutor();
  const [mode, setMode] = useState<TutorMode>('ask');
  const [text, setText] = useState('');
  const scroll = useRef<ScrollViewInstance>(null);

  const send = (q: string) => {
    const question = q.trim();
    if (!question || busy) return;
    setText('');
    ask(question, mode).finally(() => setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50));
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
  };

  const chips = [t(lang, 'chip1'), t(lang, 'chip2'), t(lang, 'chip3'), t(lang, 'chip4')];

  return (
    <>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <View style={styles.top}>
          <View style={styles.segment}>
            {(['ask', 'translate'] as TutorMode[]).map((m) => (
              <Pressable
                key={m}
                onPress={() => setMode(m)}
                accessibilityRole="button"
                accessibilityState={{ selected: mode === m }}
                style={[styles.seg, mode === m && styles.segOn]}
              >
                <Text style={[styles.segText, mode === m && styles.segTextOn]} numberOfLines={2}>
                  {m === 'ask' ? t(lang, 'modeAsk') : t(lang, 'modeTranslate')}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={() => router.push('/tutor-voice')} accessibilityRole="button" style={styles.voiceBtn}>
            <Text style={styles.voiceText}>🎙 {t(lang, 'voice')}</Text>
          </Pressable>
        </View>

        <ScrollView ref={scroll} style={styles.flex} contentContainerStyle={styles.chat} keyboardShouldPersistTaps="handled">
          {turns.length === 0 ? (
            <View>
              <Text style={type.heading}>{t(lang, 'askTheTutor')}</Text>
              <Text style={[type.small, { marginBottom: space.sm }]}>{t(lang, 'tutorIntro')}</Text>
              {chips.map((c) => (
                <Pressable key={c} onPress={() => send(c)} accessibilityRole="button" style={({ pressed }) => [styles.chip, pressed && { opacity: 0.7 }]}>
                  <Text style={styles.chipText}>{c}</Text>
                </Pressable>
              ))}
            </View>
          ) : (
            turns.map((turn, i) =>
              turn.role === 'user' ? (
                <View key={i} style={styles.user}>
                  <Text style={styles.userText}>{turn.text}</Text>
                </View>
              ) : (
                <TutorMessage key={i} text={turn.text} lang={lang} />
              ),
            )
          )}
          {busy && <Text style={[type.small, { marginTop: space.sm }]}>{t(lang, 'thinking')}</Text>}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>

        <View style={styles.inputBar}>
          {mode === 'translate' && <Text style={styles.modeNote}>{t(lang, 'translateOn')}</Text>}
          <View style={styles.inputRow}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={mode === 'translate' ? t(lang, 'translatePlaceholder') : t(lang, 'tutorPlaceholder')}
              placeholderTextColor={colors.muted}
              style={styles.input}
              multiline
              accessibilityLabel={t(lang, 'tutorPlaceholder')}
            />
            <Pressable
              onPress={() => send(text)}
              disabled={!text.trim() || busy}
              accessibilityRole="button"
              accessibilityLabel={t(lang, 'send')}
              style={[styles.send, (!text.trim() || busy) && { opacity: 0.4 }]}
            >
              <Text style={styles.sendText}>{t(lang, 'send')}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  top: { flexDirection: 'row', gap: space.sm, padding: space.md, paddingBottom: space.sm, alignItems: 'center' },
  segment: { flex: 1, flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 3 },
  seg: { flex: 1, minHeight: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  segOn: { backgroundColor: colors.primary },
  segText: { fontSize: 13, lineHeight: 18, fontWeight: '600', color: colors.primary, textAlign: 'center' },
  segTextOn: { color: colors.white },
  voiceBtn: { minHeight: 50, paddingHorizontal: space.md, borderRadius: 12, backgroundColor: '#111', justifyContent: 'center' },
  voiceText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  chat: { padding: space.md, paddingBottom: space.lg },
  chip: { borderWidth: 1, borderColor: colors.primaryTint, borderRadius: 20, paddingHorizontal: space.md, paddingVertical: space.sm, marginTop: space.sm, alignSelf: 'flex-start' },
  chipText: { fontSize: 15, lineHeight: 22, color: colors.primary },
  user: { alignSelf: 'flex-end', maxWidth: '85%', backgroundColor: colors.primary, borderRadius: 16, padding: space.sm, paddingHorizontal: space.md, marginTop: space.sm },
  userText: { color: colors.white, fontSize: 16, lineHeight: 24 },
  error: { color: colors.error, marginTop: space.sm, fontSize: 15 },
  inputBar: { borderTopWidth: 1, borderTopColor: colors.border, padding: space.sm, backgroundColor: colors.white },
  modeNote: { fontSize: 12, color: colors.accentText, fontWeight: '700', marginBottom: 4, marginLeft: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm },
  input: { flex: 1, minHeight: 44, maxHeight: 120, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: space.sm, paddingTop: 10, fontSize: 16, color: colors.text },
  send: { minHeight: 44, paddingHorizontal: space.md, borderRadius: 12, backgroundColor: colors.primary, justifyContent: 'center' },
  sendText: { color: colors.white, fontWeight: '700' },
});
