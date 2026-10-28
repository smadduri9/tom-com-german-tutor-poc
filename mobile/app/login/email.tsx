import React, { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { AppButton } from '../../src/components/AppButton';
import { TextField } from '../../src/components/TextField';
import { useApp } from '../../src/state/AppContext';
import { backend, DEMO_EMAIL, DEMO_PASSWORD } from '../../src/backend';
import { errorMessage } from '../../src/i18n/levels';
import { t } from '../../src/i18n/t';
import { colors, space, type } from '../../src/theme';

export default function SignInScreen() {
  const { lang, signIn } = useApp();
  const demo = backend.kind === 'local';
  // The demo account is pre-filled so the simulator demo is one tap.
  const [email, setEmail] = useState(demo ? DEMO_EMAIL : '');
  const [password, setPassword] = useState(demo ? DEMO_PASSWORD : '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await signIn(email, password);
      router.replace('/learn');
    } catch (e) {
      setError(errorMessage(lang, e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Text style={type.title}>{t(lang, 'signInTitle')}</Text>
      {demo && <Text style={[type.small, { marginTop: space.xs }]}>{t(lang, 'demoHint', { email: DEMO_EMAIL, password: DEMO_PASSWORD })}</Text>}
      <TextField
        label={t(lang, 'email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
      />
      <TextField
        label={t(lang, 'password')}
        value={password}
        onChangeText={setPassword}
        secret
        textContentType="password"
        autoComplete="password"
        onSubmitEditing={submit}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <AppButton
        title={busy ? t(lang, 'signingIn') : t(lang, 'signInBtn')}
        onPress={submit}
        disabled={busy || !email || password.length < 6}
      />
      <Pressable onPress={() => router.push('/login/forgot')} accessibilityRole="link" style={styles.link}>
        <Text style={styles.linkText}>{t(lang, 'forgotPassword')}</Text>
      </Pressable>
      <Pressable onPress={() => router.replace('/login/signup')} accessibilityRole="link" style={styles.link}>
        <Text style={styles.linkText}>{t(lang, 'noAccount')}</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.error, fontSize: 15, lineHeight: 22, marginTop: space.sm },
  link: { minHeight: 44, justifyContent: 'center', alignItems: 'center', marginTop: space.sm },
  linkText: { color: colors.primary, fontSize: 16, fontWeight: '600', textDecorationLine: 'underline' },
});
