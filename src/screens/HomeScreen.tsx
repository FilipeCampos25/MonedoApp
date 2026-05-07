import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarChart } from "react-native-chart-kit";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import React from "react";

const screenWidth = Dimensions.get("window").width;

export default function HomeScreen({ route }: any) {
  const [activities, setActivities] = useState([
    { title: "Prova de Matemática", date: "Amanhã", priority: "alta" },
  ]);

  useEffect(() => {
    if (route?.params?.newItem) {
      setActivities((prev) => {
        const exists = prev.find(
          (item) => item.title === route.params.newItem.title,
        );
        if (exists) return prev;
        return [...prev, route.params.newItem];
      });
    }
  }, [route?.params]);

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "baixa":
        return { color: "#22C55E" };
      case "media":
        return { color: "#EAB308" };
      case "alta":
        return { color: "#F97316" };
      case "urgente":
        return { color: "#EF4444" };
      default:
        return { color: "#6B7280" };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* TÍTULO */}
        <Text style={styles.title}>Meus Estudos</Text>

        {/* DATA */}
        <View style={styles.card}>
          <Text style={styles.subtitle}>Hoje</Text>
          <Text style={styles.date}>24 de abril</Text>
        </View>

        {/* CARDS DE RESUMO */}
        <View style={styles.row}>
          <View style={styles.smallCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.bodyText}>Horas Hoje</Text>
              <MaterialIcons name="access-time" size={26} color="#3b82f6" />
            </View>
            <Text style={styles.bigNumber}>3.5h</Text>
            <Text style={[styles.meta, styles.bodyText]}>Meta: 4h por dia</Text>
          </View>

          <View style={styles.smallCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.bodyText}>Sessões</Text>
              <Ionicons name="book-outline" size={26} color="#10b981" />
            </View>
            <Text style={styles.bigNumber}>7</Text>
            <Text style={styles.bodyText}>Sessions completas</Text>
          </View>
        </View>

        {/* GRÁFICO */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Horas de Estudo - Semana</Text>

          <View style={styles.chartWrapper}>
            <BarChart
              data={{
                labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"],
                datasets: [{ data: [2.5, 3.8, 3.2, 4.5, 3.9, 2.0, 5.0] }],
              }}
              width={screenWidth - 80}
              height={220}
              yAxisLabel=""
              yAxisSuffix="h"
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                labelColor: () => "#6B7280",
                fillShadowGradient: "#3B82F6",
                fillShadowGradientOpacity: 1,
              }}
              style={{
                borderRadius: 12,
              }}
            />
          </View>

          <Text style={styles.totalText}>Total: 24h nesta semana</Text>
        </View>

        {/* PROGRESSO */}
        <View style={styles.card}>
          <View style={styles.progressHeader}>
            <MaterialIcons name="track-changes" size={22} color="#2563eb" />
            <Text
              style={[styles.sectionTitle, { marginLeft: 8, marginBottom: 0 }]}
            >
              Progresso das Matérias
            </Text>
          </View>

          {[
            { name: "Matemática", progress: 75 },
            { name: "Português", progress: 60 },
            { name: "História", progress: 85 },
            { name: "Inglês", progress: 45 },
          ].map((item, index) => (
            <View key={index} style={styles.progressItem}>
              <View style={styles.progressInfoRow}>
                <Text style={styles.subjectName}>{item.name}</Text>
                <Text style={styles.progressText}>{item.progress}%</Text>
              </View>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${item.progress}%` },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* ATIVIDADES */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Próximas Atividades</Text>

          {activities.map((item, index) => {
            const style = getPriorityStyle(item.priority);

            return (
              <View key={index} style={styles.activityItem}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {/* BOLINHA */}
                  <View
                    style={[styles.dot, { backgroundColor: style.color }]}
                  />

                  <View>
                    <Text style={[styles.bodyText, { fontWeight: "bold" }]}>
                      {item.title}
                    </Text>
                    <Text style={styles.bodyText}>{item.date}</Text>
                  </View>
                </View>

                {/* PRIORIDADE */}
                <View
                  style={[styles.priority, { backgroundColor: style.color }]}
                >
                  <Text
                    style={[
                      styles.bodyText,
                      { color: "#FFFFFF", fontWeight: "600" },
                    ]}
                  >
                    {item.priority}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "System",
    color: "#2563eb",
    marginTop: 10,
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  subtitle: {
    color: "#6b7280",
    fontFamily: "System",
  },
  date: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "System",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  smallCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    width: "48%",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bigNumber: {
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "System",
    marginVertical: 8,
  },
  meta: {
    color: "#6b7280",
    fontFamily: "System",
    fontSize: 14,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontFamily: "System",
    marginBottom: 16,
  },
  chartWrapper: {
    marginTop: 10,
    alignItems: "center",
  },
  totalText: {
    marginTop: 10,
    textAlign: "center",
    color: "#6b7280",
    fontFamily: "System",
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressItem: {
    marginBottom: 28,
    paddingVertical: 6,
  },
  progressInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: "#2563eb",
    borderRadius: 4,
  },
  bodyText: {
    fontFamily: "System",
    color: "#111827",
  },
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  priority: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
});
