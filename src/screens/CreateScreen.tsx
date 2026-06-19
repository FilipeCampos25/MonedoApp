import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";
import { MainTabsParamList } from "../navigation";
import { Task } from "../services/api";


type Props = BottomTabScreenProps<MainTabsParamList, "Adicionar">;
type Priority = Task["priority"];

const PRIORITIES: Array<{ value: Priority; label: string; color: string }> = [
  { value: "baixa", label: "Baixa", color: "#16A34A" },
  { value: "media", label: "Media", color: "#CA8A04" },
  { value: "alta", label: "Alta", color: "#EA580C" },
  { value: "urgente", label: "Urgente", color: "#DC2626" },
];


export default function CreateScreen({ navigation }: Props) {
  const { request } = useAuth();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayIso());
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<Priority>("media");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!title.trim() || !isIsoDate(date)) {
      Alert.alert(
        "Campos invalidos",
        "Informe o titulo e uma data no formato AAAA-MM-DD.",
      );
      return;
    }
    if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      Alert.alert("Hora invalida", "Use o formato HH:MM.");
      return;
    }

    setSaving(true);
    try {
      await request<Task>("/tasks", {
        method: "POST",
        body: {
          title: title.trim(),
          due_date: date,
          time: time || null,
          category: category.trim() || null,
          priority,
          description: description.trim() || null,
        },
      });
      clearForm();
      navigation.navigate("Estudos", { refresh: Date.now() });
    } catch (error) {
      Alert.alert(
        "Erro ao salvar",
        error instanceof Error ? error.message : "Tente novamente.",
      );
    } finally {
      setSaving(false);
    }
  }

  function clearForm() {
    setTitle("");
    setDate(todayIso());
    setTime("");
    setCategory("");
    setPriority("media");
    setDescription("");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Adicionar tarefa</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <FieldLabel label="Titulo" />
        <TextInput
          onChangeText={setTitle}
          placeholder="Ex: Prova de Matematica"
          style={styles.input}
          value={title}
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <FieldLabel label="Data" />
            <TextInput
              autoCapitalize="none"
              keyboardType="numbers-and-punctuation"
              onChangeText={setDate}
              placeholder="AAAA-MM-DD"
              style={styles.input}
              value={date}
            />
          </View>
          <View style={styles.half}>
            <FieldLabel label="Hora" />
            <TextInput
              keyboardType="numbers-and-punctuation"
              maxLength={5}
              onChangeText={setTime}
              placeholder="HH:MM"
              style={styles.input}
              value={time}
            />
          </View>
        </View>

        <FieldLabel label="Materia ou categoria" />
        <TextInput
          onChangeText={setCategory}
          placeholder="Ex: Matematica"
          style={styles.input}
          value={category}
        />

        <FieldLabel label="Prioridade" />
        <View style={styles.priorityRow}>
          {PRIORITIES.map((item) => {
            const selected = priority === item.value;
            return (
              <Pressable
                key={item.value}
                onPress={() => setPriority(item.value)}
                style={[
                  styles.priorityButton,
                  selected && { backgroundColor: item.color },
                ]}
              >
                <Text
                  style={[
                    styles.priorityText,
                    selected && styles.priorityTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <FieldLabel label="Descricao" />
        <TextInput
          multiline
          onChangeText={setDescription}
          placeholder="Detalhes da tarefa"
          style={[styles.input, styles.description]}
          textAlignVertical="top"
          value={description}
        />

        <Pressable
          disabled={saving}
          onPress={() => void save()}
          style={[styles.primaryButton, saving && styles.disabled]}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryText}>Salvar tarefa</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}


function FieldLabel({ label }: { label: string }) {
  return <Text style={styles.label}>{label}</Text>;
}


function todayIso(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}


function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T12:00:00`));
}


const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#F8FAFC",
    flex: 1,
  },
  header: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 17,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "800",
  },
  content: {
    padding: 18,
    paddingBottom: 36,
  },
  label: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 7,
    marginTop: 15,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#CBD5E1",
    borderRadius: 10,
    borderWidth: 1,
    color: "#0F172A",
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 13,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  half: {
    flex: 1,
  },
  priorityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  priorityButton: {
    backgroundColor: "#E2E8F0",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  priorityText: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
  },
  priorityTextSelected: {
    color: "#FFFFFF",
  },
  description: {
    minHeight: 100,
    paddingTop: 13,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#2563EB",
    borderRadius: 11,
    height: 50,
    justifyContent: "center",
    marginTop: 24,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  disabled: {
    opacity: 0.65,
  },
});
