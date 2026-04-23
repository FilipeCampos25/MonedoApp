import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BottomTabBar } from '../components/BottomTabBar';
import { ProgressBar } from '../components/ProgressBar';
import { PlusIcon, TargetIcon } from '../components/icons';
import { COLORS, SHADOW } from '../styles/theme';

export function GoalsScreen({ data, onOpenStudies, onOpenAdd }) {
  return (
    <SafeAreaView style={styles.mainSafeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.mainScreen}>
        <View style={styles.blueHeader}>
          <Text style={styles.blueHeaderTitle}>Metas</Text>
          <TargetIcon size={18} color="#FFFFFF" />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.card}>
            <Text style={styles.smallMuted}>Meta da semana</Text>
            <Text style={styles.todayDate}>{data.weeklyGoal}</Text>
            <Text style={styles.goalHelperText}>{data.weeklyHelperText}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.card, styles.statCard]}>
              <Text style={styles.cardLabel}>Meta di\u00e1ria</Text>
              <Text style={styles.goalBigNumber}>{data.dailyGoal}</Text>
              <Text style={styles.smallMuted}>{data.dailyHelperText}</Text>
            </View>

            <View style={[styles.card, styles.statCard, styles.statCardRight]}>
              <Text style={styles.cardLabel}>Disciplinas</Text>
              <Text style={styles.goalBigNumber}>{data.disciplines}</Text>
              <Text style={styles.smallMuted}>{data.disciplinesHelperText}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Progresso Geral</Text>

            {data.progressSections.map((item, index) => (
              <View key={item.id}>
                <ProgressBar label={item.label} percent={item.percent} />
                {index !== data.progressSections.length - 1 ? (
                  <View style={styles.progressBlock} />
                ) : null}
              </View>
            ))}
          </View>
        </ScrollView>

        <Pressable style={styles.fab} onPress={onOpenAdd}>
          <PlusIcon size={22} color="#FFFFFF" />
        </Pressable>

        <BottomTabBar
          active="goals"
          onStudies={onOpenStudies}
          onAdd={onOpenAdd}
          onGoals={() => {}}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainSafeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  mainScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  blueHeader: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  blueHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 110,
  },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    ...SHADOW,
  },
  smallMuted: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 4,
  },
  todayDate: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.black,
  },
  goalHelperText: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    minHeight: 118,
    justifyContent: 'space-between',
  },
  statCardRight: {
    marginLeft: 10,
  },
  cardLabel: {
    fontSize: 13,
    color: '#293245',
    marginBottom: 10,
  },
  goalBigNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.black,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 14,
  },
  progressBlock: {
    marginBottom: 14,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 72,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW,
  },
});
