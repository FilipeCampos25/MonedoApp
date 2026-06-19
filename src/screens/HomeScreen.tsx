import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";
import { Dashboard, Task } from "../services/api";


export default function HomeScreen() {
  const { request, session, signOut } = useAuth();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const [dashboardData, taskData] = await Promise.all([
        request<Dashboard>("/dashboard"),
        request<Task[]>("/tasks"),
      ]);
      setDashboard(dashboardData);
      setTasks(taskData);
    } catch (error) {
      Alert.alert(
        "Erro ao carregar",
        error instanceof Error ? error.message : "Tente novamente.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [request]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function completeTask(taskId: number) {
    try {
      await request<Task>(`/tasks/${taskId}/complete`, { method: "PATCH" });
      await load(true);
    } catch (error) {
      Alert.alert(
        "Erro ao concluir",
        error instanceof Error ? error.message : "Tente novamente.",
      );
    }
  }

  const weekValues = dashboard?.week.study_seconds_by_day ?? [];
  const maxWeekValue = Math.max(...weekValues, 1);
  const pendingTasks = tasks.filter((task) => !task.completed);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Meus estudos</Text>
          <Text style={styles.email}>{session?.user.email}</Text>
        </View>
        <Pressable onPress={() => void signOut()} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={23} color="#2563EB" />
        </Pressable>
      </View>

      {loading && !dashboard ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void load(true);
              }}
            />
          }
        >
          <View style={styles.statsRow}>
            <SummaryCard
              icon="time-outline"
              label="Hoje"
              value={formatDuration(dashboard?.today.study_seconds ?? 0)}
            />
            <SummaryCard
              icon="book-outline"
              label="Sessoes"
              value={String(dashboard?.today.sessions ?? 0)}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Ultimos 7 dias</Text>
            <View style={styles.chart}>
              {weekValues.map((seconds, index) => (
                <View key={dashboard?.week.dates[index] ?? index} style={styles.barColumn}>
                  <Text style={styles.barValue}>
                    {seconds > 0 ? `${Math.round(seconds / 60)}m` : ""}
                  </Text>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(
                          5,
                          (seconds / maxWeekValue) * 92,
                        ),
                      },
                    ]}
                  />
                  <Text style={styles.barLabel}>
                    {weekday(dashboard?.week.dates[index])}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tarefas pendentes</Text>
              <Text style={styles.badge}>
                {dashboard?.tasks.pending ?? pendingTasks.length}
              </Text>
            </View>
            {pendingTasks.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma tarefa pendente.</Text>
            ) : (
              pendingTasks.map((task) => (
                <View key={task.id} style={styles.taskRow}>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskMeta}>
                      {formatDate(task.due_date)}
                      {task.time ? ` as ${task.time}` : ""}
                      {task.category ? ` - ${task.category}` : ""}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityLabel={`Concluir ${task.title}`}
                    onPress={() => void completeTask(task.id)}
                    style={styles.completeButton}
                  >
                    <Ionicons name="checkmark" size={22} color="#FFFFFF" />
                  </Pressable>
                </View>
              ))
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Estudo por materia</Text>
            {(dashboard?.subjects.length ?? 0) === 0 ? (
              <Text style={styles.emptyText}>Registre uma sessao no cronometro.</Text>
            ) : (
              dashboard?.subjects.map((subject) => (
                <View key={subject.subject} style={styles.subjectRow}>
                  <Text style={styles.subjectName}>{subject.subject}</Text>
                  <Text style={styles.subjectTime}>
                    {formatDuration(subject.study_seconds)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}


function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <Ionicons name={icon} size={26} color="#2563EB" />
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}


function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;
}


function formatDate(value: string): string {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}


function weekday(value?: string): string {
  if (!value) {
    return "";
  }
  return new Date(`${value}T12:00:00`)
    .toLocaleDateString("pt-BR", { weekday: "short" })
    .replace(".", "");
}


const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#F8FAFC",
    flex: 1,
  },
  header: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#E2E8F0",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  title: {
    color: "#2563EB",
    fontSize: 25,
    fontWeight: "800",
  },
  email: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
  },
  logoutButton: {
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  loading: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  content: {
    gap: 14,
    padding: 16,
    paddingBottom: 30,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    padding: 16,
  },
  summaryLabel: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 12,
  },
  summaryValue: {
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "800",
  },
  badge: {
    backgroundColor: "#DBEAFE",
    borderRadius: 12,
    color: "#1D4ED8",
    fontWeight: "800",
    minWidth: 24,
    paddingHorizontal: 8,
    paddingVertical: 3,
    textAlign: "center",
  },
  chart: {
    alignItems: "flex-end",
    flexDirection: "row",
    height: 135,
    justifyContent: "space-between",
    marginTop: 16,
  },
  barColumn: {
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  bar: {
    backgroundColor: "#3B82F6",
    borderRadius: 5,
    maxWidth: 28,
    width: "55%",
  },
  barLabel: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 6,
  },
  barValue: {
    color: "#475569",
    fontSize: 9,
    marginBottom: 3,
  },
  taskRow: {
    alignItems: "center",
    borderTopColor: "#E2E8F0",
    borderTopWidth: 1,
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 12,
  },
  taskInfo: {
    flex: 1,
    paddingRight: 12,
  },
  taskTitle: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "700",
  },
  taskMeta: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 4,
  },
  completeButton: {
    alignItems: "center",
    backgroundColor: "#16A34A",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  emptyText: {
    color: "#64748B",
    marginTop: 12,
  },
  subjectRow: {
    borderTopColor: "#E2E8F0",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
  },
  subjectName: {
    color: "#334155",
    fontWeight: "700",
  },
  subjectTime: {
    color: "#2563EB",
    fontWeight: "800",
  },
});
