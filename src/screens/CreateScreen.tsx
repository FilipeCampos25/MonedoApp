import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import DropDownPicker from "react-native-dropdown-picker";

export default function CreateScreen({ navigation }: any) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // CATEGORY
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [category, setCategory] = useState(null);
  const [categoryItems, setCategoryItems] = useState([
    { label: "Matemática", value: "Matemática" },
    { label: "Português", value: "Português" },
    { label: "História", value: "História" },
    { label: "Inglês", value: "Inglês" },
  ]);

  // PRIORITY
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [priority, setPriority] = useState(null);
  const [priorityItems, setPriorityItems] = useState([
    { label: "Baixa", value: "baixa", color: "#22C55E" },
    { label: "Média", value: "media", color: "#EAB308" },
    { label: "Alta", value: "alta", color: "#F97316" },
    { label: "Urgente", value: "urgente", color: "#EF4444" },
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: "#2563EB" }}>
      <SafeAreaView style={{ backgroundColor: "#2563EB" }} edges={["top"]}>
        <StatusBar barStyle="light-content" backgroundColor="#2563EB" />

        {/* HEADER */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Adicionar Dados</Text>
        </View>
      </SafeAreaView>

      {/* CONTEÚDO */}
      <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* TÍTULO */}
          <Text style={styles.label}>Título</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Prova de Matemática"
            value={title}
            onChangeText={setTitle}
          />

          {/* DATA + HORA */}
          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Data</Text>
              <Pressable
                style={styles.inputContainer}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="dd/mm"
                  value={date}
                  onChangeText={setDate}
                />
              </Pressable>
            </View>

            <View style={styles.half}>
              <Text style={styles.label}>Hora</Text>
              <Pressable
                style={styles.inputContainer}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color="#666" />
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="--:--"
                  value={time}
                  onChangeText={setTime}
                />
              </Pressable>
            </View>
          </View>

          {/* PICKERS */}
          {showDatePicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDate(selectedDate.toLocaleDateString("pt-BR"));
                }
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              is24Hour
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) {
                  setTime(
                    selectedTime.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  );
                }
              }}
            />
          )}

          {/* CATEGORIA */}
          <Text style={styles.label}>Categoria</Text>
          <DropDownPicker
            open={categoryOpen}
            value={category}
            items={categoryItems}
            setOpen={setCategoryOpen}
            setValue={setCategory}
            setItems={setCategoryItems}
            placeholder="Selecione uma categoria"
            style={styles.dropdown}
            zIndex={3000}
            zIndexInverse={1000}
            listMode="SCROLLVIEW"
          />

          {/* PRIORIDADE */}
          <Text style={styles.label}>Prioridade</Text>
          <DropDownPicker
            open={priorityOpen}
            value={priority}
            items={priorityItems}
            setOpen={setPriorityOpen}
            setValue={setPriority}
            setItems={setPriorityItems}
            placeholder="Selecione a prioridade"
            style={styles.dropdown}
            zIndex={2000}
            zIndexInverse={2000}
            listMode="SCROLLVIEW"
            renderListItem={(props) => {
              const item = props.item;

              return (
                <Pressable
                  onPress={() => {
                    setPriority(item.value);
                    setPriorityOpen(false);
                  }}
                  style={styles.dropdownItem}
                >
                  <View
                    style={[styles.colorDot, { backgroundColor: item.color }]}
                  />
                  <Text>{item.label}</Text>
                </Pressable>
              );
            }}
          />

          {/* DESCRIÇÃO */}
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Detalhes..."
            multiline
            value={description}
            onChangeText={setDescription}
          />

          {/* SALVAR */}
          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              navigation.navigate("Estudos", {
                newItem: {
                  id: Date.now().toString(),
                  title,
                  date: date || "Hoje",
                  time: time || "--:--",
                  category,
                  priority,
                  description,
                },
              });
            }}
          >
            <Text style={styles.primaryText}>Salvar</Text>
          </Pressable>

          {/* CANCELAR */}
          <Pressable
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryText}>Cancelar</Text>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 10,
  },

  container: {
    padding: 15,
    backgroundColor: "#F9FAFB",
    flexGrow: 1,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 5,
    marginTop: 10,
  },

  input: {
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },

  inputWithIcon: {
    flex: 1,
    marginHorizontal: 10,
  },

  dropdown: {
    backgroundColor: "#E5E7EB",
    borderColor: "#ccc",
    borderRadius: 8,
    height: 48,
  },

  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },

  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  half: {
    flex: 1,
  },

  primaryButton: {
    marginTop: 20,
    backgroundColor: "#2563EB",
    height: 45,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  secondaryButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    height: 45,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  secondaryText: {
    color: "#111",
  },
});
