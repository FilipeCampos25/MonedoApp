import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text } from 'react-native';

import { COLORS } from '../styles/theme';
import { ChevronDownIcon } from './icons';

export function SelectField({ value, placeholder, options = [], onSelect }) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable style={styles.selectInput} onPress={() => setVisible(true)}>
        <Text style={[styles.selectText, !value ? styles.placeholderText : null]}>
          {value || placeholder}
        </Text>
        <ChevronDownIcon color={COLORS.lightMuted} />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Selecione uma op\u00e7\u00e3o</Text>

            {options.map((option) => (
              <Pressable
                key={option}
                style={styles.modalOption}
                onPress={() => {
                  onSelect(option);
                  setVisible(false);
                }}
              >
                <Text style={styles.modalOptionText}>{option}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selectInput: {
    height: 40,
    borderRadius: 6,
    backgroundColor: COLORS.input,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.input,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 14,
    color: COLORS.text,
  },
  placeholderText: {
    color: COLORS.lightMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.22)',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 8,
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalOptionText: {
    fontSize: 14,
    color: COLORS.text,
  },
});
