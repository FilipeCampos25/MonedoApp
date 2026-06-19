import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
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
import { Dashboard, StudySession } from "../services/api";


type TimerStatus = "idle" | "running" | "paused";


export default function FocusScreen() {
  const { request } = useAuth();
  const [seconds, setSeconds] = useState(0);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [subject, setSubject] = useState("Geral");
  const [sessionType, setSessionType] = useState("Foco");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [saving, setSaving] = useState(false);

  const loadSummary = useCallback(async () => {
    try {
      setDashboard(await request<Dashboard>("/dashboard"));
    } catch {
      // The timer remains usable while the summary is temporarily unavailable.
    }
  }, [request]);

  useFocusEffect(
    useCallback(() => {
      void loadSummary();
    }, [loadSummary]),
  );

  useEffect(() => {
    if (status !== "running") {
      return;
    }
    const timer = setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  async function saveSession() {
    if (seconds <= 0 || saving) {
      return;
    }
    if (!subject.trim()) {
      Alert.alert("Materia obrigatoria", "Informe a materia estudada.");
      return;
    }

    setStatus("paused");
    setSaving(true);
    try {
      await request<StudySession>("/study/sessions", {
        method: "POST",
        body: {
          duration: seconds,
          subject: subject.trim(),
          session_type: sessionType.trim() || null,
        },
      });
      setSeconds(0);
      setStatus("idle");
      await loadSummary();
      Alert.alert("Sessao salva", "O tempo foi registrado com sucesso.");
    } catch (error) {
      Alert.alert(
        "Falha ao salvar",
        `${
          error instanceof Error ? error.message : "Tente novamente."
        }\n\nO tempo foi mantido para uma nova tentativa.`,
      );
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setSeconds(0);
    setStatus("idle");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <Text style={styles.title}>Cronometro</Text>
          <Text style={styles.subtitle}>Registre seu tempo real de estudo</Text>
        </View>

        <View style={styles.timerCard}>
          <Text style={styles.status}>{statusLabel(status)}</Text>
          <Text style={styles.timer}>{formatTimer(seconds)}</Text>
          <View style={styles.controls}>
            <ControlButton
              icon="refresh"
              label="Resetar"
              onPress={reset}
              secondary
            />
            <ControlButton
              icon={status === "running" ? "pause" : "play"}
              label={status === "running" ? "Pausar" : "Iniciar"}
              onPress={() =>
                setStatus((current) =>
                  current === "running" ? "paused" : "running",
                )
              }
            />
            <ControlButton
              disabled={seconds === 0 || saving}
              icon="stop"
              label={saving ? "Salvando" : "Parar"}
              onPress={() => void saveSession()}
              secondary
            />
          </View>
          {saving && <ActivityIndicator color="#2563EB" style={styles.saving} />}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Materia</Text>
          <TextInput
            onChangeText={setSubject}
            placeholder="Ex: Matematica"
            style={styles.input}
            value={subject}
          />
          <Text style={styles.label}>Tipo de sessao</Text>
          <TextInput
            onChangeText={setSessionType}
            placeholder="Ex: Revisao"
            style={styles.input}
            value={sessionType}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Resumo de hoje</Text>
          <View style={styles.summaryRow}>
            <Summary
              icon="time-outline"
              label="Tempo"
              value={formatSummary(dashboard?.today.study_seconds ?? 0)}
            />
            <Summary
              icon="book-outline"
              label="Sessoes"
              value={String(dashboard?.today.sessions ?? 0)}
            />
            <Summary
              icon="checkbox-outline"
              label="Tarefas"
              value={String(dashboard?.tasks.completed ?? 0)}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


function ControlButton({
  disabled = false,
  icon,
  label,
  onPress,
  secondary = false,
}: {
  disabled?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  secondary?: boolean;
}) {
  return (
    <View style={styles.controlItem}>
      <Pressable
        disabled={disabled}
        onPress={onPress}
        style={[
          styles.controlButton,
          secondary && styles.secondaryButton,
          disabled && styles.disabled,
        ]}
      >
        <Ionicons
          name={icon}
          size={secondary ? 27 : 34}
          color={secondary ? "#2563EB" : "#FFFFFF"}
        />
      </Pressable>
      <Text style={styles.controlLabel}>{label}</Text>
    </View>
  );
}


function Summary({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summary}>
      <Ionicons name={icon} size={24} color="#2563EB" />
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}


function formatTimer(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}


function formatSummary(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}


function statusLabel(status: TimerStatus): string {
  if (status === "running") {
    return "Estudando";
  }
  if (status === "paused") {
    return "Pausado";
  }
  return "Pronto";
}


const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#F8FAFC",
    flex: 1,
  },
  content: {
    gap: 16,
    padding: 18,
    paddingBottom: 36,
  },
  title: {
    color: "#2563EB",
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: "#64748B",
    marginTop: 3,
  },
  timerCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
  },
  status: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "800",
  },
  timer: {
    color: "#0F172A",
    fontSize: 46,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
    marginVertical: 28,
  },
  controls: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  controlItem: {
    alignItems: "center",
    flex: 1,
  },
  controlButton: {
    alignItems: "center",
    backgroundColor: "#2563EB",
    borderRadius: 37,
    height: 74,
    justifyContent: "center",
    width: 74,
  },
  secondaryButton: {
    backgroundColor: "#DBEAFE",
  },
  disabled: {
    opacity: 0.45,
  },
  controlLabel: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
  },
  saving: {
    marginTop: 14,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 18,
    borderWidth: 1,
    padding: 17,
  },
  label: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderColor: "#CBD5E1",
    borderRadius: 10,
    borderWidth: 1,
    color: "#0F172A",
    height: 46,
    paddingHorizontal: 13,
  },
  sectionTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "800",
  },
  summaryRow: {
    flexDirection: "row",
    marginTop: 18,
  },
  summary: {
    alignItems: "center",
    flex: 1,
  },
  summaryValue: {
    color: "#0F172A",
    fontSize: 19,
    fontWeight: "800",
    marginTop: 7,
  },
  summaryLabel: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 2,
  },
});
