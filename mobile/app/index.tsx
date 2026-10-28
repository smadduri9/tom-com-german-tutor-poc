import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useApp } from '../src/state/AppContext';
import { colors } from '../src/theme';

export default function Gate() {
  const { hydrated, user } = useApp();
  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  return <Redirect href={user ? '/learn' : '/welcome'} />;
}
