import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../styles/theme';
import { asNumber } from '../utils/base';

function formatAxisValue(value) {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toFixed(1);
}

export function MiniBarChart({ data = [] }) {
  const safeData = Array.isArray(data) ? data : [];
  const maxFromData = safeData.reduce(
    (max, item) => Math.max(max, asNumber(item.value, 0)),
    0,
  );
  const chartTop = Math.max(4, Math.ceil(maxFromData));
  const yAxisValues = [chartTop, chartTop * 0.75, chartTop * 0.5, chartTop * 0.25, 0];

  return (
    <View style={styles.chartWrap}>
      <View style={styles.chartYAxis}>
        {yAxisValues.map((value, index) => (
          <Text key={`${value}-${index}`} style={styles.chartYAxisLabel}>
            {formatAxisValue(value)}
          </Text>
        ))}
      </View>

      <View style={styles.chartAreaWrap}>
        <View style={styles.chartArea}>
          {[0, 1, 2, 3].map((line) => (
            <View
              key={`h-${line}`}
              style={[
                styles.chartHorizontalLine,
                { bottom: (line * 112) / 4 },
              ]}
            />
          ))}

          {safeData.slice(0, -1).map((_, index) => (
            <View
              key={`v-${index}`}
              style={[
                styles.chartVerticalLine,
                { left: `${((index + 1) / safeData.length) * 100}%` },
              ]}
            />
          ))}

          <View style={styles.chartBarsRow}>
            {safeData.map((item) => (
              <View key={item.day} style={styles.chartBarGroup}>
                <View
                  style={[
                    styles.chartBar,
                    { height: chartTop > 0 ? (asNumber(item.value, 0) / chartTop) * 92 : 0 },
                  ]}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.chartLabelsRow}>
          {safeData.map((item) => (
            <Text key={item.day} style={styles.chartDayLabel}>
              {item.day}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  chartYAxis: {
    width: 24,
    height: 112,
    justifyContent: 'space-between',
    paddingBottom: 2,
  },
  chartYAxisLabel: {
    fontSize: 11,
    color: COLORS.muted,
    textAlign: 'right',
  },
  chartAreaWrap: {
    flex: 1,
    marginLeft: 8,
  },
  chartArea: {
    height: 112,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    paddingHorizontal: 4,
  },
  chartHorizontalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  chartVerticalLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderLeftWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  chartBarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
  },
  chartBarGroup: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: 16,
    backgroundColor: '#4C86F7',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  chartLabelsRow: {
    flexDirection: 'row',
    marginTop: 6,
    paddingLeft: 2,
    paddingRight: 2,
  },
  chartDayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    color: '#4B5563',
  },
});
