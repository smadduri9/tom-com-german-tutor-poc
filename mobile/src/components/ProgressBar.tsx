import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';

export function ProgressBar({ percent, label }: { percent: number; label?: string }) {
  const p = Math.max(0, Math.min(100, percent));
  return (
    <View style={styles.track} accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ now: p, min: 0, max: 100 }}>
      <View style={[styles.fill, { width: `${p}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 10, borderRadius: 5, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.accent },
});
