import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../styles/theme';

export function PriorityChip({ priority }) {
  let backgroundColor = COLORS.successBg;
  let textColor = COLORS.successText;
  let label = 'baixa';

  if (priority === 'alta') {
    backgroundColor = COLORS.dangerBg;
    textColor = COLORS.dangerText;
    label = 'alta';
  } else if (priority === 'm\u00e9dia' || priority === 'media') {
    backgroundColor = COLORS.warnBg;
    textColor = COLORS.warnText;
    label = 'm\u00e9dia';
  }

  return (
    <View style={[styles.priorityChip, { backgroundColor }]}>
      <Text style={[styles.priorityChipText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  priorityChip: {
    minWidth: 44,
    height: 22,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  priorityChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
