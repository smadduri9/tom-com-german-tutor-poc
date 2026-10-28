import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { AppButton } from '../../src/components/AppButton';
import { ProgressBar } from '../../src/components/ProgressBar';
import { TextField } from '../../src/components/TextField';
import { LanguageSwitch } from '../../src/components/LanguageSwitch';
import { Card, Section } from '../../src/components/Section';
import { useApp } from '../../src/state/AppContext';
import { backend } from '../../src/backend';
import { curriculumData } from '../../src/data/lessons';
import { levelCompletedCount, levelPercent, profileStats } from '../../src/logic/progress';
import { errorMessage, formatDay, levelName } from '../../src/i18n/levels';
import { t } from '../../src/i18n/t';
import { LEVELS } from '../../src/types';
import { colors, fonts, space, type } from '../../src/theme';

export default function ProfileTab() {
  const { lang, user, progress, certificates, updateName, signOut, markLevelPassedDemo } = useApp();
  const [name, setName] = useState(user?.fullName ?? '');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const stats = profileStats(progress);

  useEffect(() => setName(user?.fullName ?? ''), [user?.fullName]);

  if (!user) return null;

  const run = async (fn: () => Promise<void>, ok: string) => {
    setMsg(null);
    try {
      await fn();
      setMsg({ text: ok, ok: true });
    } catch (e) {
      setMsg({ text: errorMessage(lang, e), ok: false });
    }
  };

  return (
    <Screen>
      <View style={styles.head}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user.fullName || user.email).trim().charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={type.heading}>{user.fullName || '—'}</Text>
          <Text style={type.small}>{user.email}</Text>
          <Text style={type.small}>{t(lang, 'memberSince', { d: formatDay(user.createdAt, lang) })}</Text>
        </View>
      </View>

      <View style={styles.stats}>
        {[
          { v: stats.lessonsCompleted, l: t(lang, 'statLessonsCompleted') },
          { v: stats.quizzesPassed, l: t(lang, 'statQuizzesPassed') },
          { v: `${stats.averageScore}%`, l: t(lang, 'statAverage') },
        ].map((s) => (
          <View key={s.l} style={styles.stat}>
            <Text style={styles.statValue}>{s.v}</Text>
            <Text style={styles.statLabel}>{s.l}</Text>
          </View>
        ))}
      </View>

      <Section title={t(lang, 'progressTitle')}>
        <Card>
          {LEVELS.map((level) => {
            const pct = levelPercent(level, progress, curriculumData);
            return (
              <View key={level} style={{ marginVertical: space.xs }}>
                <View style={styles.rowBetween}>
                  <Text style={styles.levelLabel}>{levelName(lang, level)}</Text>
                  <Text style={type.small}>
                    {t(lang, 'levelProgress', { done: levelCompletedCount(level, progress, curriculumData), total: curriculumData[level].length, p: pct })}
                  </Text>
                </View>
                <ProgressBar percent={pct} />
              </View>
            );
          })}
        </Card>
      </Section>

      <Section title={t(lang, 'certsTitle')}>
        {certificates.length === 0 ? (
          <Text style={[type.small, { marginTop: space.sm }]}>{t(lang, 'noCertsYet')}</Text>
        ) : (
          certificates.map((c) => (
            <Pressable key={c.id} onPress={() => router.push(`/certificate/${c.id}`)} accessibilityRole="button">
              <Card style={styles.rowBetween}>
                <Text style={styles.levelLabel}>🏆 {levelName(lang, c.level)}</Text>
                <Text style={type.small}>{c.score}%</Text>
              </Card>
            </Pressable>
          ))
        )}
      </Section>

      <Section title={t(lang, 'accountTitle')}>
        <TextField label={t(lang, 'fullName')} value={name} onChangeText={setName} />
        <AppButton title={t(lang, 'save')} variant="secondary" disabled={!name.trim() || name === user.fullName} onPress={() => run(() => updateName(name), t(lang, 'saved'))} />

        <View style={[styles.rowBetween, { marginTop: space.lg }]}>
          <Text style={styles.levelLabel}>{t(lang, 'language')}</Text>
          <LanguageSwitch />
        </View>

        <TextField label={t(lang, 'changePassword')} hint={t(lang, 'passwordHint')} value={password} onChangeText={setPassword} secret textContentType="newPassword" />
        <AppButton
          title={t(lang, 'updatePassword')}
          variant="secondary"
          disabled={password.length < 6}
          onPress={() =>
            run(async () => {
              await backend.changePassword(password);
              setPassword('');
            }, t(lang, 'passwordUpdated'))
          }
        />
        <Pressable onPress={() => router.push({ pathname: '/login/forgot', params: { email: user.email } })} accessibilityRole="link" style={styles.link}>
          <Text style={styles.linkText}>{t(lang, 'forgotSendCode')}</Text>
        </Pressable>
        {msg ? <Text style={{ color: msg.ok ? colors.success : colors.error, marginTop: space.sm }}>{msg.text}</Text> : null}
      </Section>

      <AppButton
        title={t(lang, 'signOut')}
        variant="ghost"
        onPress={async () => {
          await signOut();
          router.replace('/welcome');
        }}
      />

      {__DEV__ && (
        <Section title={t(lang, 'devTools')}>
          <AppButton
            title={t(lang, 'devMarkA1')}
            variant="secondary"
            onPress={async () => {
              const cert = (await markLevelPassedDemo('A1')) ?? certificates.find((c) => c.level === 'A1');
              if (cert) router.push(`/certificate/${cert.id}`);
              else Alert.alert(t(lang, 'errNetwork'));
            }}
          />
        </Section>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontSize: 28, fontFamily: fonts.serif },
  stats: { flexDirection: 'row', gap: space.sm, marginTop: space.lg },
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: space.sm, alignItems: 'center' },
  statValue: { fontSize: 24, lineHeight: 32, fontFamily: fonts.serif, color: colors.primary },
  statLabel: { fontSize: 12, lineHeight: 18, color: colors.muted, textAlign: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
  link: { minHeight: 44, justifyContent: 'center', alignItems: 'center', marginTop: space.sm },
  linkText: { color: colors.primary, fontSize: 15, fontWeight: '600', textDecorationLine: 'underline' },
});
