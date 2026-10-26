import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, space } from '../theme';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  accessibilityLabel?: string;
};

export function AppButton({ title, onPress, variant = 'primary', disabled = false, accessibilityLabel }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.text, variant !== 'primary' && styles.textAlt]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 12,
    paddingHorizontal: space.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.sm,
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.white, borderWidth: 2, borderColor: colors.primary },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.8 },
  text: { color: colors.white, fontSize: 17, lineHeight: 26, fontWeight: '600' },
  textAlt: { color: colors.primary },
});
