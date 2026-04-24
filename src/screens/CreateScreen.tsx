import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function CreateScreen({ navigation }: any) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [priority, setPriority] = useState("");

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Adicionar Dados</Text>
      </View>

      <ScrollView style={styles.form}>
        {/* TÍTULO */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <MaterialCommunityIcons name="file-document-outline" size={18} />
            <Text style={styles.label}>Título</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Ex: Reunião importante"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* DATA */}
        <View style={styles.inputGroup}>
          <Text style={styles.labelBold}>Data</Text>

          <TextInput
            style={styles.input}
            placeholder="Ex: 24/04/2026"
            value={date}
            onChangeText={setDate}
          />
        </View>

        {/* PRIORIDADE */}
        <View style={styles.inputGroup}>
          <Text style={styles.labelBold}>Prioridade</Text>

          <TextInput
            style={styles.input}
            placeholder="baixa | media | alta"
            value={priority}
            onChangeText={setPriority}
          />
        </View>

        {/* BOTÃO SALVAR */}
        <TouchableOpacity
          style={styles.btnSave}
          onPress={() => {
            if (!title) {
              Alert.alert("Erro", "Preencha o título");
              return;
            }

            navigation.navigate("Estudos", {
              newItem: {
                title: title,
                date: date || "Hoje",
                priority: priority || "media",
              },
            });
          }}
        >
          <Text style={styles.btnSaveText}>Salvar</Text>
        </TouchableOpacity>

        {/* CANCELAR */}
        <TouchableOpacity
          style={styles.btnCancel}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.btnCancelText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },

  header: {
    backgroundColor: "#1A73E8",
    padding: 20,
    paddingTop: 50,
    flexDirection: "row",
    alignItems: "center",
  },

  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 15,
  },

  form: {
    padding: 20,
  },

  inputGroup: {
    marginBottom: 20,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  label: {
    marginLeft: 8,
    fontWeight: "600",
  },

  labelBold: {
    fontWeight: "bold",
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#F1F3F4",
    borderRadius: 8,
    padding: 12,
  },

  btnSave: {
    backgroundColor: "#1A73E8",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  btnSaveText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  btnCancel: {
    padding: 15,
    alignItems: "center",
  },

  btnCancelText: {
    color: "#202124",
  },
});
