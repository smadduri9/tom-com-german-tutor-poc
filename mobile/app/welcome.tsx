import React, { useCallback } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setStatusBarStyle } from 'expo-status-bar';
import { LanguageSwitch } from '../src/components/LanguageSwitch';
import { useAudio } from '../src/audio/AudioContext';
import { useApp } from '../src/state/AppContext';
import { pick, t } from '../src/i18n/t';
import { curriculumData, lessons } from '../src/data/lessons';
import { colors, fonts, space } from '../src/theme';

// Optional state emblem, placed behind the hero. Add the official file at
// mobile/assets/brand/telangana-emblem.png; until then the hero is plain.
const EMBLEM: number | null = null;

// Four short phrases from the free lesson, tappable to hear them.
const SAMPLE_IDS = ['p03', 'p14', 'p07', 'p11'];
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

        <View style={styles.hero}>
          {EMBLEM !== null && <Image source={EMBLEM} style={styles.emblem} resizeMode="contain" accessibilityIgnoresInvertColors />}
          <Text style={styles.kicker}>{t(lang, 'heroLevels')}</Text>
          <Text style={styles.title}>{t(lang, 'heroTitle')}</Text>
          <Text style={styles.sub}>{t(lang, 'heroSub')}</Text>
          <View style={styles.heroButtons}>
            <Pressable onPress={() => router.push('/login/signup')} accessibilityRole="button" style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}>
              <Text style={styles.ctaText}>{t(lang, 'startFree')}</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/preview')} accessibilityRole="button" style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.85 }]}>
              <Text style={styles.secondaryText}>{t(lang, 'previewLesson')}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.stats}>
          {[
            { v: `${LESSON_COUNT}`, l: t(lang, 'statLessons') },
            { v: 'A1→B1', l: t(lang, 'statLevels') },
            { v: '3', l: t(lang, 'statLanguages') },
          ].map((s) => (
            <View key={s.l} style={styles.stat}>
              <Text style={styles.statValue}>{s.v}</Text>
              <Text style={styles.statLabel}>{s.l}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tryCard}>
          <Text style={styles.tryTitle}>{t(lang, 'tapToHear')} 🔊</Text>
          <Text style={styles.trySub}>{pick(lessons.A1.greetings.title, lang)}</Text>
          <View style={styles.samples}>
            {SAMPLES.map((v) => (
              <Pressable
                key={v.id}
                onPress={() => play(v.id, v.de)}
                accessibilityRole="button"
                accessibilityLabel={`${v.de}, ${pick(v.meaning, lang)}`}
                style={({ pressed }) => [styles.sample, pressed && { opacity: 0.8 }]}
              >
                <Text style={styles.sampleDe}>{v.de}</Text>
                <Text style={styles.sampleMeaning}>{pick(v.meaning, lang)}</Text>
              </Pressable>
            ))}
          </View>
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

        <View style={styles.finalCta}>
          <Text style={styles.finalTitle}>{t(lang, 'startFree')} — {t(lang, 'appName')}</Text>
          <Text style={styles.finalSub}>{t(lang, 'tagline')}</Text>
          <Pressable onPress={() => router.push('/login/signup')} accessibilityRole="button" style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}>
            <Text style={styles.ctaText}>{t(lang, 'startFree')}</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/login/email')} accessibilityRole="link" style={styles.link}>
            <Text style={styles.linkText}>{t(lang, 'haveAccount')}</Text>
          </Pressable>
        </View>

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
  hero: { marginTop: space.xl, position: 'relative' },
  emblem: { position: 'absolute', width: 320, height: 320, right: -90, top: -40, opacity: 0.12 },
  kicker: { color: colors.brassLight, fontSize: 14, fontWeight: '700', letterSpacing: 2 },
  title: { color: colors.white, fontSize: 34, lineHeight: 44, fontFamily: fonts.serif, marginTop: space.sm },
  sub: { color: colors.primaryTint, fontSize: 17, lineHeight: 26, marginTop: space.md },
  heroButtons: { marginTop: space.lg, gap: space.sm },
  stats: { flexDirection: 'row', gap: space.sm, marginTop: space.xl },
  stat: { flex: 1, borderWidth: 1, borderColor: colors.primarySoft, borderRadius: 12, padding: space.sm, alignItems: 'center' },
  statValue: { color: colors.white, fontSize: 20, fontFamily: fonts.serif },
  statLabel: { color: colors.primaryTint, fontSize: 12 },
  tryCard: { backgroundColor: colors.primarySoft, borderRadius: 16, padding: space.md, marginTop: space.xl },
  tryTitle: { color: colors.white, fontSize: 18, fontWeight: '700' },
  trySub: { color: colors.primaryTint, fontSize: 14, lineHeight: 20, marginTop: 2 },
  samples: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.sm },
  sample: { width: '48%', flexGrow: 1, backgroundColor: colors.primary, borderRadius: 12, padding: space.sm },
  sampleDe: { color: colors.white, fontSize: 16, fontWeight: '700' },
  sampleMeaning: { color: colors.primaryTint, fontSize: 13, lineHeight: 20, marginTop: 2 },
  feature: { flexDirection: 'row', gap: space.md, backgroundColor: colors.white, borderRadius: 14, padding: space.md, marginTop: space.md, alignItems: 'center' },
  featureIcon: { fontSize: 28 },
  featureTitle: { fontSize: 16, lineHeight: 24, fontWeight: '700', color: colors.primary },
  featureBody: { fontSize: 14, lineHeight: 21, color: colors.muted },
  finalCta: { marginTop: space.xl, alignItems: 'center' },
  finalTitle: { color: colors.white, fontSize: 24, lineHeight: 32, fontFamily: fonts.serif, textAlign: 'center' },
  finalSub: { color: colors.primaryTint, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: space.xs, marginBottom: space.sm },
  cta: { backgroundColor: colors.accent, minHeight: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
  ctaText: { color: colors.onAccent, fontSize: 18, fontWeight: '700' },
  secondary: { borderWidth: 2, borderColor: colors.white, minHeight: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: colors.white, fontSize: 17, fontWeight: '600' },
  link: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: space.sm },
  linkText: { color: colors.brassLight, fontSize: 16, textDecorationLine: 'underline' },
  publisher: { color: colors.primaryTint, fontSize: 12, textAlign: 'center', marginTop: space.lg },
});
