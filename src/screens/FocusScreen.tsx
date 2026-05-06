import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

type TimerStatus = "idle" | "running" | "paused";

const TIMER_SIZE = 252;
const TIMER_STROKE = 14;
const TIMER_RADIUS = (TIMER_SIZE - TIMER_STROKE) / 2;
const TIMER_CENTER = TIMER_SIZE / 2;
const TIMER_CIRCUMFERENCE = 2 * Math.PI * TIMER_RADIUS;

const SUBJECTS = ["Matemática", "Português", "História", "Inglês"];

const SESSION_TYPES = [
  "Resolução de exercícios",
  "Revisão de conteúdo",
  "Leitura guiada",
  "Simulado rápido",
];

const MOCK_TODAY_SECONDS = 2 * 3600 + 20 * 60;
const MOCK_TODAY_SESSIONS = 3;
const MOCK_STREAK_DAYS = 12;

export default function FocusScreen() {
  const [seconds, setSeconds] = useState(0);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [subjectIndex, setSubjectIndex] = useState(0);
  const [sessionTypeIndex, setSessionTypeIndex] = useState(0);
  const [completedSeconds, setCompletedSeconds] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);

  const isRunning = status === "running";
  const currentSubject = SUBJECTS[subjectIndex];
  const currentSessionType = SESSION_TYPES[sessionTypeIndex];

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      setSeconds((currentSeconds) => currentSeconds + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning]);

  const totalTodaySeconds = useMemo(() => {
    return MOCK_TODAY_SECONDS + completedSeconds + seconds;
  }, [completedSeconds, seconds]);

  const totalTodaySessions = useMemo(() => {
    const currentSession = seconds > 0 ? 1 : 0;
    return MOCK_TODAY_SESSIONS + completedSessions + currentSession;
  }, [completedSessions, seconds]);

  const progress = Math.max((seconds % 3600) / 3600, seconds > 0 ? 0.04 : 0);
  const strokeDashoffset = TIMER_CIRCUMFERENCE * (1 - progress);

  const knobAngle = progress * 2 * Math.PI - Math.PI / 2;
  const knobLeft = TIMER_CENTER + Math.cos(knobAngle) * TIMER_RADIUS - 10;
  const knobTop = TIMER_CENTER + Math.sin(knobAngle) * TIMER_RADIUS - 10;

  const statusInfo = getStatusInfo(status);

  function formatTimer(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const remainingSeconds = (totalSeconds % 60).toString().padStart(2, "0");

    return `${hours}:${minutes}:${remainingSeconds}`;
  }

  function formatSummary(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");

    return `${hours}:${minutes}`;
  }

  function handlePlayPause() {
    if (isRunning) {
      setStatus("paused");
      return;
    }

    setStatus("running");
  }

  function handleReset() {
    setSeconds(0);
    setStatus("idle");
  }

  function handleStop() {
    if (seconds <= 0) {
      setStatus("idle");
      return;
    }

    setCompletedSeconds((currentSeconds) => currentSeconds + seconds);
    setCompletedSessions((currentSessions) => currentSessions + 1);
    setSeconds(0);
    setStatus("idle");
  }

  function handleNextSubject() {
    setSubjectIndex((currentIndex) => (currentIndex + 1) % SUBJECTS.length);
  }

  function handleNextSessionType() {
    setSessionTypeIndex(
      (currentIndex) => (currentIndex + 1) % SESSION_TYPES.length,
    );
  }

  function handleGraphPress() {
    Alert.alert(
      "Gráfico em breve",
      "Por enquanto esta tela usa dados mockados somente no front.",
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#031225" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Cronômetro</Text>
              <Text style={styles.subtitle}>Foque nos seus estudos</Text>
            </View>

            <View style={styles.headerIcon}>
              <Ionicons name="bar-chart-outline" size={32} color="#F8FAFC" />
            </View>
          </View>

          <View style={styles.timerCard}>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: statusInfo.color },
                ]}
              />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>

            <View style={styles.timerArea}>
              <Svg width={TIMER_SIZE} height={TIMER_SIZE}>
                <Circle
                  cx={TIMER_CENTER}
                  cy={TIMER_CENTER}
                  r={TIMER_RADIUS}
                  stroke="#19365F"
                  strokeWidth={TIMER_STROKE}
                  fill="none"
                />

                <Circle
                  cx={TIMER_CENTER}
                  cy={TIMER_CENTER}
                  r={TIMER_RADIUS}
                  stroke="#2F86FF"
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

              {seconds > 0 && (
                <View style={[styles.knob, { left: knobLeft, top: knobTop }]} />
              )}

              <View style={styles.timerCenter}>
                <Ionicons name="stopwatch-outline" size={42} color="#2F86FF" />
                <Text style={styles.timerText}>{formatTimer(seconds)}</Text>
                <Text style={styles.timerLabel}>Tempo total de estudo</Text>
              </View>
            </View>

            <View style={styles.controlsRow}>
              <View style={styles.controlItem}>
                <Pressable onPress={handleReset} style={styles.secondaryButton}>
                  <Ionicons name="refresh" size={30} color="#FFFFFF" />
                </Pressable>
                <Text style={styles.controlLabel}>Resetar</Text>
              </View>

              <View style={styles.controlItem}>
                <Pressable
                  onPress={handlePlayPause}
                  style={styles.primaryButton}
                >
                  <Ionicons
                    name={isRunning ? "pause" : "play"}
                    size={42}
                    color="#FFFFFF"
                  />
                </Pressable>
                <Text style={styles.primaryControlLabel}>
                  {isRunning ? "Pausar" : "Iniciar"}
                </Text>
              </View>

              <View style={styles.controlItem}>
                <Pressable onPress={handleStop} style={styles.secondaryButton}>
                  <Ionicons name="square" size={26} color="#FFFFFF" />
                </Pressable>
                <Text style={styles.controlLabel}>Parar</Text>
              </View>
            </View>
          </View>

          <View style={styles.optionsCard}>
            <Pressable onPress={handleNextSubject} style={styles.optionRow}>
              <View style={styles.optionIcon}>
                <Ionicons name="book-outline" size={26} color="#2F86FF" />
              </View>

              <View style={styles.optionTextArea}>
                <Text style={styles.optionLabel}>Matéria</Text>
                <Text style={styles.optionValue}>{currentSubject}</Text>
              </View>

              <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
            </Pressable>

            <View style={styles.optionDivider} />

            <Pressable onPress={handleNextSessionType} style={styles.optionRow}>
              <View style={styles.optionIcon}>
                <Ionicons name="pricetag-outline" size={26} color="#2F86FF" />
              </View>

              <View style={styles.optionTextArea}>
                <Text style={styles.optionLabel}>Sessão</Text>
                <Text style={styles.optionValue}>{currentSessionType}</Text>
              </View>

              <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
            </Pressable>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>Resumo de hoje</Text>

              <Pressable onPress={handleGraphPress} style={styles.graphButton}>
                <Text style={styles.graphText}>Ver gráfico</Text>
                <Ionicons name="chevron-forward" size={18} color="#2F86FF" />
              </Pressable>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <View style={[styles.summaryIcon, styles.summaryIconBlue]}>
                  <Ionicons name="time-outline" size={24} color="#2F86FF" />
                </View>
                <Text style={styles.summaryValue}>
                  {formatSummary(totalTodaySeconds)}
                </Text>
                <Text style={styles.summaryLabel}>Horas estudadas</Text>
              </View>

              <View style={styles.verticalDivider} />

              <View style={styles.summaryItem}>
                <View style={[styles.summaryIcon, styles.summaryIconGreen]}>
                  <Ionicons
                    name="radio-button-on-outline"
                    size={24}
                    color="#5DD987"
                  />
                </View>
                <Text style={styles.summaryValue}>{totalTodaySessions}</Text>
                <Text style={styles.summaryLabel}>Sessões</Text>
              </View>

              <View style={styles.verticalDivider} />

              <View style={styles.summaryItem}>
                <View style={[styles.summaryIcon, styles.summaryIconOrange]}>
                  <Ionicons name="flame-outline" size={24} color="#F97316" />
                </View>
                <Text style={styles.summaryValue}>{MOCK_STREAK_DAYS}</Text>
                <Text style={styles.summaryLabel}>Dias de sequência</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function getStatusInfo(status: TimerStatus) {
  if (status === "running") {
    return { label: "Estudando", color: "#5DD987" };
  }

  if (status === "paused") {
    return { label: "Pausado", color: "#FBBF24" };
  }

  return { label: "Pronto", color: "#60A5FA" };
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#031225",
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingBottom: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 34,
    fontWeight: "800",
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 4,
  },
  headerIcon: {
    alignItems: "center",
    backgroundColor: "#142D52",
    borderRadius: 34,
    height: 68,
    justifyContent: "center",
    width: 68,
  },
  timerCard: {
    backgroundColor: "#081B33",
    borderColor: "#183A63",
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 18,
    padding: 20,
  },
  statusRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 18,
  },
  statusDot: {
    borderRadius: 6,
    height: 12,
    marginRight: 10,
    width: 12,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "800",
  },
  timerArea: {
    alignItems: "center",
    height: TIMER_SIZE,
    justifyContent: "center",
    marginBottom: 24,
    position: "relative",
  },
  knob: {
    backgroundColor: "#2F86FF",
    borderColor: "#2F86FF",
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    position: "absolute",
    width: 20,
  },
  timerCenter: {
    alignItems: "center",
    position: "absolute",
  },
  timerText: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginTop: 18,
  },
  timerLabel: {
    color: "#94A3B8",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 10,
  },
  controlsRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  controlItem: {
    alignItems: "center",
    flex: 1,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#142D52",
    borderRadius: 38,
    height: 76,
    justifyContent: "center",
    width: 76,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#2F86FF",
    borderRadius: 48,
    height: 96,
    justifyContent: "center",
    width: 96,
  },
  controlLabel: {
    color: "#94A3B8",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 10,
  },
  primaryControlLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 10,
  },
  optionsCard: {
    backgroundColor: "#081B33",
    borderColor: "#183A63",
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 18,
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  optionRow: {
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: 16,
  },
  optionIcon: {
    alignItems: "center",
    backgroundColor: "#0C2A52",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    marginRight: 14,
    width: 48,
  },
  optionTextArea: {
    flex: 1,
  },
  optionLabel: {
    color: "#94A3B8",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  optionValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  optionDivider: {
    backgroundColor: "#183A63",
    height: 1,
    marginLeft: 62,
  },
  summaryCard: {
    backgroundColor: "#081B33",
    borderColor: "#183A63",
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
  summaryHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  summaryTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },
  graphButton: {
    alignItems: "center",
    flexDirection: "row",
  },
  graphText: {
    color: "#2F86FF",
    fontSize: 14,
    fontWeight: "800",
    marginRight: 2,
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryIcon: {
    alignItems: "center",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    marginBottom: 12,
    width: 48,
  },
  summaryIconBlue: {
    backgroundColor: "#0C2A52",
  },
  summaryIconGreen: {
    backgroundColor: "#11392F",
  },
  summaryIconOrange: {
    backgroundColor: "#3C2612",
  },
  summaryValue: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
  },
  summaryLabel: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
    textAlign: "center",
  },
  verticalDivider: {
    backgroundColor: "#183A63",
    height: 72,
    width: 1,
  },
});
