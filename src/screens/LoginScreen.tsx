import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const { register, signIn } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedUsername.length < 3 || password.length < 8) {
      setError(
        mode === "login"
          ? "Informe seu usuário ou e-mail e uma senha com pelo menos 8 caracteres."
          : "Use um usuário com 3 caracteres e uma senha com pelo menos 8.",
      );
      return;
    }
    if (mode === "register" && !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError("Informe um e-mail válido.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      if (mode === "login") await signIn(normalizedUsername, password);
      else await register(normalizedUsername, normalizedEmail, password);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível concluir a autenticação.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.logo}>MONEDO</Text>
        <Text style={styles.subtitle}>
          {mode === "login" ? "Entre para continuar" : "Crie sua conta"}
        </Text>

        <Text style={styles.label}>
          {mode === "login" ? "Usuário ou e-mail" : "Usuário"}
        </Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          editable={!submitting}
          onChangeText={setUsername}
          placeholder={mode === "login" ? "usuário ou email@exemplo.com" : "seu_usuario"}
          style={styles.input}
          value={username}
        />

        {mode === "register" ? (
          <>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              editable={!submitting}
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="email@exemplo.com"
              style={styles.input}
              value={email}
            />
          </>
        ) : null}

        <Text style={styles.label}>Senha</Text>
        <TextInput
          editable={!submitting}
          onChangeText={setPassword}
          onSubmitEditing={() => void handleSubmit()}
          placeholder="Mínimo de 8 caracteres"
          secureTextEntry
          style={styles.input}
          value={password}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          disabled={submitting}
          onPress={() => void handleSubmit()}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
            submitting && styles.disabled,
          ]}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryText}>
              {mode === "login" ? "Entrar" : "Cadastrar"}
            </Text>
          )}
        </Pressable>

        <Pressable
          disabled={submitting}
          onPress={() => {
            setMode((current) => current === "login" ? "register" : "login");
            setError("");
          }}
          style={styles.switchButton}
        >
          <Text style={styles.switchText}>
            {mode === "login"
              ? "Ainda não tem conta? Cadastre-se"
              : "Já tem conta? Faça login"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 24 },
  logo: {
    color: "#2563EB",
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: { color: "#64748B", textAlign: "center", margin: 8, marginBottom: 28 },
  label: { color: "#334155", fontSize: 14, fontWeight: "700", marginBottom: 6 },
  input: {
    backgroundColor: "#F1F5F9",
    borderColor: "#E2E8F0",
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
    padding: 14,
  },
  error: { color: "#DC2626", marginBottom: 14 },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#2563EB",
    borderRadius: 10,
    minHeight: 50,
    justifyContent: "center",
  },
  primaryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  switchButton: { alignItems: "center", paddingTop: 20 },
  switchText: { color: "#2563EB", fontWeight: "600" },
  disabled: { opacity: 0.65 },
  pressed: { opacity: 0.8 },
});
