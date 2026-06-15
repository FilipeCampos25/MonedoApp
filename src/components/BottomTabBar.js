import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../styles/theme';
import { BookIcon, PlusIcon, TargetIcon } from './icons';

export function BottomTabBar({ active, onStudies, onAdd, onGoals }) {
  return (
    <View style={styles.bottomBar}>
      <Pressable style={styles.tabItem} onPress={onStudies}>
        <BookIcon size={18} color={active === 'studies' ? COLORS.primary : COLORS.text} />
        <Text style={[styles.tabLabel, active === 'studies' ? styles.tabLabelActive : null]}>
          Estudos
        </Text>
      </Pressable>

      <Pressable style={styles.tabItem} onPress={onAdd}>
        <PlusIcon size={18} color={active === 'add' ? COLORS.primary : COLORS.text} />
        <Text style={[styles.tabLabel, active === 'add' ? styles.tabLabelActive : null]}>
          Adicionar
        </Text>
      </Pressable>

      <Pressable style={styles.tabItem} onPress={onGoals}>
        <TargetIcon size={18} color={active === 'goals' ? COLORS.primary : COLORS.text} />
        <Text style={[styles.tabLabel, active === 'goals' ? styles.tabLabelActive : null]}>
          Metas
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 62,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.text,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
