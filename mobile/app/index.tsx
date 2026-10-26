import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useApp } from '../src/state/AppContext';
import { colors } from '../src/theme';

export default function Gate() {
  const { hydrated, langChosen, session } = useApp();
  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (!langChosen) return <Redirect href="/language" />;
  if (!session) return <Redirect href="/login/email" />;
  return <Redirect href="/home" />;
}
