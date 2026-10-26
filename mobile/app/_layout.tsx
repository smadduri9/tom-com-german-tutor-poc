import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from '../src/state/AppContext';
import { AudioProvider } from '../src/audio/AudioContext';
import { LanguageSwitch } from '../src/components/LanguageSwitch';
import { t } from '../src/i18n/t';
import { colors } from '../src/theme';

function AppStack() {
  const { lang } = useApp();
  return (
    <Stack
      screenOptions={{
        headerRight: () => <LanguageSwitch />,
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '700' },
        headerBackTitle: t(lang, 'back'),
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="language" options={{ title: t(lang, 'appName') }} />
      <Stack.Screen name="login/email" options={{ title: t(lang, 'appName') }} />
      <Stack.Screen name="login/otp" options={{ title: t(lang, 'appName') }} />
      <Stack.Screen
        name="home"
        options={{ title: t(lang, 'appName'), headerBackVisible: false, gestureEnabled: false }}
      />
      <Stack.Screen name="lesson" options={{ title: t(lang, 'lessonTitle') }} />
      <Stack.Screen name="quiz" options={{ title: t(lang, 'quizTitle') }} />
      <Stack.Screen
        name="result"
        options={{ title: t(lang, 'resultTitle'), headerBackVisible: false, gestureEnabled: false }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <AudioProvider>
        <StatusBar style="dark" />
        <AppStack />
      </AudioProvider>
    </AppProvider>
  );
}
