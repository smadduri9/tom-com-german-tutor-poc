import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { AppProvider, useApp } from '../src/state/AppContext';
import { AudioProvider } from '../src/audio/AudioContext';
import { TutorProvider } from '../src/state/TutorContext';
import { LanguageSwitch } from '../src/components/LanguageSwitch';
import { t } from '../src/i18n/t';
import { colors, fonts } from '../src/theme';

function AppStack() {
  const { lang } = useApp();
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { fontFamily: fonts.serifMedium },
        headerBackTitle: t(lang, 'back'),
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="preview" options={{ title: t(lang, 'appName'), headerRight: () => <LanguageSwitch /> }} />
      <Stack.Screen name="login/email" options={{ title: t(lang, 'signInTitle'), headerRight: () => <LanguageSwitch /> }} />
      <Stack.Screen name="login/signup" options={{ title: t(lang, 'signUpTitle'), headerRight: () => <LanguageSwitch /> }} />
      <Stack.Screen name="login/forgot" options={{ title: t(lang, 'forgotTitle'), headerRight: () => <LanguageSwitch /> }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="learn/[level]/[slug]" options={{ title: '', headerRight: () => <LanguageSwitch /> }} />
      <Stack.Screen name="quiz/[level]/[slug]" options={{ title: '', headerRight: () => <LanguageSwitch /> }} />
      <Stack.Screen name="certificate/[id]" options={{ title: t(lang, 'certsTitle') }} />
      <Stack.Screen name="tutor-voice" options={{ headerShown: false, presentation: 'fullScreenModal', animation: 'fade' }} />
      <Stack.Screen name="+not-found" options={{ title: '' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Fraunces_600SemiBold, Fraunces_700Bold, Inter_400Regular, Inter_700Bold });
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  return (
    <AppProvider>
      <AudioProvider>
        <TutorProvider>
          <StatusBar style="dark" />
          <AppStack />
        </TutorProvider>
      </AudioProvider>
    </AppProvider>
  );
}
