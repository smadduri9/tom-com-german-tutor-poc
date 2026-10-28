import React, { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { AppButton } from '../../src/components/AppButton';
import { TextField } from '../../src/components/TextField';
import { useApp } from '../../src/state/AppContext';
import { backend, DEMO_RESET_CODE } from '../../src/backend';
import { errorMessage } from '../../src/i18n/levels';
import { t } from '../../src/i18n/t';
import { colors, space, type } from '../../src/theme';

// Email → 6-digit code → new password.
export default function ForgotScreen() {
  const { lang, verifyResetCode } = useApp();
  const params = useLocalSearchParams<{ email?: string }>();
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [email, setEmail] = useState(params.email ?? '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError('');
    setInfo('');
    try {
      await fn();
    } catch (e) {
      setError(errorMessage(lang, e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Text style={type.title}>{t(lang, 'forgotTitle')}</Text>
      {step === 'email' && (
        <>
          <Text style={[type.body, { marginTop: space.sm }]}>{t(lang, 'forgotBody')}</Text>
          <TextField
            label={t(lang, 'email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <AppButton
            title={t(lang, 'sendCode')}
            disabled={busy || !email}
            onPress={() => run(async () => {
              await backend.resetPassword(email);
              setStep('code');
            })}
          />
        </>
      )}
      {step === 'code' && (
        <>
          <Text style={[type.body, { marginTop: space.sm }]}>{t(lang, 'codeSentTo', { email })}</Text>
          {backend.kind === 'local' && <Text style={type.small}>{t(lang, 'demoCodeHint', { code: DEMO_RESET_CODE })}</Text>}
          <TextField
            label="000000"
            value={code}
            onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            maxLength={6}
            style={{ letterSpacing: 8, fontSize: 24 }}
          />
          <AppButton
            title={t(lang, 'verifyCode')}
            disabled={busy || code.length !== 6}
            onPress={() => run(async () => {
              await verifyResetCode(email, code);
              setStep('password');
            })}
          />
          <Pressable
            style={styles.link}
            accessibilityRole="button"
            onPress={() => run(async () => {
              await backend.resetPassword(email);
              setInfo(t(lang, 'codeResent'));
            })}
          >
            <Text style={styles.linkText}>{t(lang, 'resendCode')}</Text>
          </Pressable>
        </>
      )}
      {step === 'password' && (
        <>
          <TextField
            label={t(lang, 'newPassword')}
            hint={t(lang, 'passwordHint')}
            value={password}
            onChangeText={setPassword}
            secret
            textContentType="newPassword"
          />
          <AppButton
            title={t(lang, 'updatePassword')}
            disabled={busy || password.length < 6}
            onPress={() => run(async () => {
              await backend.changePassword(password);
              router.replace('/learn');
            })}
          />
        </>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {info ? <Text style={styles.info}>{info}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.error, fontSize: 15, lineHeight: 22, marginTop: space.sm },
  info: { color: colors.success, fontSize: 15, lineHeight: 22, marginTop: space.sm },
  link: { minHeight: 44, justifyContent: 'center', alignItems: 'center', marginTop: space.sm },
  linkText: { color: colors.primary, fontSize: 16, fontWeight: '600', textDecorationLine: 'underline' },
});
