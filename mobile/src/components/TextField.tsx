import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { useApp } from '../state/AppContext';
import { t } from '../i18n/t';
import { colors, space } from '../theme';

type Props = TextInputProps & { label: string; hint?: string; secret?: boolean };

// Labelled input; `secret` adds a show/hide eye for passwords.
export function TextField({ label, hint, secret = false, style, ...rest }: Props) {
  const { lang } = useApp();
  const [hidden, setHidden] = useState(secret);
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.box}>
        <TextInput
          {...rest}
          accessibilityLabel={label}
          secureTextEntry={hidden}
          placeholderTextColor={colors.muted}
          style={[styles.input, style]}
        />
        {secret && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? t(lang, 'showPassword') : t(lang, 'hidePassword')}
            hitSlop={8}
            style={styles.eye}
          >
            <Text style={styles.eyeText}>{hidden ? '👁' : '🙈'}</Text>
          </Pressable>
        )}
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: space.md },
  label: { fontSize: 15, lineHeight: 22, color: colors.muted, marginBottom: space.xs },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  input: { flex: 1, minHeight: 52, paddingHorizontal: space.md, fontSize: 17, color: colors.text },
  eye: { paddingHorizontal: space.md, minHeight: 52, justifyContent: 'center' },
  eyeText: { fontSize: 20 },
  hint: { fontSize: 13, lineHeight: 20, color: colors.muted, marginTop: space.xs },
});
