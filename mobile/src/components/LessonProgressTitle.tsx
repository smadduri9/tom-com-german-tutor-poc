import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

// Shown inside the navigation header: lesson title on top, progress bar under it.
export function LessonProgressTitle({ title, fraction, label }: { title: string; fraction: number; label: string }) {
  return (
    <View style={styles.wrap} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(fraction * 100) }}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(fraction * 100)}%` }]} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', width: 200 },
  title: { fontSize: 17, lineHeight: 22, fontWeight: '700', color: colors.primary },
  track: { height: 4, width: '100%', borderRadius: 2, backgroundColor: colors.border, marginTop: 2, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.accent },
  label: { fontSize: 11, lineHeight: 14, color: colors.muted, marginTop: 1 },
});
