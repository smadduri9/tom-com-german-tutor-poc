import React from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../src/components/Screen';
import { AppButton } from '../src/components/AppButton';
import { useApp } from '../src/state/AppContext';
import { t } from '../src/i18n/t';
import { space, type } from '../src/theme';

export default function NotFound() {
  const { lang } = useApp();
  return (
    <Screen>
      <Text style={[type.title, { marginTop: space.xl }]}>{t(lang, 'notFoundTitle')}</Text>
      <Text style={[type.body, { marginTop: space.sm }]}>{t(lang, 'notFoundBody')}</Text>
      <AppButton title={t(lang, 'goHome')} onPress={() => router.replace('/')} />
    </Screen>
  );
}
