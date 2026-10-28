import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { AppButton } from '../../src/components/AppButton';
import { ProgressBar } from '../../src/components/ProgressBar';
import { Card } from '../../src/components/Section';
import { hasLesson, useApp } from '../../src/state/AppContext';
import { curriculumData } from '../../src/data/lessons';
import { continueLesson, findRow, isUnlocked, levelCompletedCount, levelPercent } from '../../src/logic/progress';
import { levelName } from '../../src/i18n/levels';
import { pick, t } from '../../src/i18n/t';
import { LEVELS, type Level } from '../../src/types';
import { colors, space, type } from '../../src/theme';

export default function Dashboard() {
  const { lang, user, progress } = useApp();
  const next = continueLesson(progress, curriculumData, hasLesson);
  const nextItem = next && curriculumData[next.level].find((i) => i.slug === next.slug);
  const started = progress.length > 0;

  const open = (level: Level, slug: string) => router.push(`/learn/${level}/${slug}`);

  return (
    <Screen>
      <Text style={type.title}>{t(lang, 'hello', { name: user?.fullName?.split(' ')[0] || '👋' })}</Text>

      {next && nextItem ? (
        <Card style={styles.continue}>
          <Text style={styles.kicker}>{started ? t(lang, 'continueTitle') : t(lang, 'startHere')}</Text>
          <Text style={styles.continueTitle}>
            {next.level} · {pick(nextItem.title, lang)}
          </Text>
          <Text style={styles.continueTopic}>{pick(nextItem.topic, lang)}</Text>
          <AppButton variant="accent" title={started ? t(lang, 'resume') : t(lang, 'start')} onPress={() => open(next.level, next.slug)} />
        </Card>
      ) : (
        <Card>
          <Text style={type.body}>{t(lang, 'allDone')}</Text>
        </Card>
      )}

      {LEVELS.map((level) => {
        const items = curriculumData[level];
        const pct = levelPercent(level, progress, curriculumData);
        return (
          <View key={level} style={styles.level}>
            <View style={styles.levelHead}>
              <Text style={type.heading}>{levelName(lang, level)}</Text>
              <Text style={type.small}>
                {t(lang, 'levelProgress', { done: levelCompletedCount(level, progress, curriculumData), total: items.length, p: pct })}
              </Text>
            </View>
            <ProgressBar percent={pct} label={`${levelName(lang, level)} ${pct}%`} />
            {items.map((item, i) => {
              const available = hasLesson(level, item.slug);
              const unlocked = isUnlocked(level, item.slug, progress, curriculumData, hasLesson);
              const row = findRow(progress, level, item.slug);
              const done = Boolean(row?.lessonCompleted);
              const canOpen = available && unlocked;
              let right: React.ReactNode;
              if (!available) right = <Text style={styles.muted}>{t(lang, 'comingSoon')}</Text>;
              else if (!unlocked) right = <Text style={styles.muted}>🔒 {t(lang, 'locked')}</Text>;
              else if (row)
                right = (
                  <View style={styles.right}>
                    {typeof row.quizScore === 'number' && <Text style={styles.pill}>{row.quizScore}%</Text>}
                    <Text style={styles.action}>{t(lang, 'resume')}</Text>
                  </View>
                );
              else right = <Text style={styles.action}>{t(lang, 'start')}</Text>;
              return (
                <Pressable
                  key={item.slug}
                  disabled={!canOpen}
                  onPress={() => open(level, item.slug)}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !canOpen }}
                  style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
                >
                  <Text style={[styles.icon, done && { color: colors.success }]}>{done ? '✓' : canOpen ? '▶' : '○'}</Text>
                  <View style={styles.rowText}>
                    <Text style={[styles.rowTitle, !canOpen && { color: colors.locked }]}>
                      {i + 1}. {pick(item.title, lang)}
                    </Text>
                    <Text style={styles.rowTopic} numberOfLines={1}>
                      {pick(item.topic, lang)}
                    </Text>
                  </View>
                  {right}
                </Pressable>
              );
            })}
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  continue: { backgroundColor: colors.primary, borderColor: colors.primary, marginTop: space.md },
  kicker: { color: colors.brassLight, fontSize: 13, lineHeight: 20, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  continueTitle: { color: colors.white, fontSize: 20, lineHeight: 30, fontWeight: '700', marginTop: space.xs },
  continueTopic: { color: colors.primaryTint, fontSize: 15, lineHeight: 22, marginBottom: space.sm },
  level: { marginTop: space.xl },
  levelHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: space.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: space.sm,
  },
  icon: { width: 22, textAlign: 'center', fontSize: 16, color: colors.primary, fontWeight: '700' },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 16, lineHeight: 24, fontWeight: '600', color: colors.text },
  rowTopic: { fontSize: 13, lineHeight: 20, color: colors.muted },
  right: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  pill: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
    backgroundColor: colors.successBg,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  action: { fontSize: 15, fontWeight: '700', color: colors.primary },
  muted: { fontSize: 13, color: colors.locked },
});
