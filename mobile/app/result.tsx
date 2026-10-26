import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '../src/components/Screen';
import { AppButton } from '../src/components/AppButton';
import { useApp } from '../src/state/AppContext';
import { isPass } from '../src/logic/quiz';
import { t } from '../src/i18n/t';
import { colors, space, type } from '../src/theme';

export default function ResultScreen() {
  const { lang } = useApp();
  const params = useLocalSearchParams<{ score?: string }>();
  const parsed = Number.parseInt(String(params.score ?? '0'), 10);
  const score = Number.isFinite(parsed) ? Math.min(5, Math.max(0, parsed)) : 0;
  const passed = isPass(score);

  return (
    <Screen>
      <View style={[styles.box, { backgroundColor: passed ? colors.successBg : colors.errorBg }]}>
        <Text style={styles.emoji}>{passed ? '🎉' : '💪'}</Text>
        <Text style={[type.title, { textAlign: 'center' }]}>{t(lang, 'score', { score })}</Text>
        <Text style={[type.body, { textAlign: 'center', marginTop: space.sm }]}>
          {passed ? t(lang, 'resultPass') : t(lang, 'resultFail')}
        </Text>
      </View>
      {!passed && <AppButton title={t(lang, 'retry')} onPress={() => router.replace('/quiz')} />}
      <AppButton
        title={t(lang, 'backHome')}
        variant={passed ? 'primary' : 'secondary'}
        onPress={() => router.dismissTo('/home')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: 16, padding: space.lg, alignItems: 'center', marginTop: space.lg },
  emoji: { fontSize: 48, lineHeight: 60 },
});
