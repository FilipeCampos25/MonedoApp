import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../styles/theme';

export function LabelWithIcon({ icon, label }) {
  return (
    <View style={styles.labelRow}>
      {icon}
      <Text style={styles.labelRowText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    marginTop: 2,
  },
  labelRowText: {
    fontSize: 13,
    color: COLORS.black,
    fontWeight: '600',
    marginLeft: 6,
  },
});
