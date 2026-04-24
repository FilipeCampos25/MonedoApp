import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meus Estudos</Text>

      <View style={styles.card}>
        <Text style={styles.subtitle}>Hoje</Text>
        <Text style={styles.date}>24 de abril</Text>
      </View>

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
    </View>
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
    marginBottom: 16,
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
});
