import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAudio } from '../audio/AudioContext';
import { hasSlow } from '../data/lesson';
import { useApp } from '../state/AppContext';
import { t } from '../i18n/t';
import { colors, space } from '../theme';

export function AudioButtons({ audioId, german }: { audioId: string; german: string }) {
  const { play } = useAudio();
  const { lang } = useApp();
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => play(audioId)}
        accessibilityRole="button"
        accessibilityLabel={`${t(lang, 'play')}: ${german}`}
        style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
      >
        <Text style={styles.text}>🔊 {t(lang, 'play')}</Text>
      </Pressable>
      {hasSlow(audioId) && (
        <Pressable
          onPress={() => play(audioId, true)}
          accessibilityRole="button"
          accessibilityLabel={`${t(lang, 'playSlow')}: ${german}`}
          style={({ pressed }) => [styles.btn, styles.slow, pressed && styles.pressed]}
        >
          <Text style={[styles.text, styles.slowText]}>🐢 {t(lang, 'playSlow')}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.sm, marginTop: space.sm, flexWrap: 'wrap' },
  btn: {
    minHeight: 44,
    paddingHorizontal: space.md,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slow: { backgroundColor: colors.white, borderWidth: 2, borderColor: colors.primary },
  pressed: { opacity: 0.75 },
  text: { color: colors.white, fontSize: 16, lineHeight: 24, fontWeight: '600' },
  slowText: { color: colors.primary },
});
