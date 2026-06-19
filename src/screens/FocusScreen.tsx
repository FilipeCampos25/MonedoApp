import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

import { useAuth } from "../context/AuthContext";
import { createStudySession, getDashboard, getFormOptions } from "../services/api";
import type { Dashboard, FormOptions } from "../types/api";

type TimerStatus = "idle" | "running" | "paused";

const TIMER_SIZE = 252;
const TIMER_STROKE = 14;
const TIMER_RADIUS = (TIMER_SIZE - TIMER_STROKE) / 2;
const TIMER_CENTER = TIMER_SIZE / 2;
const TIMER_CIRCUMFERENCE = 2 * Math.PI * TIMER_RADIUS;

export default function FocusScreen() {
  const { token } = useAuth();
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [tick, setTick] = useState(() => Date.now());
  const [options, setOptions] = useState<FormOptions | null>(null);
  const [subjectIndex, setSubjectIndex] = useState(0);
  const [sessionTypeIndex, setSessionTypeIndex] = useState(0);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const seconds = useMemo(
    () => elapsedSeconds + (startedAt ? Math.max(0, Math.floor((tick - startedAt) / 1000)) : 0),
    [elapsedSeconds, startedAt, tick],
  );

  const loadData = useCallback(async () => {
    if (!token) return;
    setError("");
    try {
      const [formOptions, dashboardData] = await Promise.all([
        getFormOptions(),
        getDashboard(token),
      ]);
      setOptions(formOptions);
      setDashboard(dashboardData);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar o cronômetro.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(useCallback(() => {
    void loadData();
  }, [loadData]));

  useEffect(() => {
    if (status !== "running") return;
    const interval = setInterval(() => setTick(Date.now()), 250);
    return () => clearInterval(interval);
  }, [status]);

  const currentSubject = options?.subjects[subjectIndex] || "";
  const currentSessionType = options?.session_types[sessionTypeIndex] || "";
  const progress = Math.max((seconds % 3600) / 3600, seconds > 0 ? 0.04 : 0);
  const strokeDashoffset = TIMER_CIRCUMFERENCE * (1 - progress);

  function handlePlayPause() {
    if (!options?.subjects.length) {
      setError("As matérias ainda não foram carregadas.");
      return;
    }
    if (status === "running") {
      setElapsedSeconds(seconds);
      setStartedAt(null);
      setStatus("paused");
    } else {
      const now = Date.now();
      setTick(now);
      setStartedAt(now);
      setStatus("running");
    }
  }

  function handleReset() {
    setElapsedSeconds(0);
    setStartedAt(null);
    setStatus("idle");
  }

  async function handleStop() {
    if (!token || seconds <= 0 || !currentSubject) return;

    const duration = seconds;
    setElapsedSeconds(duration);
    setStartedAt(null);
    setStatus("paused");
    setSaving(true);
    setError("");
    try {
      await createStudySession(token, {
        duration,
        subject: currentSubject,
        session_type: currentSessionType || null,
      });
      handleReset();
      await loadData();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Não foi possível salvar a sessão.";
      setError(message);
      Alert.alert("Sessão não salva", `${message} O tempo foi preservado para tentar novamente.`);
    } finally {
      setSaving(false);
    }
  }

  if (loading && !dashboard) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#2563EB" /></View>;
  }

  const totalTodaySeconds = (dashboard?.today.study_seconds || 0) + seconds;
  const totalTodaySessions = (dashboard?.today.sessions || 0) + (seconds > 0 ? 1 : 0);
  const statusInfo = getStatusInfo(status);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F7FB" />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View><Text style={styles.title}>Cronômetro</Text><Text style={styles.subtitle}>Foque nos seus estudos</Text></View>
            <Ionicons name="bar-chart-outline" size={34} color="#2563EB" />
          </View>

          {error ? (
            <Pressable onPress={() => void loadData()} style={styles.errorBox}>
              <Text style={styles.errorText}>{error} Toque para tentar novamente.</Text>
            </Pressable>
          ) : null}

          <View style={styles.timerCard}>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
            </View>

            <View style={styles.timerArea}>
              <Svg width={TIMER_SIZE} height={TIMER_SIZE}>
                <Circle cx={TIMER_CENTER} cy={TIMER_CENTER} r={TIMER_RADIUS} stroke="#E5E7EB" strokeWidth={TIMER_STROKE} fill="none" />
                <Circle
                  cx={TIMER_CENTER}
                  cy={TIMER_CENTER}
                  r={TIMER_RADIUS}
                  stroke="#2563EB"
                  strokeWidth={TIMER_STROKE}
                  fill="none"
                  strokeDasharray={TIMER_CIRCUMFERENCE}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  rotation="-90"
                  originX={TIMER_CENTER}
                  originY={TIMER_CENTER}
                />
              </Svg>
              <View style={styles.timerCenter}>
                <Ionicons name="stopwatch-outline" size={42} color="#2563EB" />
                <Text style={styles.timerText}>{formatTimer(seconds)}</Text>
                <Text style={styles.timerLabel}>Tempo desta sessão</Text>
              </View>
            </View>

            <View style={styles.controlsRow}>
              <TimerButton icon="refresh" label="Resetar" onPress={handleReset} />
              <TimerButton primary icon={status === "running" ? "pause" : "play"} label={status === "running" ? "Pausar" : "Iniciar"} onPress={handlePlayPause} />
              <TimerButton disabled={saving || seconds <= 0} icon="square" label={saving ? "Salvando" : "Parar"} onPress={() => void handleStop()} />
            </View>
          </View>

          <View style={styles.optionsCard}>
            <OptionRow label="Matéria" value={currentSubject || "Indisponível"} onPress={() => setSubjectIndex((value) => options?.subjects.length ? (value + 1) % options.subjects.length : 0)} />
            <View style={styles.divider} />
            <OptionRow label="Sessão" value={currentSessionType || "Indisponível"} onPress={() => setSessionTypeIndex((value) => options?.session_types.length ? (value + 1) % options.session_types.length : 0)} />
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumo de hoje</Text>
            <View style={styles.summaryRow}>
              <Summary icon="time-outline" value={formatHours(totalTodaySeconds)} label="Horas estudadas" />
              <Summary icon="book-outline" value={String(totalTodaySessions)} label="Sessões" />
              <Summary icon="flame-outline" value={String(dashboard?.streak_days || 0)} label="Dias de sequência" />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function TimerButton({ icon, label, onPress, primary, disabled }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; primary?: boolean; disabled?: boolean }) {
  return (
    <View style={styles.controlItem}>
      <Pressable disabled={disabled} onPress={onPress} style={[primary ? styles.primaryControl : styles.secondaryControl, disabled && styles.disabled]}>
        <Ionicons name={icon} size={primary ? 38 : 28} color="#FFFFFF" />
      </Pressable>
      <Text style={styles.controlLabel}>{label}</Text>
    </View>
  );
}

function OptionRow({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.optionRow}>
      <Ionicons name="book-outline" size={25} color="#2563EB" />
      <View style={styles.optionText}><Text style={styles.optionLabel}>{label}</Text><Text style={styles.optionValue}>{value}</Text></View>
      <Ionicons name="chevron-forward" size={22} color="#94A3B8" />
    </Pressable>
  );
}

function Summary({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string }) {
  return <View style={styles.summaryItem}><Ionicons name={icon} size={25} color="#2563EB" /><Text style={styles.summaryValue}>{value}</Text><Text style={styles.summaryLabel}>{label}</Text></View>;
}

function getStatusInfo(status: TimerStatus) {
  if (status === "running") return { label: "Estudando", color: "#16A34A" };
  if (status === "paused") return { label: "Pausado", color: "#D97706" };
  return { label: "Pronto", color: "#64748B" };
}

function formatTimer(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function formatHours(totalSeconds: number) {
  return `${Math.floor(totalSeconds / 3600).toString().padStart(2, "0")}:${Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  root: { backgroundColor: "#F5F7FB", flex: 1 }, safeArea: { flex: 1 }, content: { padding: 18, paddingBottom: 30 }, centered: { alignItems: "center", flex: 1, justifyContent: "center" },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }, title: { color: "#2563EB", fontSize: 30, fontWeight: "900" }, subtitle: { color: "#64748B", fontWeight: "600" },
  errorBox: { backgroundColor: "#FEE2E2", borderRadius: 10, marginBottom: 14, padding: 10 }, errorText: { color: "#B91C1C" },
  timerCard: { backgroundColor: "#FFFFFF", borderRadius: 22, marginBottom: 16, padding: 18 }, statusRow: { alignItems: "center", flexDirection: "row", justifyContent: "center" }, statusDot: { borderRadius: 6, height: 12, marginRight: 8, width: 12 }, statusText: { fontSize: 17, fontWeight: "800" },
  timerArea: { alignItems: "center", height: TIMER_SIZE, justifyContent: "center", marginVertical: 16 }, timerCenter: { alignItems: "center", position: "absolute" }, timerText: { color: "#0F172A", fontSize: 40, fontWeight: "900", marginTop: 14 }, timerLabel: { color: "#64748B", fontWeight: "600", marginTop: 6 },
  controlsRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-around" }, controlItem: { alignItems: "center" }, secondaryControl: { alignItems: "center", backgroundColor: "#64748B", borderRadius: 34, height: 68, justifyContent: "center", width: 68 }, primaryControl: { alignItems: "center", backgroundColor: "#2563EB", borderRadius: 42, height: 84, justifyContent: "center", width: 84 }, controlLabel: { color: "#475569", fontSize: 12, fontWeight: "700", marginTop: 7 }, disabled: { opacity: 0.45 },
  optionsCard: { backgroundColor: "#FFFFFF", borderRadius: 18, marginBottom: 16, paddingHorizontal: 16 }, optionRow: { alignItems: "center", flexDirection: "row", paddingVertical: 15 }, optionText: { flex: 1, marginLeft: 13 }, optionLabel: { color: "#64748B", fontSize: 12 }, optionValue: { color: "#0F172A", fontSize: 16, fontWeight: "800", marginTop: 2 }, divider: { backgroundColor: "#E2E8F0", height: 1 },
  summaryCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 16 }, summaryTitle: { color: "#0F172A", fontSize: 18, fontWeight: "800", marginBottom: 18 }, summaryRow: { flexDirection: "row" }, summaryItem: { alignItems: "center", flex: 1 }, summaryValue: { color: "#0F172A", fontSize: 23, fontWeight: "900", marginTop: 8 }, summaryLabel: { color: "#64748B", fontSize: 11, marginTop: 4, textAlign: "center" },
});
