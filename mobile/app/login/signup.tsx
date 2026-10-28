import React, { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { AppButton } from '../../src/components/AppButton';
import { TextField } from '../../src/components/TextField';
import { useApp } from '../../src/state/AppContext';
import { errorMessage } from '../../src/i18n/levels';
import { t } from '../../src/i18n/t';
import { colors, space, type } from '../../src/theme';

export default function SignUpScreen() {
  const { lang, signUp } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const submit = async () => {
    if (!name.trim()) return setError(t(lang, 'errNameRequired'));
    setBusy(true);
    setError('');
    try {
      await signUp(email, password, name);
      router.replace('/learn');
    } catch (e) {
      // Supabase with email confirmation: the account exists but there is no session yet.
      if ((e as { code?: string })?.code === 'notSignedIn') setInfo(t(lang, 'checkEmail'));
      else setError(errorMessage(lang, e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Text style={type.title}>{t(lang, 'signUpTitle')}</Text>
      <TextField label={t(lang, 'fullName')} value={name} onChangeText={setName} textContentType="name" autoComplete="name" />
      <TextField
        label={t(lang, 'email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <TextField
        label={t(lang, 'password')}
        hint={t(lang, 'passwordHint')}
        value={password}
        onChangeText={setPassword}
        secret
        textContentType="newPassword"
        onSubmitEditing={submit}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {info ? <Text style={styles.info}>{info}</Text> : null}
      <AppButton
        title={busy ? t(lang, 'creatingAccount') : t(lang, 'signUpBtn')}
        onPress={submit}
        disabled={busy || !email || password.length < 6}
      />
      <Pressable onPress={() => router.replace('/login/email')} accessibilityRole="link" style={styles.link}>
        <Text style={styles.linkText}>{t(lang, 'haveAccountLink')}</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.error, fontSize: 15, lineHeight: 22, marginTop: space.sm },
  info: { color: colors.success, fontSize: 15, lineHeight: 22, marginTop: space.sm },
  link: { minHeight: 44, justifyContent: 'center', alignItems: 'center', marginTop: space.sm },
  linkText: { color: colors.primary, fontSize: 16, fontWeight: '600', textDecorationLine: 'underline' },
});
