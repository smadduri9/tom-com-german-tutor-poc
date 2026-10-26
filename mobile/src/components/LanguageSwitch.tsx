import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../state/AppContext';
import type { Lang } from '../types';
import { colors } from '../theme';

const OPTIONS: { lang: Lang; label: string; a11y: string }[] = [
  { lang: 'te', label: 'తె', a11y: 'తెలుగు' },
  { lang: 'en', label: 'EN', a11y: 'English' },
  { lang: 'hi', label: 'हि', a11y: 'हिन्दी' },
];

// onDark: for blue backgrounds (landing page).
export function LanguageSwitch({ onDark = false }: { onDark?: boolean }) {
  const { lang, setLang } = useApp();
  return (
    <View style={styles.row}>
      {OPTIONS.map((o) => {
        const active = o.lang === lang;
        return (
          <Pressable
            key={o.lang}
            onPress={() => setLang(o.lang)}
            accessibilityRole="button"
            accessibilityLabel={o.a11y}
            accessibilityState={{ selected: active }}
            hitSlop={6}
            style={[styles.pill, onDark && styles.pillDark, active && (onDark ? styles.activeDark : styles.active)]}
          >
            <Text style={[styles.text, onDark && styles.textDark, active && (onDark ? styles.activeDarkText : styles.activeText)]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4 },
  pill: {
    minWidth: 36,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  active: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 14, lineHeight: 20, color: colors.primary, fontWeight: '600' },
  activeText: { color: colors.white },
  pillDark: { borderColor: colors.brass },
  activeDark: { backgroundColor: colors.white, borderColor: colors.white },
  textDark: { color: colors.white },
  activeDarkText: { color: colors.primary },
});
