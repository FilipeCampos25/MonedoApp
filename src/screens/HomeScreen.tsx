import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";
import {
  completeTask,
  getDashboard,
  getTasks,
  updatePreferences,
} from "../services/api";
import type { Dashboard, Task } from "../types/api";

const screenWidth = Dimensions.get("window").width;

export default function HomeScreen({ navigation }: { navigation?: any }) {
  const { signOut, token, user } = useAuth();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [goalModal, setGoalModal] = useState(false);
  const [goalDraft, setGoalDraft] = useState(4 * 3600);
  const [savingGoal, setSavingGoal] = useState(false);

  const loadData = useCallback(async (silent = false) => {
    if (!token) return;
    if (!silent) setLoading(true);
    setError("");
    try {
      const [dashboardData, taskData] = await Promise.all([
        getDashboard(token),
        getTasks(token),
      ]);
      setDashboard(dashboardData);
      setTasks(taskData);
      setGoalDraft(dashboardData.today.daily_goal_seconds);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível carregar seus estudos.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(useCallback(() => {
    void loadData();
  }, [loadData]));

  const pendingTasks = useMemo(
    () => tasks.filter((task) => !task.completed).slice(0, 5),
    [tasks],
  );

  async function handleComplete(taskId: number) {
    if (!token) return;
    try {
      await completeTask(token, taskId);
      await loadData(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Falha ao concluir tarefa.");
    }
  }

  async function saveGoal() {
    if (!token) return;
    setSavingGoal(true);
    try {
      await updatePreferences(token, goalDraft);
      setGoalModal(false);
      await loadData(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Falha ao salvar meta.");
    } finally {
      setSavingGoal(false);
    }
  }

  if (loading && !dashboard) {
    return <CenteredMessage loading text="Carregando seus estudos..." />;
  }

  if (!dashboard) {
    return <CenteredMessage text={error || "Dados indisponíveis."} onRetry={() => void loadData()} />;
  }

  const weekHours = dashboard.week.study_seconds_by_day.map((value) => value / 3600);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void loadData(true);
            }}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Meus Estudos</Text>
            <Text style={styles.welcome}>Olá, {user?.username}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityLabel="Acessar conta"
              onPress={() => navigation?.getParent()?.navigate("Account")}
              style={styles.headerButton}
            >
              <Ionicons name="person-circle-outline" size={30} color="#2563EB" />
            </Pressable>
            <Pressable
              accessibilityLabel="Sair"
              onPress={() => void signOut()}
              style={styles.headerButton}
            >
              <Ionicons name="log-out-outline" size={28} color="#2563EB" />
            </Pressable>
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.row}>
          <View style={styles.smallCard}>
            <MaterialIcons name="access-time" size={26} color="#3B82F6" />
            <Text style={styles.bigNumber}>{formatDuration(dashboard.today.study_seconds)}</Text>
            <Text style={styles.meta}>Hoje · {dashboard.today.goal_progress_percent}% da meta</Text>
            <Pressable onPress={() => setGoalModal(true)}>
              <Text style={styles.link}>Meta: {formatDuration(dashboard.today.daily_goal_seconds)}</Text>
            </Pressable>
          </View>
          <View style={styles.smallCard}>
            <Ionicons name="book-outline" size={26} color="#10B981" />
            <Text style={styles.bigNumber}>{dashboard.today.sessions}</Text>
            <Text style={styles.meta}>Sessões hoje</Text>
            <Text style={styles.link}>{dashboard.streak_days} dias de sequência</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Horas de estudo — semana</Text>
          <BarChart
            data={{
              labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
              datasets: [{ data: weekHours }],
            }}
            width={screenWidth - 64}
            height={220}
            yAxisLabel=""
            yAxisSuffix="h"
            chartConfig={chartConfig}
            fromZero
            style={styles.chart}
          />
          <Text style={styles.totalText}>
            Total: {formatDuration(dashboard.week.total_seconds)} nesta semana
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Distribuição por matéria</Text>
          {dashboard.subjects.length ? dashboard.subjects.map((subject) => (
            <View key={subject.subject} style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <Text style={styles.subject}>{subject.subject}</Text>
                <Text style={styles.progressText}>{subject.percentage}% · {formatDuration(subject.study_seconds)}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${subject.percentage}%` }]} />
              </View>
            </View>
          )) : <Text style={styles.empty}>Registre uma sessão para ver a distribuição semanal.</Text>}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Próximas atividades</Text>
          {pendingTasks.length ? pendingTasks.map((task) => (
            <View key={task.id} style={styles.task}>
              <Pressable
                accessibilityLabel={`Concluir ${task.title}`}
                onPress={() => void handleComplete(task.id)}
                style={styles.check}
              >
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              </Pressable>
              <View style={styles.taskText}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.meta}>{formatDate(task.due_date)}{task.time ? ` · ${task.time}` : ""}</Text>
              </View>
              <Text style={[styles.priority, { color: priorityColor(task.priority) }]}>{task.priority}</Text>
            </View>
          )) : <Text style={styles.empty}>Nenhuma atividade pendente.</Text>}
        </View>
      </ScrollView>

      <Modal transparent visible={goalModal} animationType="fade" onRequestClose={() => setGoalModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.sectionTitle}>Meta diária</Text>
            <Text style={styles.goalValue}>{formatDuration(goalDraft)}</Text>
            <View style={styles.goalControls}>
              <GoalButton label="− 30 min" onPress={() => setGoalDraft((value) => Math.max(1800, value - 1800))} />
              <GoalButton label="+ 30 min" onPress={() => setGoalDraft((value) => Math.min(43200, value + 1800))} />
            </View>
            <Pressable disabled={savingGoal} onPress={() => void saveGoal()} style={styles.saveButton}>
              {savingGoal ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveText}>Salvar meta</Text>}
            </Pressable>
            <Pressable onPress={() => setGoalModal(false)} style={styles.cancelButton}>
              <Text style={styles.link}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function CenteredMessage({ loading, text, onRetry }: { loading?: boolean; text: string; onRetry?: () => void }) {
  return (
    <View style={styles.centered}>
      {loading ? <ActivityIndicator size="large" color="#2563EB" /> : null}
      <Text style={styles.empty}>{text}</Text>
      {onRetry ? <Pressable onPress={onRetry}><Text style={styles.link}>Tentar novamente</Text></Pressable> : null}
    </View>
  );
}

function GoalButton({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.goalButton}><Text style={styles.link}>{label}</Text></Pressable>;
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h${minutes ? ` ${minutes}min` : ""}`;
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR");
}

function priorityColor(priority: string) {
  return { baixa: "#16A34A", media: "#CA8A04", alta: "#EA580C", urgente: "#DC2626" }[priority] || "#64748B";
}

const chartConfig = {
  backgroundGradientFrom: "#FFFFFF",
  backgroundGradientTo: "#FFFFFF",
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
  labelColor: () => "#64748B",
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FB", paddingHorizontal: 16 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginVertical: 14 },
  headerActions: { alignItems: "center", flexDirection: "row", gap: 4 },
  headerButton: { padding: 5 },
  title: { color: "#2563EB", fontSize: 24, fontWeight: "900" },
  welcome: { color: "#64748B", marginTop: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
  smallCard: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16, width: "48%" },
  card: { backgroundColor: "#FFFFFF", borderRadius: 14, marginBottom: 18, padding: 16 },
  bigNumber: { color: "#0F172A", fontSize: 24, fontWeight: "900", marginTop: 10 },
  meta: { color: "#64748B", fontSize: 13, marginTop: 4 },
  link: { color: "#2563EB", fontWeight: "700", marginTop: 8 },
  sectionTitle: { color: "#0F172A", fontSize: 18, fontWeight: "800", marginBottom: 14 },
  chart: { borderRadius: 12, marginLeft: -8 },
  totalText: { color: "#64748B", textAlign: "center" },
  progressItem: { marginBottom: 18 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  subject: { color: "#0F172A", fontWeight: "700" },
  progressText: { color: "#2563EB", fontSize: 12, fontWeight: "700" },
  progressTrack: { backgroundColor: "#E2E8F0", borderRadius: 4, height: 8 },
  progressFill: { backgroundColor: "#2563EB", borderRadius: 4, height: 8 },
  task: { alignItems: "center", borderTopColor: "#E2E8F0", borderTopWidth: 1, flexDirection: "row", paddingVertical: 12 },
  check: { alignItems: "center", backgroundColor: "#2563EB", borderRadius: 16, height: 32, justifyContent: "center", width: 32 },
  taskText: { flex: 1, marginLeft: 12 },
  taskTitle: { color: "#0F172A", fontWeight: "700" },
  priority: { fontSize: 12, fontWeight: "800", textTransform: "capitalize" },
  empty: { color: "#64748B", marginVertical: 10, textAlign: "center" },
  error: { backgroundColor: "#FEE2E2", color: "#B91C1C", marginBottom: 12, padding: 10 },
  centered: { alignItems: "center", flex: 1, justifyContent: "center", padding: 24 },
  modalBackdrop: { alignItems: "center", backgroundColor: "rgba(15,23,42,0.55)", flex: 1, justifyContent: "center", padding: 24 },
  modalCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 22, width: "100%" },
  goalValue: { color: "#0F172A", fontSize: 32, fontWeight: "900", textAlign: "center" },
  goalControls: { flexDirection: "row", gap: 12, marginVertical: 20 },
  goalButton: { alignItems: "center", backgroundColor: "#EFF6FF", borderRadius: 10, flex: 1, padding: 12 },
  saveButton: { alignItems: "center", backgroundColor: "#2563EB", borderRadius: 10, minHeight: 48, justifyContent: "center" },
  saveText: { color: "#FFFFFF", fontWeight: "800" },
  cancelButton: { alignItems: "center", padding: 8 },
});
