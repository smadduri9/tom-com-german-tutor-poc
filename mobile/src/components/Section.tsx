import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, space, type } from '../theme';

export function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      {title ? <Text style={type.heading}>{title}</Text> : null}
      {children}
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  section: { marginTop: space.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: space.md,
    marginTop: space.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
