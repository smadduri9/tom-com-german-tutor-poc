import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Card } from '../../src/components/Section';
import { useApp } from '../../src/state/AppContext';
import { formatDay, levelName } from '../../src/i18n/levels';
import { t } from '../../src/i18n/t';
import { colors, space, type } from '../../src/theme';

export default function CertificatesTab() {
  const { lang, certificates } = useApp();
  return (
    <Screen>
      <Text style={type.title}>{t(lang, 'certsTitle')}</Text>
      <Text style={type.small}>{t(lang, 'certsSub')}</Text>
      {certificates.length === 0 ? (
        <Card style={{ marginTop: space.lg, alignItems: 'center' }}>
          <Text style={styles.emptyIcon}>🏅</Text>
          <Text style={[type.body, { textAlign: 'center' }]}>{t(lang, 'certsEmpty')}</Text>
        </Card>
      ) : (
        certificates.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => router.push(`/certificate/${c.id}`)}
            accessibilityRole="button"
            style={({ pressed }) => [pressed && { opacity: 0.8 }]}
          >
            <Card style={styles.cert}>
              <Text style={styles.icon}>🏆</Text>
              <View style={{ flex: 1 }}>
                <Text style={type.heading}>{levelName(lang, c.level)}</Text>
                <Text style={type.small}>
                  {t(lang, 'certScore', { p: c.score })} · {t(lang, 'certIssued', { d: formatDay(c.issuedAt, lang) })}
                </Text>
              </View>
              <Text style={styles.chev}>›</Text>
            </Card>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyIcon: { fontSize: 44, lineHeight: 56 },
  cert: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.md },
  icon: { fontSize: 32 },
  chev: { fontSize: 28, color: colors.muted },
});
