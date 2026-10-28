import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { Screen } from '../src/components/Screen';
import { AppButton } from '../src/components/AppButton';
import { AudioButtons } from '../src/components/AudioButtons';
import { LessonProgressTitle } from '../src/components/LessonProgressTitle';
import { useApp } from '../src/state/AppContext';
import { lessons } from '../src/data/lessons';
import { buildSteps, clampStep } from '../src/logic/steps';
import { pick, t } from '../src/i18n/t';
import type { Lang, VocabItem } from '../src/types';
import { colors, space, type } from '../src/theme';

function PhraseCard({ phrase, lang, n, total }: { phrase: VocabItem; lang: Lang; n: number; total: number }) {
  const [shown, setShown] = useState(false);
  return (
    <View>
      <Text style={type.small}>{t(lang, 'phrasesTitle', { n, total })}</Text>
      <View style={styles.card}>
        <Text style={type.german}>{phrase.de}</Text>
        <AudioButtons audioId={phrase.id} german={phrase.de} />
        {shown ? (
          <Text style={[type.heading, { marginTop: space.md }]}>{pick(phrase.meaning, lang)}</Text>
        ) : (
          <Pressable onPress={() => setShown(true)} accessibilityRole="button" style={styles.reveal}>
            <Text style={styles.revealText}>{t(lang, 'showMeaning')}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function LessonScreen() {
  const { lang, progress, saveStep } = useApp();
  const lesson = lessons.A1.greetings;
  const steps = useMemo(() => buildSteps(lesson), []);
  const [idx, setIdx] = useState(() => clampStep(progress.step, steps.length));

  useEffect(() => {
    saveStep(idx);
  }, [idx, saveStep]);

  const step = steps[idx];
  const isLast = idx === steps.length - 1;

  let body: React.ReactNode = null;
  if (step.kind === 'intro') {
    body = (
      <View>
        <Text style={type.title}>{pick(lesson.title, lang)}</Text>
        <Text style={[type.heading, { marginTop: space.md }]}>{t(lang, 'introTitle')}</Text>
        <Text style={type.body}>{pick(lesson.intro, lang)}</Text>
      </View>
    );
  } else if (step.kind === 'vocab') {
    const phrase = lesson.vocabulary[step.index];
    // key resets the "show meaning" state for each new card
    body = (
      <PhraseCard key={phrase.id} phrase={phrase} lang={lang} n={step.index + 1} total={lesson.vocabulary.length} />
    );
  } else if (step.kind === 'dialogue') {
    body = (
      <View>
        <Text style={type.heading}>{t(lang, 'dialogueTitle')}</Text>
        <Text style={type.small}>{pick(lesson.dialogue.scene, lang)}</Text>
        {lesson.dialogue.lines.map((line) => {
          const isRavi = line.speaker === 'Ravi';
          return (
            <View key={line.id} style={[styles.bubble, isRavi ? styles.bubbleRight : styles.bubbleLeft]}>
              <Text style={styles.speaker}>{line.speaker}</Text>
              <Text style={[type.body, { fontWeight: '700', color: colors.primary }]}>{line.de}</Text>
              <Text style={type.small}>{pick(line.meaning, lang)}</Text>
              <AudioButtons audioId={line.id} german={line.de} />
            </View>
          );
        })}
      </View>
    );
  } else if (step.kind === 'grammar') {
    body = (
      <View>
        <Text style={type.heading}>{pick(lesson.grammar_note.title, lang)}</Text>
        <Text style={[type.body, { marginTop: space.sm }]}>{pick(lesson.grammar_note.body, lang)}</Text>
        <Text style={[type.body, { marginTop: space.md }]}>{pick(lesson.deep_dive, lang)}</Text>
      </View>
    );
  } else {
    body = (
      <View>
        <Text style={type.heading}>{t(lang, 'pronTitle')}</Text>
        <View style={styles.card}>
          <Text style={type.body}>{pick(lesson.practice_tip, lang)}</Text>
        </View>
        {lesson.common_mistakes.map((m) => (
          <View key={m.wrong} style={styles.card}>
            <Text style={styles.speaker}>✗ {m.wrong}</Text>
            <Text style={[type.german, { marginTop: space.xs }]}>✓ {m.right}</Text>
            <Text style={type.small}>{pick(m.why, lang)}</Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <LessonProgressTitle
              title={t(lang, 'lessonTitle')}
              fraction={(idx + 1) / steps.length}
              label={`${idx + 1} / ${steps.length}`}
            />
          ),
        }}
      />
      {body}
      <View style={styles.nav}>
        <View style={styles.navItem}>
          <AppButton
            title={t(lang, 'back')}
            variant="secondary"
            disabled={idx === 0}
            onPress={() => setIdx((i) => Math.max(0, i - 1))}
          />
        </View>
        <View style={styles.navItem}>
          <AppButton
            title={isLast ? t(lang, 'startQuiz') : t(lang, 'next')}
            onPress={() => (isLast ? router.push('/quiz') : setIdx((i) => Math.min(steps.length - 1, i + 1)))}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: space.md,
    marginTop: space.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reveal: {
    marginTop: space.md,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealText: { fontSize: 16, lineHeight: 24, color: colors.muted, fontWeight: '600' },
  bubble: { borderRadius: 14, padding: space.sm, marginTop: space.sm, maxWidth: '92%' },
  bubbleLeft: { alignSelf: 'flex-start', backgroundColor: colors.surface },
  bubbleRight: { alignSelf: 'flex-end', backgroundColor: '#EAF0F6' },
  speaker: { fontSize: 13, lineHeight: 20, fontWeight: '700', color: colors.accentText },
  focus: { fontSize: 32, lineHeight: 40, fontWeight: '700', color: colors.accentText },
  nav: { flexDirection: 'row', gap: space.sm, marginTop: space.lg },
  navItem: { flex: 1 },
});
