import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ScrollViewInstance } from 'react-native';
import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import { AppButton } from '../../../src/components/AppButton';
import { Card } from '../../../src/components/Section';
import { useAudio } from '../../../src/audio/AudioContext';
import { hasLesson, useApp } from '../../../src/state/AppContext';
import { curriculumData, lessons } from '../../../src/data/lessons';
import { isPass, scorePercent, scoreQuiz } from '../../../src/logic/quiz';
import { levelName } from '../../../src/i18n/levels';
import { pick, t } from '../../../src/i18n/t';
import type { Certificate } from '../../../src/backend';
import { LEVELS, type Lang, type Level, type QuizOption } from '../../../src/types';
import { colors, space, type } from '../../../src/theme';

function optionLabel(o: QuizOption, lang: Lang): string {
  return o.text ? pick(o.text, lang) : (o.de ?? '');
}

export default function QuizScreen() {
  const { level: rawLevel, slug } = useLocalSearchParams<{ level: string; slug: string }>();
  const { lang, user, recordQuiz } = useApp();
  const { play } = useAudio();
  const level = (LEVELS as string[]).includes(rawLevel ?? '') ? (rawLevel as Level) : null;
  const lesson = level && slug ? lessons[level]?.[slug] : undefined;
  const [answers, setAnswers] = useState<(number | null)[]>(() => (lesson?.quiz ?? []).map(() => null));
  const [result, setResult] = useState<{ percent: number; cert: Certificate | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const scroll = useRef<ScrollViewInstance>(null);

  if (!user) return <Redirect href="/welcome" />;
  if (!level || !lesson) return <Redirect href="/learn" />;

  const questions = lesson.quiz;
  const items = curriculumData[level];
  const index = items.findIndex((i) => i.slug === slug);
  const next = index >= 0 && index < items.length - 1 ? items[index + 1] : null;
  const allAnswered = answers.every((a) => a !== null);

  const submit = async () => {
    setBusy(true);
    const percent = scorePercent(scoreQuiz(answers, questions), questions.length);
    try {
      const cert = await recordQuiz(level, slug!, percent);
      setResult({ percent, cert });
    } catch {
      setResult({ percent, cert: null });
    } finally {
      setBusy(false);
      scroll.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const retry = () => {
    setAnswers(questions.map(() => null));
    setResult(null);
    scroll.current?.scrollTo({ y: 0, animated: false });
  };

  const passed = result ? isPass(result.percent) : false;

  return (
    <>
      <Stack.Screen options={{ title: t(lang, 'quizTitle', { title: pick(lesson.title, lang) }) }} />
      <ScrollView ref={scroll} style={styles.flex} contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
        <Pressable onPress={() => router.back()} accessibilityRole="link" style={styles.back}>
          <Text style={styles.backText}>← {t(lang, 'backToLesson')}</Text>
        </Pressable>
        <Text style={type.title}>{t(lang, 'quizTitle', { title: pick(lesson.title, lang) })}</Text>
        <Text style={type.small}>{t(lang, 'passRequired')}</Text>

        {result && (
          <Card style={[styles.result, { backgroundColor: passed ? colors.successBg : colors.errorBg, borderColor: passed ? colors.success : colors.error }]}>
            <Text style={styles.resultIcon}>{passed ? '🏆' : '💪'}</Text>
            <Text style={[type.title, { textAlign: 'center' }]}>{passed ? t(lang, 'youPassed') : t(lang, 'tryAgain')}</Text>
            <Text style={[type.heading, { textAlign: 'center' }]}>{t(lang, 'scorePct', { p: result.percent })}</Text>
            {result.cert && (
              <>
                <Text style={[type.body, { textAlign: 'center', marginTop: space.sm }]}>
                  🎉 {t(lang, 'certEarned', { level: levelName(lang, result.cert.level) })}
                </Text>
                <AppButton title={t(lang, 'viewCertificate')} onPress={() => router.push(`/certificate/${result.cert!.id}`)} />
              </>
            )}
          </Card>
        )}

        {questions.map((q, qi) => {
          const chosen = answers[qi];
          const right = result && chosen === q.correctIndex;
          return (
            <Card key={q.id} style={{ marginTop: space.md }}>
              <Text style={styles.qNum}>
                {qi + 1}. {result ? (right ? '✓' : '✗') : ''}
              </Text>
              <Text style={type.body}>{pick(q.prompt, lang)}</Text>
              {q.kind === 'listening' && (
                <Pressable
                  onPress={() => play(q.audioId, q.audio_de ?? '')}
                  accessibilityRole="button"
                  accessibilityLabel={t(lang, 'tapToHearGerman')}
                  style={({ pressed }) => [styles.listen, pressed && { opacity: 0.8 }]}
                >
                  <Text style={styles.listenText}>🔊 {t(lang, 'tapToHearGerman')}</Text>
                </Pressable>
              )}
              {q.options.map((o, oi) => {
                const sel = chosen === oi;
                const showWrong = result && sel && !right;
                return (
                  <Pressable
                    key={oi}
                    disabled={Boolean(result)}
                    onPress={() => setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: sel, disabled: Boolean(result) }}
                    style={[styles.option, sel && styles.optionSel, result && sel && right && styles.optionRight, showWrong && styles.optionWrong]}
                  >
                    <View style={[styles.radio, sel && styles.radioSel]} />
                    <Text style={[styles.optionText, o.de && !o.text ? styles.german : null]}>{optionLabel(o, lang)}</Text>
                  </Pressable>
                );
              })}
              {result && (
                <View style={{ marginTop: space.sm }}>
                  {!right && (
                    <Text style={styles.correct}>{t(lang, 'correctAnswer', { a: optionLabel(q.options[q.correctIndex], lang) })}</Text>
                  )}
                  <Text style={type.small}>{pick(q.explanation, lang)}</Text>
                </View>
              )}
            </Card>
          );
        })}

        {!result ? (
          <View style={{ marginTop: space.lg }}>
            {!allAnswered && <Text style={[type.small, { textAlign: 'center' }]}>{t(lang, 'answerAll', { n: questions.length })}</Text>}
            <AppButton title={t(lang, 'submit')} onPress={submit} disabled={!allAnswered || busy} />
          </View>
        ) : (
          <View style={{ marginTop: space.lg }}>
            <AppButton title={t(lang, 'retryQuiz')} variant="secondary" onPress={retry} />
            {next && hasLesson(level, next.slug) ? (
              <AppButton title={t(lang, 'nextLesson')} onPress={() => router.replace(`/learn/${level}/${next.slug}`)} />
            ) : (
              <AppButton title={t(lang, 'backToDashboard')} onPress={() => router.dismissTo('/learn')} />
            )}
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.md, paddingBottom: space.xl * 2 },
  back: { minHeight: 36, justifyContent: 'center' },
  backText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  result: { alignItems: 'stretch', marginTop: space.md, borderWidth: 2 },
  resultIcon: { fontSize: 44, lineHeight: 56, textAlign: 'center' },
  qNum: { fontSize: 14, fontWeight: '700', color: colors.brassText },
  listen: {
    marginTop: space.sm,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listenText: { color: colors.onAccent, fontSize: 16, fontWeight: '700' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: space.sm,
    marginTop: space.sm,
    backgroundColor: colors.white,
    minHeight: 50,
  },
  optionSel: { borderColor: colors.primary },
  optionRight: { borderColor: colors.success, backgroundColor: colors.successBg },
  optionWrong: { borderColor: colors.error, backgroundColor: colors.errorBg },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.muted },
  radioSel: { borderColor: colors.primary, backgroundColor: colors.primary },
  optionText: { flex: 1, fontSize: 16, lineHeight: 24, color: colors.text },
  german: { fontWeight: '700', color: colors.primary },
  correct: { fontSize: 15, lineHeight: 22, fontWeight: '700', color: colors.success },
});
