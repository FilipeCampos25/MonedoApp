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
import { MiniBarChart } from '../components/MiniBarChart';
import { PriorityChip } from '../components/PriorityChip';
import { ProgressBar } from '../components/ProgressBar';
import { BookIcon, CalendarIcon, ClockIcon, PlusIcon, ProgressIcon } from '../components/icons';
import { COLORS, SHADOW } from '../styles/theme';

export function StudiesScreen({ data, onOpenAdd, onOpenGoals }) {
  const activities = Array.isArray(data.activities) ? data.activities : [];

  return (
    <SafeAreaView style={styles.mainSafeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.mainScreen}>
        <View style={styles.blueHeader}>
          <Text style={styles.blueHeaderTitle}>Meus Estudos</Text>
          <CalendarIcon size={18} color="#FFFFFF" />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.card}>
            <Text style={styles.smallMuted}>Hoje</Text>
            <Text style={styles.todayDate}>{data.todayLabel}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.card, styles.statCard]}>
              <Text style={styles.cardLabel}>Horas Hoje</Text>
              <View style={styles.statValueRow}>
                <Text style={styles.statValue}>{data.hoursToday}</Text>
                <ClockIcon size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.smallMuted}>{data.hoursGoalLabel}</Text>
            </View>

            <View style={[styles.card, styles.statCard, styles.statCardRight]}>
              <Text style={styles.cardLabel}>Sess\u00f5es</Text>
              <View style={styles.statValueRow}>
                <Text style={styles.statValue}>{data.sessions}</Text>
                <BookIcon size={24} color={COLORS.green} />
              </View>
              <Text style={styles.smallMuted}>{data.sessionsHelperText}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Horas de Estudo - Semana</Text>
            <MiniBarChart data={data.chartData} />
            <Text style={styles.chartTotal}>{data.weekTotalText}</Text>
          </View>

          <View style={[styles.card, styles.progressCardSpacing]}>
            <View style={styles.sectionTitleRow}>
              <ProgressIcon size={16} color={COLORS.primary} />
              <Text style={styles.sectionTitleInline}>Progresso das Mat\u00e9rias</Text>
            </View>

            {data.subjectProgress.map((item, index) => (
              <View
                key={item.id}
                style={index === data.subjectProgress.length - 1 ? null : styles.progressBlock}
              >
                <ProgressBar label={item.label} percent={item.percent} />
              </View>
            ))}
          </View>

          <View style={[styles.card, styles.activitiesCard]}>
            <Text style={styles.activitiesTitle}>Pr\u00f3ximas Atividades</Text>

            {activities.slice(0, 4).map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.activityItem,
                  index === activities.slice(0, 4).length - 1 ? styles.noMarginBottom : null,
                ]}
              >
                <View style={styles.activityTextWrap}>
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.activityDate}>{item.dateLabel}</Text>
                </View>

                <PriorityChip priority={item.priority} />
              </View>
            ))}
          </View>
        </ScrollView>

        <Pressable style={styles.fab} onPress={onOpenAdd}>
          <PlusIcon size={22} color="#FFFFFF" />
        </Pressable>

        <BottomTabBar
          active="studies"
          onStudies={() => {}}
          onAdd={onOpenAdd}
          onGoals={onOpenGoals}
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
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.black,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 14,
  },
  chartTotal: {
    marginTop: 10,
    fontSize: 12,
    color: '#4C63A8',
  },
  progressCardSpacing: {
    marginTop: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleInline: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
    marginLeft: 8,
  },
  progressBlock: {
    marginBottom: 14,
  },
  activitiesCard: {
    marginTop: 12,
  },
  activitiesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 14,
  },
  activityItem: {
    minHeight: 58,
    backgroundColor: COLORS.input,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 3,
  },
  activityDate: {
    fontSize: 12,
    color: COLORS.muted,
  },
  noMarginBottom: {
    marginBottom: 0,
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
