import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../src/components/Screen';
import { AppButton } from '../src/components/AppButton';
import { AudioButtons } from '../src/components/AudioButtons';
import { useApp } from '../src/state/AppContext';
import { lessons } from '../src/data/lessons';
import { scoreQuiz } from '../src/logic/quiz';
import { pick, t } from '../src/i18n/t';
import type { Lang, QuizOption } from '../src/types';
import { colors, space, type } from '../src/theme';

function optionLabel(o: QuizOption, lang: Lang): string {
  return o.text ? pick(o.text, lang) : (o.de ?? '');
}

export default function QuizScreen() {
  const { lang, recordQuiz } = useApp();
  const questions = lessons.A1.greetings.quiz;
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));

  const q = questions[qi];
  const isLast = qi === questions.length - 1;
  const isCorrect = checked && selected === q.correctIndex;

  const onCheck = () => {
    if (selected === null) return;
    setAnswers((a) => a.map((v, i) => (i === qi ? selected : v)));
    setChecked(true);
  };

  const onNext = () => {
    if (isLast) {
      const finalAnswers = answers.map((v, i) => (i === qi ? selected : v));
      const score = scoreQuiz(finalAnswers, questions);
      recordQuiz(score);
      router.replace({ pathname: '/result', params: { score: String(score) } });
      return;
    }
    setQi((i) => i + 1);
    setSelected(null);
    setChecked(false);
  };

  return (
    <Screen>
      <Text style={type.small}>{t(lang, 'questionOf', { n: qi + 1, total: questions.length })}</Text>
      <Text style={[type.heading, { marginTop: space.xs }]}>{pick(q.prompt, lang)}</Text>
      {q.audioId && <AudioButtons audioId={q.audioId} german={q.audio_de ?? ""} />}

      <View style={{ marginTop: space.md }}>
        {q.options.map((o, i) => {
          const isSel = selected === i;
          const showRight = checked && i === q.correctIndex;
          const showWrong = checked && isSel && i !== q.correctIndex;
          return (
            <Pressable
              key={`${q.id}-${i}`}
              disabled={checked}
              onPress={() => setSelected(i)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSel, disabled: checked }}
              style={[
                styles.option,
                isSel && styles.optionSel,
                showRight && styles.optionRight,
                showWrong && styles.optionWrong,
              ]}
            >
              <Text style={[type.body, o.de && !o.text ? styles.germanOpt : null]}>{optionLabel(o, lang)}</Text>
            </Pressable>
          );
        })}
      </View>

      {checked && (
        <Text style={[styles.feedback, { color: isCorrect ? colors.success : colors.error }]}>
          {isCorrect
            ? t(lang, 'correct')
            : t(lang, 'incorrect', { answer: optionLabel(q.options[q.correctIndex], lang) })}
        </Text>
      )}
      {checked && <Text style={type.small}>{pick(q.explanation, lang)}</Text>}

      {!checked ? (
        <AppButton title={t(lang, 'check')} onPress={onCheck} disabled={selected === null} />
      ) : (
        <AppButton title={isLast ? t(lang, 'seeResult') : t(lang, 'next')} onPress={onNext} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  option: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: space.md,
    marginBottom: space.sm,
    backgroundColor: colors.white,
    minHeight: 52,
    justifyContent: 'center',
  },
  optionSel: { borderColor: colors.primary, backgroundColor: colors.surface },
  optionRight: { borderColor: colors.success, backgroundColor: colors.successBg },
  optionWrong: { borderColor: colors.error, backgroundColor: colors.errorBg },
  germanOpt: { fontWeight: '700', color: colors.primary },
  feedback: { fontSize: 17, lineHeight: 26, fontWeight: '700', marginTop: space.sm },
});
