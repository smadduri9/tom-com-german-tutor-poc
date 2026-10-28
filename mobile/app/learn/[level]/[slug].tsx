import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import { Screen } from '../../../src/components/Screen';
import { AppButton } from '../../../src/components/AppButton';
import { LessonContent } from '../../../src/components/LessonContent';
import { hasLesson, useApp } from '../../../src/state/AppContext';
import { curriculumData, lessons } from '../../../src/data/lessons';
import { isUnlocked } from '../../../src/logic/progress';
import { pick, t } from '../../../src/i18n/t';
import { LEVELS, type Level } from '../../../src/types';
import { colors, space, type } from '../../../src/theme';

export default function LessonScreen() {
  const { level: rawLevel, slug } = useLocalSearchParams<{ level: string; slug: string }>();
  const { lang, user, progress, openLesson, completeLesson } = useApp();
  const level = (LEVELS as string[]).includes(rawLevel ?? '') ? (rawLevel as Level) : null;
  const lesson = level && slug ? lessons[level]?.[slug] : undefined;
  const items = level ? curriculumData[level] : [];
  const index = items.findIndex((i) => i.slug === slug);
  const allowed = Boolean(level && lesson && isUnlocked(level, slug!, progress, curriculumData, hasLesson));
  const [toast, setToast] = useState(false);
  const opened = useRef(false);

  // Opening a lesson makes it the "continue" lesson.
  useEffect(() => {
    if (allowed && !opened.current && level && slug) {
      opened.current = true;
      openLesson(level, slug).catch(() => {});
    }
  }, [allowed, level, slug, openLesson]);

  if (!user) return <Redirect href="/welcome" />;
  // Locked or unknown lessons go back to the dashboard (also when typed as a link).
  if (!level || !lesson || !allowed) return <Redirect href="/learn" />;

  const prev = index > 0 && hasLesson(level, items[index - 1].slug) ? items[index - 1] : null;
  const next = index >= 0 && index < items.length - 1 ? items[index + 1] : null;
  const nextOpen = next && hasLesson(level, next.slug) && isUnlocked(level, next.slug, progress, curriculumData, hasLesson);

  const finish = async () => {
    await completeLesson(level, slug!);
    setToast(true);
    setTimeout(() => {
      setToast(false);
      router.push(`/quiz/${level}/${slug}`);
    }, 700);
  };

  return (
    <>
      <Stack.Screen options={{ title: t(lang, 'lessonOf', { level, n: index + 1, total: items.length }) }} />
      <Screen>
        <Pressable onPress={() => router.dismissTo('/learn')} accessibilityRole="link" style={styles.back}>
          <Text style={styles.backText}>← {t(lang, 'backToDashboard')}</Text>
        </Pressable>
        <Text style={styles.kicker}>{t(lang, 'lessonOf', { level, n: index + 1, total: items.length })}</Text>
        <Text style={type.title}>{pick(lesson.title, lang)}</Text>
        <LessonContent lesson={lesson} />

        <View style={{ marginTop: space.xl }}>
          <AppButton title={t(lang, 'markCompleteQuiz')} onPress={finish} />
        </View>
        <View style={styles.nav}>
          {prev ? (
            <View style={styles.navItem}>
              <AppButton title={`← ${t(lang, 'previous')}`} variant="secondary" onPress={() => router.replace(`/learn/${level}/${prev.slug}`)} />
            </View>
          ) : null}
          {next ? (
            <View style={styles.navItem}>
              <AppButton
                title={t(lang, 'nextLessonTitle', { title: pick(next.title, lang) })}
                variant="secondary"
                disabled={!nextOpen}
                onPress={() => router.replace(`/learn/${level}/${next.slug}`)}
              />
            </View>
          ) : null}
        </View>
      </Screen>
      {toast && (
        <View style={styles.toast} accessibilityLiveRegion="polite">
          <Text style={styles.toastText}>✓ {t(lang, 'lessonMarkedComplete')}</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  back: { minHeight: 36, justifyContent: 'center' },
  backText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  kicker: { color: colors.brassText, fontSize: 14, fontWeight: '700', marginTop: space.sm },
  nav: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },
  navItem: { flex: 1 },
  toast: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
    backgroundColor: colors.success,
    borderRadius: 24,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  toastText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
