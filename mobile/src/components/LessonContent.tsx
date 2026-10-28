import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AudioButtons } from './AudioButtons';
import { Card, Section } from './Section';
import { useApp } from '../state/AppContext';
import { pick, t } from '../i18n/t';
import type { Lesson } from '../types';
import { colors, space, type } from '../theme';

function SelfCheck({ question, answer }: { question: string; answer: string }) {
  const { lang } = useApp();
  const [shown, setShown] = useState(false);
  return (
    <Card>
      <Text style={type.body}>{question}</Text>
      {shown ? (
        <Text style={styles.answer}>{answer}</Text>
      ) : (
        <Pressable onPress={() => setShown(true)} accessibilityRole="button" style={styles.reveal}>
          <Text style={styles.revealText}>{t(lang, 'showAnswer')}</Text>
        </Pressable>
      )}
    </Card>
  );
}

// Every section of a lesson, in the order of the parity plan (section 1.6).
export function LessonContent({ lesson }: { lesson: Lesson }) {
  const { lang } = useApp();
  const speakers = Array.from(new Set(lesson.dialogue.lines.map((l) => l.speaker)));
  return (
    <View>
      <Text style={[type.body, { marginTop: space.sm }]}>{pick(lesson.intro, lang)}</Text>

      <Section title={t(lang, 'vocabulary')}>
        {lesson.vocabulary.map((v) => (
          <Card key={v.id}>
            <View style={styles.vocabRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.de}>{v.de}</Text>
                <Text style={type.body}>{pick(v.meaning, lang)}</Text>
                {v.ipa ? <Text style={type.small}>{v.ipa}</Text> : null}
                {v.note ? <Text style={type.small}>{pick(v.note, lang)}</Text> : null}
              </View>
              <AudioButtons audioId={v.id} german={v.de} compact />
            </View>
          </Card>
        ))}
      </Section>

      <Section title={t(lang, 'examples')}>
        {lesson.examples.map((e) => (
          <Card key={e.id}>
            <View style={styles.vocabRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.deSmall}>{e.de}</Text>
                <Text style={type.small}>{pick(e.meaning, lang)}</Text>
              </View>
              <AudioButtons german={e.de} compact />
            </View>
          </Card>
        ))}
      </Section>

      <Section title={pick(lesson.grammar_note.title, lang)}>
        <Text style={[type.body, { marginTop: space.sm }]}>{pick(lesson.grammar_note.body, lang)}</Text>
      </Section>

      <Card style={styles.tip}>
        <Text style={styles.tipTitle}>💡 {t(lang, 'practiceTip')}</Text>
        <Text style={type.body}>{pick(lesson.practice_tip, lang)}</Text>
      </Card>

      <Section title={t(lang, 'deepDive')}>
        <Text style={[type.body, { marginTop: space.sm }]}>{pick(lesson.deep_dive, lang)}</Text>
      </Section>

      <Section title={t(lang, 'moreVocabulary')}>
        <Card>
          {lesson.more_vocabulary.map((m) => (
            <View key={m.id} style={styles.moreRow}>
              <Text style={styles.moreDe}>{m.de}</Text>
              <Text style={styles.moreMeaning}>{pick(m.meaning, lang)}</Text>
            </View>
          ))}
        </Card>
      </Section>

      {lesson.dialogue.lines.length > 0 && (
        <Section title={t(lang, 'sampleDialogue')}>
          <Text style={styles.scene}>{pick(lesson.dialogue.scene, lang)}</Text>
          {lesson.dialogue.lines.map((line) => {
            const right = line.speaker === speakers[1];
            return (
              <View key={line.id} style={[styles.bubble, right ? styles.bubbleRight : styles.bubbleLeft]}>
                <Text style={styles.speaker}>{line.speaker}</Text>
                <Text style={styles.lineDe}>{line.de}</Text>
                <Text style={type.small}>{pick(line.meaning, lang)}</Text>
                <View style={{ marginTop: space.xs }}>
                  <AudioButtons audioId={line.id} german={line.de} compact />
                </View>
              </View>
            );
          })}
        </Section>
      )}

      {lesson.cultural_note && (
        <Card style={styles.culture}>
          <Text style={styles.tipTitle}>🇩🇪 {t(lang, 'culturalNote')}</Text>
          <Text style={type.body}>{pick(lesson.cultural_note, lang)}</Text>
        </Card>
      )}

      <Section title={t(lang, 'commonMistakes')}>
        {lesson.common_mistakes.map((m) => (
          <Card key={m.wrong}>
            <Text style={styles.wrong}>✗ {m.wrong}</Text>
            <Text style={styles.right}>✓ {m.right}</Text>
            <Text style={type.small}>{pick(m.why, lang)}</Text>
          </Card>
        ))}
      </Section>

      <Section title={t(lang, 'quickExercises')}>
        {lesson.self_check.map((s, i) => (
          <SelfCheck key={i} question={pick(s.question, lang)} answer={pick(s.answer, lang)} />
        ))}
      </Section>
    </View>
  );
}

const styles = StyleSheet.create({
  vocabRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  de: { fontSize: 22, lineHeight: 30, fontWeight: '700', color: colors.primary },
  deSmall: { fontSize: 18, lineHeight: 26, fontWeight: '700', color: colors.primary },
  tip: { backgroundColor: '#FFF8EC', borderColor: colors.brassLight, marginTop: space.lg },
  culture: { backgroundColor: '#EEF3F8', borderColor: colors.primaryTint, marginTop: space.lg },
  tipTitle: { fontSize: 16, lineHeight: 24, fontWeight: '700', color: colors.brassText, marginBottom: space.xs },
  moreRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: space.xs, gap: space.sm },
  moreDe: { fontSize: 16, lineHeight: 24, fontWeight: '700', color: colors.primary, flex: 1 },
  moreMeaning: { fontSize: 15, lineHeight: 24, color: colors.text, flex: 1, textAlign: 'right' },
  scene: { fontSize: 13, lineHeight: 20, fontWeight: '700', letterSpacing: 1, color: colors.brassText, marginTop: space.sm, textTransform: 'uppercase' },
  bubble: { borderRadius: 14, padding: space.sm, marginTop: space.sm, maxWidth: '92%' },
  bubbleLeft: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  bubbleRight: { alignSelf: 'flex-end', backgroundColor: '#EAF0F6' },
  speaker: { fontSize: 13, lineHeight: 20, fontWeight: '700', color: colors.accentText },
  lineDe: { fontSize: 17, lineHeight: 26, fontWeight: '700', color: colors.primary },
  wrong: { fontSize: 16, lineHeight: 24, color: colors.error, textDecorationLine: 'line-through' },
  right: { fontSize: 16, lineHeight: 24, color: colors.success, fontWeight: '700' },
  answer: { fontSize: 17, lineHeight: 26, fontWeight: '700', color: colors.primary, marginTop: space.sm },
  reveal: {
    marginTop: space.sm,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealText: { fontSize: 15, color: colors.muted, fontWeight: '600' },
});
