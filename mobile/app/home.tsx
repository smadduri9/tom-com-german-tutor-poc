import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../src/components/Screen';
import { AppButton } from '../src/components/AppButton';
import { useApp } from '../src/state/AppContext';
import { lesson1 } from '../src/data/lesson';
import { buildSteps } from '../src/logic/steps';
import { pick, t } from '../src/i18n/t';
import { colors, space, type } from '../src/theme';

const TOTAL_STEPS = buildSteps(lesson1).length;

export default function Home() {
  const { lang, session, progress, saveStep, logout } = useApp();
  const percent = progress.passed ? 100 : Math.round((progress.step / TOTAL_STEPS) * 100);
  const label = progress.passed ? t(lang, 'review') : progress.step > 0 ? t(lang, 'resume') : t(lang, 'start');

  const open = () => {
    if (progress.passed) saveStep(0);
    router.push('/lesson');
  };

  return (
    <Screen>
      <Text style={type.title}>{t(lang, 'welcome')}</Text>
      {session && <Text style={type.small}>{session.email}</Text>}

      <View style={styles.card}>
        <Text style={styles.level}>{t(lang, 'levelA1')}</Text>
        <Text style={type.heading}>{pick(lesson1.title, lang)}</Text>
        <Text style={type.body}>{pick(lesson1.subtitle, lang)}</Text>

        <View style={styles.barTrack} accessibilityLabel={t(lang, 'progress', { p: percent })}>
          <View style={[styles.barFill, { width: `${percent}%` }]} />
        </View>
        <Text style={type.small}>{t(lang, 'progress', { p: percent })}</Text>
        {progress.quizBest > 0 && <Text style={type.small}>{t(lang, 'bestScore', { s: progress.quizBest })}</Text>}
        {progress.passed && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>✓ {t(lang, 'completed')}</Text>
          </View>
        )}
        <AppButton title={label} onPress={open} />
      </View>

      <AppButton
        title={t(lang, 'logout')}
        variant="ghost"
        onPress={() => {
          logout();
          router.replace('/welcome');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: space.md,
    marginTop: space.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  level: { color: colors.brassText, fontWeight: '700', fontSize: 14, lineHeight: 22 },
  barTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    marginTop: space.md,
    marginBottom: space.xs,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: colors.accent },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.successBg,
    borderRadius: 12,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    marginTop: space.sm,
  },
  badgeText: { color: colors.success, fontWeight: '700', fontSize: 14, lineHeight: 22 },
});
