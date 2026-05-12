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

  const selectedDate = date
    ? new Date(date.split("/").reverse().join("-"))
    : new Date();

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
  const [priority, setPriority] = useState<string | null>(null);
  const [priorityItems, setPriorityItems] = useState<Array<{
    label: string;
    value: string;
    color: string;
  }>>([
    { label: "Baixa", value: "baixa", color: "#22C55E" },
    { label: "Média", value: "media", color: "#EAB308" },
    { label: "Alta", value: "alta", color: "#F97316" },
    { label: "Urgente", value: "urgente", color: "#EF4444" },
  ]);

  function handleTimeChange(value: string) {
    const digits = value.replace(/[^0-9]/g, "").slice(0, 4);
    if (digits.length <= 2) {
      setTime(digits);
      return;
    }

    setTime(`${digits.slice(0, 2)}:${digits.slice(2)}`);
  }

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
                <Text
                  style={
                    date
                      ? [styles.inputWithIcon, styles.inputText]
                      : [styles.inputWithIcon, styles.placeholderText]
                  }
                >
                  {date || "dd/mm/aaaa"}
                </Text>
              </Pressable>
            </View>

            <View style={styles.half}>
              <Text style={styles.label}>Hora</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                value={time}
                onChangeText={handleTimeChange}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
          </View>

          {/* PICKERS */}
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "calendar"}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (event.type === "dismissed") return;
                if (selectedDate) {
                  setDate(selectedDate.toLocaleDateString("pt-BR"));
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
              const item = props.item as {
                label: string;
                value: string;
                color: string;
              };

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
    fontFamily: "System",
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
    fontFamily: "System",
    marginBottom: 5,
    marginTop: 10,
  },

  input: {
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    fontFamily: "System",
    color: "#111827",
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
    fontFamily: "System",
    color: "#111827",
  },

  inputText: {
    fontFamily: "System",
    color: "#111827",
  },

  placeholderText: {
    fontFamily: "System",
    color: "#9CA3AF",
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
    fontFamily: "System",
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
    fontFamily: "System",
  },
});
