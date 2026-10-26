import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../src/components/Screen';
import { AppButton } from '../src/components/AppButton';
import { useApp } from '../src/state/AppContext';
import { t } from '../src/i18n/t';
import type { Lang } from '../src/types';
import { colors, space, type } from '../src/theme';

const CHOICES: { lang: Lang; name: string; sub: string }[] = [
  { lang: 'te', name: 'తెలుగు', sub: 'Telugu' },
  { lang: 'en', name: 'English', sub: 'English' },
  { lang: 'hi', name: 'हिन्दी', sub: 'Hindi' },
];

export default function LanguageScreen() {
  const { lang, langChosen, setLang, session } = useApp();
  return (
    <Screen>
      <Text style={type.title}>{t(lang, 'chooseLanguage')}</Text>
      <Text style={[type.small, { marginBottom: space.md }]}>{t(lang, 'chooseLanguageHint')}</Text>
      {CHOICES.map((c) => {
        const selected = langChosen && c.lang === lang;
        return (
          <Pressable
            key={c.lang}
            onPress={() => setLang(c.lang)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[styles.card, selected && styles.selected]}
          >
            <Text style={[type.heading, selected && styles.selectedText]}>{c.name}</Text>
            <Text style={[type.small, selected && styles.selectedText]}>{c.sub}</Text>
          </Pressable>
        );
      })}
      <AppButton
        title={t(lang, 'continue')}
        disabled={!langChosen}
        onPress={() => router.replace(session ? '/home' : '/login/email')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 14,
    padding: space.md,
    marginBottom: space.sm,
    backgroundColor: colors.surface,
  },
  selected: { borderColor: colors.primary, backgroundColor: colors.primary },
  selectedText: { color: colors.white },
});
