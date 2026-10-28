import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Speech from 'expo-speech';
import { useAudio } from '../audio/AudioContext';
import { parseTutorAnswer } from '../logic/tutorLines';
import type { Lang } from '../types';
import { colors, space } from '../theme';

const VOICE: Record<Lang, string> = { en: 'en-IN', te: 'te-IN', hi: 'hi-IN' };

// Speaks the answer line by line: German lines with the German voice, the rest in the UI language.
// expo-speech queues utterances, so the blocks play in order.
export function speakAnswer(answer: string, lang: Lang) {
  Speech.stop();
  for (const b of parseTutorAnswer(answer)) {
    if (b.kind === 'de') Speech.speak(b.de, { language: 'de-DE', rate: 0.9 });
    else Speech.speak(b.text.replace(/^Meaning:\s*/i, ''), { language: VOICE[lang] });
  }
}

export function TutorMessage({ text, lang }: { text: string; lang: Lang }) {
  const { play } = useAudio();
  const blocks = parseTutorAnswer(text);
  return (
    <View style={styles.wrap}>
      {blocks.map((b, i) =>
        b.kind === 'de' ? (
          <View key={i} style={styles.de}>
            <View style={styles.deRow}>
              <Text style={styles.deText}>{b.de}</Text>
              <Pressable onPress={() => play(undefined, b.de)} accessibilityRole="button" accessibilityLabel={b.de} hitSlop={8} style={styles.speak}>
                <Text style={{ fontSize: 18 }}>🔊</Text>
              </Pressable>
            </View>
            {b.meaning ? <Text style={styles.meaning}>{b.meaning}</Text> : null}
          </View>
        ) : (
          <Text key={i} style={styles.text}>
            {b.text}
          </Text>
        ),
      )}
      <Pressable onPress={() => speakAnswer(text, lang)} accessibilityRole="button" style={styles.readAll} hitSlop={6}>
        <Text style={styles.readAllText}>🔊</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    maxWidth: '92%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: space.md,
    marginTop: space.sm,
  },
  text: { fontSize: 16, lineHeight: 25, color: colors.text, marginBottom: space.xs },
  de: {
    backgroundColor: colors.gold,
    borderColor: colors.goldBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: space.sm,
    marginVertical: space.xs,
  },
  deRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  deText: { flex: 1, fontSize: 18, lineHeight: 26, fontWeight: '700', color: colors.primary },
  speak: { minWidth: 36, minHeight: 36, alignItems: 'center', justifyContent: 'center' },
  meaning: { fontSize: 14, lineHeight: 21, color: colors.muted, marginTop: 2 },
  readAll: { alignSelf: 'flex-end', minWidth: 36, minHeight: 32, alignItems: 'center', justifyContent: 'center' },
  readAllText: { fontSize: 16 },
});
