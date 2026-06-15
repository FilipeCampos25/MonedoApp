import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../styles/theme';

export function ProgressBar({ label, percent }) {
  return (
    <View>
      <View style={styles.progressRowTop}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressPercent}>{percent}%</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progressRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
  },
  progressPercent: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '600',
  },
  progressTrack: {
    width: '100%',
    height: 7,
    borderRadius: 999,
    backgroundColor: COLORS.lightTrack,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.darkTrack,
    borderRadius: 999,
  },
});
