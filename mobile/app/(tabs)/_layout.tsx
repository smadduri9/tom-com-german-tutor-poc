import React from 'react';
import { Text, type ColorValue } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { useApp } from '../../src/state/AppContext';
import { LanguageSwitch } from '../../src/components/LanguageSwitch';
import { t } from '../../src/i18n/t';
import { colors, fonts } from '../../src/theme';

const icon = (glyph: string) =>
  function TabIcon({ color }: { color: ColorValue }) {
    return <Text style={{ fontSize: 20, color }}>{glyph}</Text>;
  };

export default function TabsLayout() {
  const { lang, user, hydrated } = useApp();
  if (hydrated && !user) return <Redirect href="/welcome" />;
  return (
    <Tabs
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { fontFamily: fonts.serifMedium },
        headerRight: () => <LanguageSwitch />,
        headerRightContainerStyle: { paddingRight: 12 },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tabs.Screen name="learn" options={{ title: t(lang, 'tabLearn'), tabBarIcon: icon('📚') }} />
      <Tabs.Screen name="tutor" options={{ title: t(lang, 'tabTutor'), tabBarIcon: icon('💬') }} />
      <Tabs.Screen name="certificates" options={{ title: t(lang, 'tabCertificates'), tabBarIcon: icon('🏅') }} />
      <Tabs.Screen name="profile" options={{ title: t(lang, 'tabProfile'), tabBarIcon: icon('👤') }} />
    </Tabs>
  );
}
