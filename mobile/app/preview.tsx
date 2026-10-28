import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../src/components/Screen';
import { AppButton } from '../src/components/AppButton';
import { LessonContent } from '../src/components/LessonContent';
import { useApp } from '../src/state/AppContext';
import { lessons } from '../src/data/lessons';
import { pick, t } from '../src/i18n/t';
import { colors, space, type } from '../src/theme';

// The free lesson, read-only and without an account.
export default function PreviewScreen() {
  const { lang } = useApp();
  const lesson = lessons.A1.greetings;
  return (
    <Screen>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>{t(lang, 'previewBanner')}</Text>
      </View>
      <Text style={styles.kicker}>A1</Text>
      <Text style={type.title}>{pick(lesson.title, lang)}</Text>
      <LessonContent lesson={lesson} />
      <View style={{ marginTop: space.xl }}>
        <AppButton title={t(lang, 'startFree')} onPress={() => router.replace('/login/signup')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: '#FFF8EC', borderColor: colors.brassLight, borderWidth: 1, borderRadius: 12, padding: space.sm },
  bannerText: { color: colors.brassText, fontSize: 14, lineHeight: 21 },
  kicker: { color: colors.brassText, fontSize: 14, fontWeight: '700', marginTop: space.md },
});
