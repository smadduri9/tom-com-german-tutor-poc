import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { AppButton } from '../../src/components/AppButton';
import { useApp } from '../../src/state/AppContext';
import { createOtp, resendSecondsLeft, verifyOtp, type VerifyReason } from '../../src/logic/otp';
import { t } from '../../src/i18n/t';
import { colors, space, type } from '../../src/theme';

export default function OtpScreen() {
  const { lang, otp, setOtp, setSession } = useApp();
  const [code, setCode] = useState('');
  const [reason, setReason] = useState<VerifyReason | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!otp) return <Redirect href="/login/email" />;

  const secondsLeft = resendSecondsLeft(otp, now);

  const errorText =
    reason === 'format'
      ? t(lang, 'otpInvalidFormat')
      : reason === 'wrong'
        ? t(lang, 'otpWrong', { n: otp.attemptsLeft })
        : reason === 'locked'
          ? t(lang, 'otpLocked')
          : reason === 'expired'
            ? t(lang, 'otpExpired')
            : null;

  const onVerify = () => {
    const { result, state } = verifyOtp(otp, code, Date.now());
    setOtp(state);
    if (result.ok) {
      setSession({ email: otp.email });
      router.replace('/home');
      return;
    }
    setReason(result.reason);
  };

  const onResend = () => {
    if (secondsLeft > 0) return;
    setOtp(createOtp(otp.email, Date.now()));
    setCode('');
    setReason(null);
  };

  return (
    <Screen>
      <Text style={type.title}>{t(lang, 'otpTitle')}</Text>
      <Text style={[type.body, { marginTop: space.xs }]}>{t(lang, 'otpSentTo', { email: otp.email })}</Text>
      <View style={styles.hint}>
        <Text style={styles.hintText}>{t(lang, 'otpDemoHint')}</Text>
      </View>
      <TextInput
        value={code}
        onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
        onSubmitEditing={onVerify}
        keyboardType="number-pad"
        maxLength={6}
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        accessibilityLabel={t(lang, 'otpTitle')}
        editable={!otp.locked}
        style={[styles.input, errorText !== null && styles.inputError]}
      />
      {errorText && <Text style={styles.error}>{errorText}</Text>}
      <AppButton title={t(lang, 'verify')} onPress={onVerify} disabled={otp.locked || code.length === 0} />
      <AppButton
        title={secondsLeft > 0 ? t(lang, 'resendIn', { s: secondsLeft }) : t(lang, 'resend')}
        onPress={onResend}
        disabled={secondsLeft > 0}
        variant="secondary"
      />
      <AppButton title={t(lang, 'changeEmail')} onPress={() => router.back()} variant="ghost" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: space.sm,
    marginTop: space.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  hintText: { fontSize: 15, lineHeight: 22, color: colors.text, fontWeight: '600' },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    minHeight: 56,
    fontSize: 26,
    letterSpacing: 8,
    textAlign: 'center',
    color: colors.text,
    marginTop: space.md,
  },
  inputError: { borderColor: colors.error },
  error: { color: colors.error, fontSize: 15, lineHeight: 22, marginTop: space.xs },
});
