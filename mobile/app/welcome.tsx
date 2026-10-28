import React, { useCallback } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setStatusBarStyle } from 'expo-status-bar';
import { LanguageSwitch } from '../src/components/LanguageSwitch';
import { useAudio } from '../src/audio/AudioContext';
import { useApp } from '../src/state/AppContext';
import { pick, t } from '../src/i18n/t';
import { curriculumData } from '../src/data/lessons';
import { colors, fonts, space } from '../src/theme';

const EMBLEM = require('../assets/brand/telangana-emblem.png');
const LOGO = require('../assets/brand/logo.png');

// The four phrases the reference landing page shows. Guten Tag reuses the
// recorded greeting; the rest fall back to device speech.
const SAMPLES = [
  { id: 'p03', de: 'Guten Tag', meaning: { en: 'Good day', te: 'నమస్కారం', hi: 'नमस्ते' } },
  { id: 'w-wie-gehts', de: "Wie geht's?", meaning: { en: 'How are you?', te: 'ఎలా ఉన్నారు?', hi: 'कैसे हो?' } },
  { id: 'w-danke-schoen', de: 'Danke schön', meaning: { en: 'Thank you', te: 'ధన్యవాదాలు', hi: 'धन्यवाद' } },
  { id: 'w-ich-lerne', de: 'Ich lerne Deutsch', meaning: { en: "I'm learning German", te: 'నేను జర్మన్ నేర్చుకుంటున్నాను', hi: 'मैं जर्मन सीख रहा/रही हूँ' } },
];
const LESSON_COUNT = curriculumData.A1.length + curriculumData.A2.length + curriculumData.B1.length;

export default function WelcomeScreen() {
  const { lang } = useApp();
  const { play } = useAudio();

  // The landing page is light, like every other screen.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('dark');
      return () => setStatusBarStyle('dark');
    }, []),
  );

  const features = [
    { icon: '✦', title: t(lang, 'feature1Title'), body: t(lang, 'feature1Body') },
    { icon: '🔈', title: t(lang, 'feature2Title'), body: t(lang, 'feature2Body') },
    { icon: '🎖', title: t(lang, 'feature3Title'), body: t(lang, 'feature3Body') },
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <View style={styles.brand} accessibilityRole="header">
            <Image source={LOGO} style={styles.logoImage} resizeMode="contain" accessibilityLabel="TomCom" />
            <Text style={styles.logo}>{t(lang, 'orgName')}</Text>
          </View>
          <LanguageSwitch />
        </View>

        <View style={styles.hero}>
          <Image source={EMBLEM} style={styles.emblem} resizeMode="contain" accessibilityIgnoresInvertColors />
          <View style={styles.pill}>
            <View style={styles.pillDot} />
            <Text style={styles.pillText}>{t(lang, 'heroLevels')}</Text>
          </View>
          <Text style={styles.title}>{t(lang, 'orgName')}</Text>
          <Text style={styles.sub}>{t(lang, 'heroSub')}</Text>
          <View style={styles.heroButtons}>
            <Pressable onPress={() => router.push('/login/signup')} accessibilityRole="button" style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}>
              <Text style={styles.ctaText}>{t(lang, 'startFree')}  →</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/preview')} accessibilityRole="button" style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.85 }]}>
              <Text style={styles.secondaryText}>📖  {t(lang, 'previewLesson')}</Text>
            </Pressable>
          </View>

          <View style={styles.stats}>
            {[
              { v: `${LESSON_COUNT}+`, l: t(lang, 'statLessons') },
              { v: 'A1→B1', l: t(lang, 'statLevels') },
              { v: '3', l: t(lang, 'statLanguages') },
            ].map((s) => (
              <View key={s.l} style={styles.stat}>
                <Text style={styles.statValue}>{s.v}</Text>
                <Text style={styles.statLabel}>{s.l}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.tryWrap}>
          <View style={styles.tryCard}>
            <Text style={styles.vocabLabel}>{t(lang, 'vocabLabel')}</Text>
            {SAMPLES.map((v, i) => (
              <Pressable
                key={v.id}
                onPress={() => play(v.id, v.de)}
                accessibilityRole="button"
                accessibilityLabel={`${v.de}, ${pick(v.meaning, lang)}`}
                style={({ pressed }) => [styles.sample, i > 0 && styles.sampleDivider, pressed && { opacity: 0.7 }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.sampleDe}>{v.de}</Text>
                  <Text style={styles.sampleMeaning}>{pick(v.meaning, lang)}</Text>
                </View>
                <View style={styles.speaker}>
                  <Text style={styles.speakerIcon}>🔈</Text>
                </View>
              </Pressable>
            ))}
          </View>
          <View style={styles.tryTag}>
            <Text style={styles.tryTagText}>{t(lang, 'tapToHear')}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {features.map((f) => (
          <View key={f.title} style={styles.feature}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureTitle}>{f.title}</Text>
            <Text style={styles.featureBody}>{f.body}</Text>
          </View>
        ))}

        <View style={styles.finalCta}>
          <Text style={styles.finalTitle}>{t(lang, 'finalTitle')}</Text>
          <Text style={styles.finalSub}>{t(lang, 'finalSub')}</Text>
          <Pressable onPress={() => router.push('/login/signup')} accessibilityRole="button" style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}>
            <Text style={styles.ctaText}>{t(lang, 'startFree')}  →</Text>
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
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: space.xl },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flex: 1, marginRight: space.sm },
  logoImage: { width: 36, height: 36 },
  logo: { flex: 1, color: colors.primary, fontSize: 15, lineHeight: 20, fontFamily: fonts.serifMedium },
  hero: { marginTop: space.xl, position: 'relative' },
  emblem: { position: 'absolute', width: 300, height: 260, right: -80, top: -30, opacity: 0.12 },
  pill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: colors.white },
  pillDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.primary },
  pillText: { color: colors.muted, fontSize: 12, fontFamily: fonts.body },
  title: { color: colors.text, fontSize: 40, lineHeight: 50, fontFamily: fonts.serif, marginTop: space.md },
  sub: { color: colors.muted, fontSize: 18, lineHeight: 28, marginTop: space.md, fontFamily: fonts.body },
  heroButtons: { marginTop: space.lg, flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  cta: { backgroundColor: colors.primary, minHeight: 48, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: colors.white, fontSize: 15, fontWeight: '500', fontFamily: fonts.body },
  secondary: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, minHeight: 48, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: colors.text, fontSize: 15, fontWeight: '500', fontFamily: fonts.body },
  stats: { flexDirection: 'row', gap: space.lg, marginTop: space.xl },
  stat: { flex: 1 },
  statValue: { color: colors.text, fontSize: 24, fontFamily: fonts.serifMedium },
  statLabel: { color: colors.muted, fontSize: 14, fontFamily: fonts.body, marginTop: 2 },
  tryWrap: { marginTop: space.xl + space.md, position: 'relative' },
  tryCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: space.lg - 4, paddingVertical: space.lg - 4, shadowColor: '#0F2750', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  vocabLabel: { color: colors.muted, fontSize: 12, letterSpacing: 1, fontFamily: fonts.body, marginBottom: space.sm },
  sample: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  sampleDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  sampleDe: { color: colors.text, fontSize: 19, fontFamily: fonts.serifMedium },
  sampleMeaning: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 2, fontFamily: fonts.body },
  speaker: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  speakerIcon: { fontSize: 14 },
  tryTag: { position: 'absolute', top: -14, right: -6, backgroundColor: '#F2B634', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, transform: [{ rotate: '3deg' }] },
  tryTagText: { color: colors.text, fontSize: 12, fontWeight: '600', fontFamily: fonts.body },
  divider: { height: 1, backgroundColor: colors.border, marginTop: space.xl, marginHorizontal: -space.lg },
  feature: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: space.lg - 4, marginTop: space.md },
  featureIcon: { fontSize: 20, color: colors.primary },
  featureTitle: { fontSize: 17, lineHeight: 24, fontFamily: fonts.serifMedium, color: colors.text, marginTop: space.md },
  featureBody: { fontSize: 14, lineHeight: 21, color: colors.muted, marginTop: 6, fontFamily: fonts.body },
  finalCta: { marginTop: space.xl, alignItems: 'center' },
  finalTitle: { color: colors.text, fontSize: 28, lineHeight: 36, fontFamily: fonts.serif, textAlign: 'center' },
  finalSub: { color: colors.muted, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: space.xs, marginBottom: space.md, fontFamily: fonts.body },
  link: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: space.sm },
  linkText: { color: colors.primary, fontSize: 15, textDecorationLine: 'underline' },
  publisher: { color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: space.lg },
});
