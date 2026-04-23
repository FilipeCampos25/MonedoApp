import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../styles/theme';

export function CalendarIcon({ size = 18, color = '#FFFFFF' }) {
  return (
    <View
      style={[
        styles.calendarIcon,
        {
          width: size,
          height: size,
          borderColor: color,
          borderRadius: 4,
        },
      ]}
    >
      <View
        style={[
          styles.calendarLine,
          {
            backgroundColor: color,
            top: size * 0.32,
            left: 2,
            right: 2,
          },
        ]}
      />
      <View
        style={[
          styles.calendarRing,
          {
            backgroundColor: color,
            left: size * 0.22,
            height: size * 0.24,
          },
        ]}
      />
      <View
        style={[
          styles.calendarRing,
          {
            backgroundColor: color,
            right: size * 0.22,
            height: size * 0.24,
          },
        ]}
      />
    </View>
  );
}

export function ClockIcon({ size = 18, color = COLORS.primary }) {
  return (
    <View
      style={[
        styles.clockCircle,
        {
          width: size,
          height: size,
          borderColor: color,
          borderRadius: size / 2,
        },
      ]}
    >
      <View
        style={[
          styles.clockHandVertical,
          {
            backgroundColor: color,
            height: size * 0.28,
            top: size * 0.22,
          },
        ]}
      />
      <View
        style={[
          styles.clockHandHorizontal,
          {
            backgroundColor: color,
            width: size * 0.22,
            top: size * 0.48,
            left: size * 0.48,
          },
        ]}
      />
    </View>
  );
}

export function BookIcon({ size = 18, color = COLORS.text }) {
  return (
    <View style={{ width: size + 2, height: size, flexDirection: 'row' }}>
      <View
        style={[
          styles.bookHalf,
          {
            borderColor: color,
            borderTopLeftRadius: 3,
            borderBottomLeftRadius: 3,
            marginRight: 1,
          },
        ]}
      />
      <View
        style={[
          styles.bookHalf,
          {
            borderColor: color,
            borderTopRightRadius: 3,
            borderBottomRightRadius: 3,
            marginLeft: 1,
          },
        ]}
      />
    </View>
  );
}

export function TargetIcon({ size = 18, color = COLORS.text }) {
  return (
    <View
      style={[
        styles.targetOuter,
        {
          width: size,
          height: size,
          borderColor: color,
          borderRadius: size / 2,
        },
      ]}
    >
      <View
        style={[
          styles.targetInner,
          {
            width: size * 0.5,
            height: size * 0.5,
            borderRadius: (size * 0.5) / 2,
            borderColor: color,
          },
        ]}
      />
      <View
        style={[
          styles.targetDot,
          {
            width: size * 0.16,
            height: size * 0.16,
            borderRadius: (size * 0.16) / 2,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

export function PlusIcon({ size = 18, color = COLORS.primary }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          position: 'absolute',
          width: 2,
          height: size * 0.72,
          backgroundColor: color,
          borderRadius: 99,
        }}
      />
      <View
        style={{
          position: 'absolute',
          height: 2,
          width: size * 0.72,
          backgroundColor: color,
          borderRadius: 99,
        }}
      />
    </View>
  );
}

export function BackIcon({ color = '#FFFFFF' }) {
  return <Text style={[styles.backIconText, { color }]}>\u2039</Text>;
}

export function DocumentIcon({ size = 14, color = COLORS.text }) {
  return (
    <View
      style={{
        width: size * 0.82,
        height: size,
        borderWidth: 1.4,
        borderColor: color,
        borderRadius: 2,
        justifyContent: 'center',
        paddingHorizontal: 2,
      }}
    >
      <View style={{ height: 1.4, backgroundColor: color, marginBottom: 2 }} />
      <View style={{ height: 1.4, backgroundColor: color, width: '70%' }} />
    </View>
  );
}

export function TagIcon({ size = 14, color = COLORS.text }) {
  return (
    <View
      style={{
        width: size,
        height: size * 0.72,
        borderWidth: 1.4,
        borderColor: color,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingLeft: 3,
      }}
    >
      <View
        style={{
          width: 3,
          height: 3,
          borderRadius: 1.5,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

export function ProgressIcon({ size = 16, color = COLORS.primary }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.6,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: size * 0.28,
          height: size * 0.28,
          borderRadius: (size * 0.28) / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

export function ChevronDownIcon({ color = COLORS.lightMuted }) {
  return <Text style={[styles.chevronIconText, { color }]}>\u2304</Text>;
}

const styles = StyleSheet.create({
  calendarIcon: {
    borderWidth: 1.6,
    position: 'relative',
  },
  calendarLine: {
    position: 'absolute',
    height: 1.5,
  },
  calendarRing: {
    position: 'absolute',
    width: 1.8,
    top: -1,
    borderRadius: 1,
  },
  clockCircle: {
    borderWidth: 1.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockHandVertical: {
    position: 'absolute',
    width: 1.6,
    borderRadius: 99,
  },
  clockHandHorizontal: {
    position: 'absolute',
    height: 1.6,
    borderRadius: 99,
  },
  bookHalf: {
    flex: 1,
    borderWidth: 1.6,
  },
  targetOuter: {
    borderWidth: 1.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetInner: {
    position: 'absolute',
    borderWidth: 1.2,
  },
  targetDot: {
    position: 'absolute',
  },
  backIconText: {
    fontSize: 30,
    lineHeight: 30,
    fontWeight: '300',
    marginTop: -4,
  },
  chevronIconText: {
    fontSize: 18,
    lineHeight: 18,
    marginTop: -3,
  },
});
