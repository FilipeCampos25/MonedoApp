import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useState, useEffect } from "react";

export default function HomeScreen({ route }: any) {
  const [activities, setActivities] = useState([
    { title: "Prova de Matemática", date: "Amanhã", priority: "alta" },
  ]);
  useEffect(() => {
  if (route?.params?.newItem) {
    setActivities((prev) => {
      const exists = prev.find(
        (item) => item.title === route.params.newItem.title
      );

      if (exists) return prev;

      return [...prev, route.params.newItem];
    });
  }
}, [route?.params]);
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
      <View style={[styles.card, { marginTop: 10 }]}>
        <Text style={styles.sectionTitle}>Horas de Estudo - Semana</Text>

        <View style={styles.chartContainer}>
          {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(
            (day, index) => {
              const heights = [30, 50, 25, 40, 45, 60, 20];

              return (
                <View key={index} style={styles.barItem}>
                  <View style={[styles.bar, { height: heights[index] }]} />
                  <Text style={styles.barLabel}>{day}</Text>
                </View>
              );
            },
          )}
        </View>

        <Text style={styles.totalText}>Total: 24 horas esta semana</Text>
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
                style={[styles.progressBarFill, { width: `${item.progress}%` }]}
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

            <Text style={styles.priority}>{item.priority}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2563eb",
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

  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  barItem: {
    alignItems: "center",
  },

  bar: {
    width: 20,
    backgroundColor: "#2563eb",
    borderRadius: 4,
  },

  barLabel: {
    marginTop: 5,
    fontSize: 12,
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

  priority: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
});
