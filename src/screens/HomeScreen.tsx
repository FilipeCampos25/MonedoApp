import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "baixa":
      return "#22C55E";
    case "media":
      return "#EAB308";
    case "alta":
      return "#F97316";
    case "urgente":
      return "#EF4444";
    default:
      return "#ccc";
  }
};

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

        {/* CARDS */}
        <View style={styles.row}>
          <View style={styles.smallCard}>
            <Text>Horas Hoje</Text>
            <Text style={styles.bigNumber}>3.5h</Text>
            <Text style={styles.meta}>Meta: 4h por dia</Text>
          </View>

          <View style={styles.smallCard}>
            <Text>Sessões</Text>
            <Text style={styles.bigNumber}>7</Text>
            <Text>Sessions completas</Text>
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
          <Text style={styles.sectionTitle}>Progresso das Matérias</Text>

          {[
            { name: "Matemática", progress: 75 },
            { name: "Português", progress: 60 },
            { name: "História", progress: 85 },
            { name: "Inglês", progress: 45 },
          ].map((item, index) => (
            <View key={index} style={{ marginBottom: 10 }}>
              <Text>{item.name}</Text>

              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${item.progress}%` },
                  ]}
                />
              </View>

              <Text>{item.progress}%</Text>
            </View>
          ))}
        </View>

        {/* ATIVIDADES */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Próximas Atividades</Text>

          {activities.map((item, index) => (
            <View key={index} style={styles.activityItem}>
              <View>
                <Text style={{ fontWeight: "bold" }}>{item.title}</Text>
                <Text>{item.date}</Text>
              </View>

              {/* 🔥 BADGE COLORIDA */}
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor(item.priority) },
                ]}
              >
                <Text style={styles.priorityText}>{item.priority}</Text>
              </View>
            </View>
          ))}
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
  },

  date: {
    fontSize: 18,
    fontWeight: "bold",
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

  bigNumber: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 8,
  },

  meta: {
    color: "#6b7280",
  },

  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 10,
  },

  totalText: {
    marginTop: 10,
    textAlign: "center",
    color: "#6b7280",
  },

  progressBarBackground: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    marginVertical: 5,
  },

  progressBarFill: {
    height: 8,
    backgroundColor: "#111827",
    borderRadius: 4,
  },

  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },

  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  priorityText: {
    color: "#fff",
    fontWeight: "600",
    textTransform: "capitalize",
  },

  chartWrapper: {
    marginTop: 10,
    alignItems: "center",
  },
});
