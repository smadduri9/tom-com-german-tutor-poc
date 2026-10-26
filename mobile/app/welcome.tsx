import React, { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setStatusBarStyle } from 'expo-status-bar';
import { LanguageSwitch } from '../src/components/LanguageSwitch';
import { AppButton } from '../src/components/AppButton';
import { useAudio } from '../src/audio/AudioContext';
import { useApp } from '../src/state/AppContext';
import { pick, t } from '../src/i18n/t';
import { lesson1 } from '../src/data/lesson';
import { colors, space } from '../src/theme';

// A short natural sentence so people hear the voice quality before signing in.
const SAMPLE_AUDIO_ID = 'd02';
const SAMPLE_LINE = lesson1.dialogue.find((d) => d.id === SAMPLE_AUDIO_ID)!;

function AboutSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { lang } = useApp();
  const sections = [
    { title: t(lang, 'aboutWhyTitle'), body: t(lang, 'aboutWhy') },
    { title: t(lang, 'aboutWhatTitle'), body: t(lang, 'aboutWhat') },
    { title: t(lang, 'aboutWhoTitle'), body: t(lang, 'aboutWho') },
  ];
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t(lang, 'close')} />
      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <View style={styles.grabber} />
        <ScrollView contentContainerStyle={{ paddingBottom: space.sm }}>
          <Text style={styles.sheetTitle}>{t(lang, 'aboutApp')}</Text>
          {sections.map((s) => (
            <View key={s.title} style={{ marginTop: space.md }}>
              <Text style={styles.sectionTitle}>{s.title}</Text>
              <Text style={styles.sectionBody}>{s.body}</Text>
            </View>
          ))}
          <Text style={styles.poc}>{t(lang, 'aboutPoc')}</Text>
        </ScrollView>
        <AppButton title={t(lang, 'close')} variant="secondary" onPress={onClose} />
      </SafeAreaView>
    </Modal>
  );
}

export default function WelcomeScreen() {
  const { lang, setLang } = useApp();
  const { play } = useAudio();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [sampleShown, setSampleShown] = useState(false);

  // Light status bar text on the blue page only; other screens are white.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, []),
  );

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.top}>
        <LanguageSwitch onDark />
      </View>

      <View style={styles.middle}>
        <Text style={styles.brand}>{t(lang, 'learnGerman')}</Text>
        <Text style={styles.headline}>{t(lang, 'landingHeadline')}</Text>
        <View style={styles.rule} />
        <Text style={styles.sub}>{t(lang, 'landingSub')}</Text>
        <Text style={styles.levels}>{t(lang, 'landingLevels')}</Text>

        <Pressable
          onPress={() => {
            play(SAMPLE_AUDIO_ID);
            setSampleShown(true);
          }}
          accessibilityRole="button"
          accessibilityLabel={t(lang, 'hearSample')}
          style={({ pressed }) => [styles.sample, pressed && { opacity: 0.75 }]}
        >
          <View style={styles.sampleIcon}>
            <Text style={styles.sampleIconText}>▶</Text>
          </View>
          <Text style={styles.sampleText}>{t(lang, 'hearSample')}</Text>
        </Pressable>
        {/* Shows what is being said, so the sample makes sense even with the sound off. */}
        {sampleShown && (
          <View style={styles.caption}>
            <Text style={styles.captionDe}>{SAMPLE_LINE.de}</Text>
            <Text style={styles.captionMeaning}>{pick(SAMPLE_LINE.meaning, lang)}</Text>
          </View>
        )}
      </View>

      <View style={styles.bottom}>
        <Pressable
          onPress={() => {
            setLang(lang); // marks the language as chosen
            router.push('/login/email');
          }}
          accessibilityRole="button"
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.ctaText}>{t(lang, 'getStarted')}</Text>
        </Pressable>
        <Pressable onPress={() => setAboutOpen(true)} accessibilityRole="button" hitSlop={8}>
          <Text style={styles.about}>{t(lang, 'aboutApp')}</Text>
        </Pressable>
      </View>

      <AboutSheet visible={aboutOpen} onClose={() => setAboutOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary },
  top: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: space.md, paddingTop: space.sm },
  middle: { flex: 1, justifyContent: 'center', paddingHorizontal: space.lg },
  brand: { color: colors.brassLight, fontSize: 14, lineHeight: 22, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  headline: { color: colors.white, fontSize: 32, lineHeight: 44, fontWeight: '700', marginTop: space.sm },
  rule: { width: 48, height: 3, backgroundColor: colors.brass, marginVertical: space.md },
  sub: { color: colors.primaryTint, fontSize: 17, lineHeight: 27 },
  levels: { color: colors.brassLight, fontSize: 15, lineHeight: 24, fontWeight: '600', marginTop: space.sm },
  sample: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: space.sm,
    marginTop: space.lg,
    borderWidth: 1,
    borderColor: colors.brass,
    borderRadius: 28,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: space.md,
    minHeight: 48,
  },
  sampleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sampleIconText: { color: colors.onAccent, fontSize: 14, lineHeight: 18, marginLeft: 2 },
  sampleText: { color: colors.white, fontSize: 16, lineHeight: 24, fontWeight: '600' },
  caption: { marginTop: space.md, borderLeftWidth: 3, borderLeftColor: colors.accent, paddingLeft: space.sm },
  captionDe: { color: colors.white, fontSize: 17, lineHeight: 26, fontWeight: '700' },
  captionMeaning: { color: colors.primaryTint, fontSize: 15, lineHeight: 24 },
  bottom: { paddingHorizontal: space.md, paddingBottom: space.md },
  cta: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: colors.onAccent, fontSize: 17, lineHeight: 26, fontWeight: '700' },
  about: {
    color: colors.brassLight,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: space.md,
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    maxHeight: '80%',
  },
  grabber: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: space.md },
  sheetTitle: { fontSize: 22, lineHeight: 32, fontWeight: '700', color: colors.primary },
  sectionTitle: { fontSize: 13, lineHeight: 20, fontWeight: '700', color: colors.brassText, textTransform: 'uppercase', letterSpacing: 1 },
  sectionBody: { fontSize: 16, lineHeight: 26, color: colors.text, marginTop: 2 },
  poc: { fontSize: 13, lineHeight: 20, color: colors.muted, marginTop: space.lg },
});
