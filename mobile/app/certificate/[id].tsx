import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { Screen } from '../../src/components/Screen';
import { AppButton } from '../../src/components/AppButton';
import { useApp } from '../../src/state/AppContext';
import { BRAND, certificateFileName, certificateHtml, ISSUER } from '../../src/logic/certificateHtml';
import { formatDay, levelName } from '../../src/i18n/levels';
import { t } from '../../src/i18n/t';
import { colors, fonts, space, type } from '../../src/theme';

export default function CertificateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { lang, certificates } = useApp();
  const cert = certificates.find((c) => c.id === id);
  const [busy, setBusy] = useState(false);

  if (!cert) {
    return (
      <Screen>
        <Text style={type.body}>{t(lang, 'certNotFound')}</Text>
      </Screen>
    );
  }

  const share = async () => {
    setBusy(true);
    try {
      // Landscape A4 in points.
      const { uri } = await Print.printToFileAsync({ html: certificateHtml(cert), width: 842, height: 595 });
      const named = new File(Paths.cache, certificateFileName(cert));
      if (named.exists) named.delete();
      new File(uri).copy(named);
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(t(lang, 'shareUnavailable'));
        return;
      }
      await Sharing.shareAsync(named.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: certificateFileName(cert) });
    } catch (e) {
      console.warn('share failed', e);
      Alert.alert(t(lang, 'errNetwork'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <View style={styles.paper}>
        <Text style={styles.brand}>{BRAND}</Text>
        <Text style={styles.title}>{t(lang, 'certificateOfAchievement')}</Text>
        <Text style={styles.small}>{t(lang, 'presentedTo')}</Text>
        <Text style={styles.name}>{cert.fullName || '—'}</Text>
        <Text style={styles.small}>{t(lang, 'forCompleting', { level: levelName(lang, cert.level) })}</Text>
        <Text style={styles.small}>{t(lang, 'withScore', { p: cert.score })}</Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>{t(lang, 'certIssued', { d: formatDay(cert.issuedAt, lang) })}</Text>
          <Text style={styles.metaText}>{cert.level}</Text>
        </View>
        <Text style={styles.id}>{t(lang, 'certId', { id: cert.publicSlug })}</Text>
        <Text style={styles.issuer}>{ISSUER}</Text>
      </View>
      <AppButton title={`📄 ${t(lang, 'sharePdf')}`} onPress={share} disabled={busy} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  paper: {
    backgroundColor: '#FBF5E6',
    borderWidth: 3,
    borderColor: colors.brass,
    borderRadius: 8,
    padding: space.lg,
    alignItems: 'center',
    marginTop: space.md,
  },
  brand: { fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 18, color: colors.primary },
  title: { fontFamily: fonts.serif, fontSize: 24, lineHeight: 34, textAlign: 'center', marginTop: space.md, color: colors.text },
  small: { fontSize: 15, lineHeight: 22, color: colors.muted, textAlign: 'center', marginTop: space.xs },
  name: { fontFamily: fonts.serif, fontSize: 28, lineHeight: 38, marginVertical: space.sm, color: colors.text, textAlign: 'center' },
  meta: { flexDirection: 'row', gap: space.lg, marginTop: space.md },
  metaText: { fontSize: 14, fontWeight: '600', color: colors.text },
  id: { fontSize: 12, color: colors.muted, marginTop: space.md },
  issuer: { fontSize: 12, color: colors.muted, marginTop: space.sm, textAlign: 'center' },
});
