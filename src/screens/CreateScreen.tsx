import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";
import { createTask, getFormOptions } from "../services/api";

type PickerItem = { label: string; value: string };

export default function CreateScreen({ navigation }: { navigation: any }) {
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [priority, setPriority] = useState<string | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [categoryItems, setCategoryItems] = useState<PickerItem[]>([]);
  const [priorityItems, setPriorityItems] = useState<PickerItem[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [optionsError, setOptionsError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadOptions = useCallback(async () => {
    if (!token) return;
    setOptionsError("");
    try {
      const options = await getFormOptions(token);
      setCategoryItems(options.categories.map((value) => ({ label: value, value })));
      setPriorityItems(options.priorities.map((value) => ({
        label: value.charAt(0).toUpperCase() + value.slice(1),
        value,
      })));
    } catch (requestError) {
      setOptionsError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível carregar as opções.",
      );
    }
  }, [token]);

  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);

  function handleTimeChange(value: string) {
    const digits = value.replace(/[^0-9]/g, "").slice(0, 4);
    setTime(digits.length <= 2 ? digits : `${digits.slice(0, 2)}:${digits.slice(2)}`);
  }

  async function handleSave() {
    if (!token) return;
    if (!title.trim() || !date || !priority) {
      Alert.alert("Campos obrigatórios", "Preencha título, data e prioridade.");
      return;
    }
    if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      Alert.alert("Hora inválida", "Informe uma hora entre 00:00 e 23:59.");
      return;
    }

    setSaving(true);
    try {
      await createTask(token, {
        title: title.trim(),
        due_date: toIsoDate(date),
        time: time || null,
        category,
        priority,
        description: description.trim() || null,
      });
      resetForm();
      navigation.navigate("Estudos");
    } catch (requestError) {
      Alert.alert(
        "Erro ao salvar",
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível salvar a atividade.",
      );
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setTitle("");
    setDate(null);
    setTime("");
    setCategory(null);
    setPriority(null);
    setDescription("");
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.header} edges={["top"]}>
        <StatusBar barStyle="light-content" backgroundColor="#2563EB" />
        <Text style={styles.headerTitle}>Adicionar atividade</Text>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {optionsError ? (
          <Pressable onPress={() => void loadOptions()} style={styles.errorBox}>
            <Text style={styles.errorText}>{optionsError} Toque para tentar novamente.</Text>
          </Pressable>
        ) : null}

        <FieldLabel text="Título" />
        <TextInput
          onChangeText={setTitle}
          placeholder="Ex: Prova de Matemática"
          style={styles.input}
          value={title}
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <FieldLabel text="Data" />
            <Pressable onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
              <Ionicons name="calendar-outline" size={20} color="#64748B" />
              <Text style={date ? styles.inputText : styles.placeholder}>
                {date ? date.toLocaleDateString("pt-BR") : "dd/mm/aaaa"}
              </Text>
            </Pressable>
          </View>
          <View style={styles.half}>
            <FieldLabel text="Hora" />
            <TextInput
              keyboardType="numeric"
              maxLength={5}
              onChangeText={handleTimeChange}
              placeholder="HH:MM"
              style={styles.input}
              value={time}
            />
          </View>
        </View>

        {showDatePicker ? (
          <DateTimePicker
            display={Platform.OS === "ios" ? "inline" : "calendar"}
            minimumDate={new Date()}
            mode="date"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (event.type !== "dismissed" && selectedDate) setDate(selectedDate);
            }}
            value={date || new Date()}
          />
        ) : null}

        <FieldLabel text="Categoria" />
        <DropDownPicker
          items={categoryItems}
          listMode="SCROLLVIEW"
          open={categoryOpen}
          placeholder="Selecione uma categoria"
          setItems={setCategoryItems}
          setOpen={setCategoryOpen}
          setValue={setCategory}
          style={styles.dropdown}
          value={category}
          zIndex={3000}
          zIndexInverse={1000}
        />

        <FieldLabel text="Prioridade" />
        <DropDownPicker
          items={priorityItems}
          listMode="SCROLLVIEW"
          open={priorityOpen}
          placeholder="Selecione a prioridade"
          setItems={setPriorityItems}
          setOpen={setPriorityOpen}
          setValue={setPriority}
          style={styles.dropdown}
          value={priority}
          zIndex={2000}
          zIndexInverse={2000}
        />

        <FieldLabel text="Descrição" />
        <TextInput
          multiline
          onChangeText={setDescription}
          placeholder="Detalhes..."
          style={[styles.input, styles.description]}
          value={description}
        />

        <Pressable
          disabled={saving}
          onPress={() => void handleSave()}
          style={[styles.primaryButton, saving && styles.disabled]}
        >
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Salvar atividade</Text>}
        </Pressable>
        <Pressable disabled={saving} onPress={resetForm} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Limpar formulário</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function FieldLabel({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}

function toIsoDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const styles = StyleSheet.create({
  root: { backgroundColor: "#F8FAFC", flex: 1 },
  header: { backgroundColor: "#2563EB", padding: 18 },
  headerTitle: { color: "#FFFFFF", fontSize: 21, fontWeight: "800" },
  container: { padding: 20, paddingBottom: 40 },
  label: { color: "#334155", fontSize: 14, fontWeight: "700", marginBottom: 7, marginTop: 14 },
  input: { backgroundColor: "#FFFFFF", borderColor: "#CBD5E1", borderRadius: 10, borderWidth: 1, minHeight: 48, paddingHorizontal: 12 },
  description: { height: 90, paddingTop: 12, textAlignVertical: "top" },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  dateInput: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#CBD5E1", borderRadius: 10, borderWidth: 1, flexDirection: "row", minHeight: 48, paddingHorizontal: 12 },
  inputText: { color: "#0F172A", marginLeft: 8 },
  placeholder: { color: "#94A3B8", marginLeft: 8 },
  dropdown: { borderColor: "#CBD5E1", borderRadius: 10 },
  primaryButton: { alignItems: "center", backgroundColor: "#2563EB", borderRadius: 10, justifyContent: "center", marginTop: 28, minHeight: 52 },
  primaryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  secondaryButton: { alignItems: "center", padding: 16 },
  secondaryText: { color: "#2563EB", fontWeight: "700" },
  errorBox: { backgroundColor: "#FEE2E2", borderRadius: 8, padding: 10 },
  errorText: { color: "#B91C1C" },
  disabled: { opacity: 0.65 },
});
