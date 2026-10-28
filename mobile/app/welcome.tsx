import React, { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setStatusBarStyle } from 'expo-status-bar';
import { LanguageSwitch } from '../src/components/LanguageSwitch';
import { useAudio } from '../src/audio/AudioContext';
import { useApp } from '../src/state/AppContext';
import { pick, t } from '../src/i18n/t';
import { curriculumData, lessons } from '../src/data/lessons';
import { colors, fonts, space } from '../src/theme';

// Four short phrases from the free lesson, tappable to hear them.
const SAMPLE_IDS = ['p01', 'p02', 'p07', 'p13'];
const SAMPLES = lessons.A1.greetings.vocabulary.filter((v) => SAMPLE_IDS.includes(v.id));
const LESSON_COUNT = curriculumData.A1.length + curriculumData.A2.length + curriculumData.B1.length;

export default function WelcomeScreen() {
  const { lang } = useApp();
  const { play } = useAudio();

  // Light status bar text on the blue page only; other screens are white.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, []),
  );

  const features = [
    { icon: '🗣', title: t(lang, 'feature1Title'), body: t(lang, 'feature1Body') },
    { icon: '🔊', title: t(lang, 'feature2Title'), body: t(lang, 'feature2Body') },
    { icon: '🏅', title: t(lang, 'feature3Title'), body: t(lang, 'feature3Body') },
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Text style={styles.logo} accessibilityRole="header">
            TOMCOM <Text style={styles.logoAccent}>Deutsch</Text>
          </Text>
          <LanguageSwitch onDark />
        </View>

        <Text style={styles.kicker}>{t(lang, 'heroLevels')}</Text>
        <Text style={styles.title}>{t(lang, 'heroTitle')}</Text>
        <View style={styles.rule} />
        <Text style={styles.sub}>{t(lang, 'heroSub')}</Text>

        <View style={styles.stats}>
          {[
            { v: String(LESSON_COUNT), l: t(lang, 'statLessons') },
            { v: 'A1→B1', l: t(lang, 'statLevels') },
            { v: '3', l: t(lang, 'statLanguages') },
          ].map((s) => (
            <View key={s.l} style={styles.stat}>
              <Text style={styles.statValue}>{s.v}</Text>
              <Text style={styles.statLabel}>{s.l}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.section}>{t(lang, 'tapToHear')}</Text>
        <View style={styles.samples}>
          {SAMPLES.map((v) => (
            <Pressable
              key={v.id}
              onPress={() => play(v.id, v.de)}
              accessibilityRole="button"
              accessibilityLabel={`${v.de}, ${pick(v.meaning, lang)}`}
              style={({ pressed }) => [styles.sample, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.sampleDe}>🔊 {v.de}</Text>
              <Text style={styles.sampleMeaning}>{pick(v.meaning, lang)}</Text>
            </Pressable>
          ))}
        </View>

        {features.map((f) => (
          <View key={f.title} style={styles.feature}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureBody}>{f.body}</Text>
            </View>
          </View>
        ))}

        <Pressable onPress={() => router.push('/login/signup')} accessibilityRole="button" style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}>
          <Text style={styles.ctaText}>{t(lang, 'startFree')}</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/preview')} accessibilityRole="button" style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.85 }]}>
          <Text style={styles.secondaryText}>{t(lang, 'previewLesson')}</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/login/email')} accessibilityRole="link" style={styles.link}>
          <Text style={styles.linkText}>{t(lang, 'haveAccount')}</Text>
        </Pressable>

        <Text style={styles.publisher}>{t(lang, 'publisher')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary },
  content: { padding: space.lg, paddingBottom: space.xl },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { color: colors.white, fontSize: 22, fontFamily: fonts.serif },
  logoAccent: { color: colors.brassLight },
  kicker: { color: colors.brassLight, fontSize: 14, fontWeight: '700', letterSpacing: 2, marginTop: space.xl },
  title: { color: colors.white, fontSize: 34, lineHeight: 44, fontFamily: fonts.serif, marginTop: space.sm },
  rule: { width: 52, height: 3, backgroundColor: colors.brass, marginVertical: space.md },
  sub: { color: colors.primaryTint, fontSize: 17, lineHeight: 26 },
  stats: { flexDirection: 'row', gap: space.sm, marginTop: space.lg },
  stat: { flex: 1, borderWidth: 1, borderColor: colors.primarySoft, borderRadius: 12, padding: space.sm, alignItems: 'center' },
  statValue: { color: colors.white, fontSize: 20, fontFamily: fonts.serif },
  statLabel: { color: colors.primaryTint, fontSize: 12 },
  section: { color: colors.brassLight, fontSize: 13, fontWeight: '700', letterSpacing: 1, marginTop: space.xl, textTransform: 'uppercase' },
  samples: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.sm },
  sample: { width: '48%', flexGrow: 1, backgroundColor: colors.primarySoft, borderRadius: 12, padding: space.sm },
  sampleDe: { color: colors.white, fontSize: 16, fontWeight: '700' },
  sampleMeaning: { color: colors.primaryTint, fontSize: 13, lineHeight: 20, marginTop: 2 },
  feature: { flexDirection: 'row', gap: space.md, backgroundColor: colors.white, borderRadius: 14, padding: space.md, marginTop: space.md, alignItems: 'center' },
  featureIcon: { fontSize: 28 },
  featureTitle: { fontSize: 16, lineHeight: 24, fontWeight: '700', color: colors.primary },
  featureBody: { fontSize: 14, lineHeight: 21, color: colors.muted },
  cta: { backgroundColor: colors.accent, minHeight: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: space.xl },
  ctaText: { color: colors.onAccent, fontSize: 18, fontWeight: '700' },
  secondary: { borderWidth: 2, borderColor: colors.white, minHeight: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: space.sm },
  secondaryText: { color: colors.white, fontSize: 17, fontWeight: '600' },
  link: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: space.sm },
  linkText: { color: colors.brassLight, fontSize: 16, textDecorationLine: 'underline' },
  publisher: { color: colors.primaryTint, fontSize: 12, textAlign: 'center', marginTop: space.lg },
});
