import React, { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { AppButton } from '../../src/components/AppButton';
import { useApp } from '../../src/state/AppContext';
import { createOtp, isValidEmail } from '../../src/logic/otp';
import { t } from '../../src/i18n/t';
import { colors, space, type } from '../../src/theme';

export default function EmailScreen() {
  const { lang, setOtp } = useApp();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const invalid = submitted && !isValidEmail(email);

  const onSend = () => {
    setSubmitted(true);
    if (!isValidEmail(email)) return;
    setOtp(createOtp(email, Date.now()));
    router.push('/login/otp');
  };

  return (
    <Screen>
      <Text style={type.title}>{t(lang, 'emailTitle')}</Text>
      <Text style={[type.small, { marginTop: space.md }]}>{t(lang, 'emailLabel')}</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        onSubmitEditing={onSend}
        placeholder="name@example.com"
        placeholderTextColor={colors.muted}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="send"
        accessibilityLabel={t(lang, 'emailLabel')}
        style={[styles.input, invalid && styles.inputError]}
      />
      {invalid && <Text style={styles.error}>{t(lang, 'emailInvalid')}</Text>}
      <AppButton title={t(lang, 'sendCode')} onPress={onSend} disabled={email.trim().length === 0} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: space.md,
    minHeight: 52,
    fontSize: 17,
    color: colors.text,
    marginTop: space.xs,
  },
  inputError: { borderColor: colors.error },
  error: { color: colors.error, fontSize: 15, lineHeight: 22, marginTop: space.xs },
});
