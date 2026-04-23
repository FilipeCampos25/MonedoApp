import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { LabelWithIcon } from '../components/LabelWithIcon';
import { SelectField } from '../components/SelectField';
import {
  BackIcon,
  CalendarIcon,
  ClockIcon,
  DocumentIcon,
  TagIcon,
} from '../components/icons';
import { COLORS } from '../styles/theme';

export function AddItemScreen({ categories, priorities, onBack, onCancel, onSave }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [hour, setHour] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [description, setDescription] = useState('');

  return (
    <SafeAreaView style={styles.addSafeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <KeyboardAvoidingView
        style={styles.addKeyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.addHeader}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <BackIcon color="#FFFFFF" />
          </Pressable>
          <Text style={styles.addHeaderTitle}>Adicionar Dados</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.addContent}
        >
          <LabelWithIcon
            icon={<DocumentIcon size={14} color={COLORS.text} />}
            label="T\u00edtulo"
          />
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Reuni\u00e3o importante"
            placeholderTextColor={COLORS.lightMuted}
            style={styles.textInput}
          />

          <View style={styles.doubleFieldsRow}>
            <View style={styles.doubleField}>
              <LabelWithIcon
                icon={<CalendarIcon size={14} color={COLORS.text} />}
                label="Data"
              />
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="dd/mm/aaaa"
                placeholderTextColor={COLORS.lightMuted}
                style={styles.textInput}
              />
            </View>

            <View style={[styles.doubleField, styles.doubleFieldRight]}>
              <LabelWithIcon
                icon={<ClockIcon size={14} color={COLORS.text} />}
                label="Hora"
              />
              <TextInput
                value={hour}
                onChangeText={setHour}
                placeholder="--:--"
                placeholderTextColor={COLORS.lightMuted}
                style={styles.textInput}
              />
            </View>
          </View>

          <LabelWithIcon
            icon={<TagIcon size={14} color={COLORS.text} />}
            label="Categoria"
          />
          <SelectField
            placeholder="Selecione uma categoria"
            value={category}
            options={categories}
            onSelect={setCategory}
          />

          <Text style={styles.plainFormLabel}>Prioridade</Text>
          <SelectField
            placeholder="Selecione a prioridade"
            value={priority}
            options={priorities}
            onSelect={setPriority}
          />

          <Text style={styles.plainFormLabel}>Descri\u00e7\u00e3o</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Adicione detalhes sobre a tarefa..."
            placeholderTextColor={COLORS.lightMuted}
            style={[styles.textInput, styles.descriptionInput]}
            multiline
            textAlignVertical="top"
          />

          <Pressable
            style={styles.primaryButton}
            onPress={() =>
              onSave({
                title,
                date,
                hour,
                category,
                priority,
                description,
              })
            }
          >
            <Text style={styles.primaryButtonText}>Salvar</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={onCancel}>
            <Text style={styles.secondaryButtonText}>Cancelar</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  addSafeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  addKeyboard: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  addHeader: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  addHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 4,
  },
  addContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 24,
  },
  textInput: {
    height: 40,
    borderRadius: 6,
    backgroundColor: COLORS.input,
    paddingHorizontal: 12,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.input,
  },
  doubleFieldsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  doubleField: {
    flex: 1,
  },
  doubleFieldRight: {
    marginLeft: 10,
  },
  plainFormLabel: {
    fontSize: 13,
    color: COLORS.black,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  descriptionInput: {
    height: 70,
    paddingTop: 12,
  },
  primaryButton: {
    height: 38,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 38,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: '500',
  },
});
