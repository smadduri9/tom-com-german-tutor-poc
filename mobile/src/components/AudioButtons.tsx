import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAudio } from '../audio/AudioContext';
import { useApp } from '../state/AppContext';
import { t } from '../i18n/t';
import { colors, space } from '../theme';

// 🔊 normal and 🐢 slow. Uses the recorded clip when audioId has one, else the device's German voice.
export function AudioButtons({ audioId, german, compact = false }: { audioId?: string; german: string; compact?: boolean }) {
  const { play } = useAudio();
  const { lang } = useApp();
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => play(audioId, german)}
        accessibilityRole="button"
        accessibilityLabel={`${t(lang, 'play')}: ${german}`}
        hitSlop={4}
        style={({ pressed }) => [styles.btn, compact && styles.compact, pressed && styles.pressed]}
      >
        <Text style={styles.text}>🔊{compact ? '' : ` ${t(lang, 'play')}`}</Text>
      </Pressable>
      <Pressable
        onPress={() => play(audioId, german, true)}
        accessibilityRole="button"
        accessibilityLabel={`${t(lang, 'playSlow')}: ${german}`}
        hitSlop={4}
        style={({ pressed }) => [styles.btn, styles.slow, compact && styles.compact, pressed && styles.pressed]}
      >
        <Text style={[styles.text, styles.slowText]}>🐢{compact ? '' : ` ${t(lang, 'playSlow')}`}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' },
  btn: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: space.md,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: { paddingHorizontal: 0 },
  slow: { backgroundColor: colors.white, borderWidth: 2, borderColor: colors.accent },
  pressed: { opacity: 0.75 },
  text: { color: colors.onAccent, fontSize: 16, lineHeight: 24, fontWeight: '600' },
  slowText: { color: colors.accentText },
});
