import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "../context/AuthContext";


export default function LoginScreen() {
  const { busy, signIn, signUp } = useAuth();
  const [registerMode, setRegisterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit() {
    if (!email.trim() || password.length < 8) {
      Alert.alert(
        "Dados invalidos",
        "Informe um email e uma senha com pelo menos 8 caracteres.",
      );
      return;
    }
    try {
      if (registerMode) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      Alert.alert(
        registerMode ? "Erro no cadastro" : "Erro no login",
        error instanceof Error ? error.message : "Tente novamente.",
      );
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <View style={styles.card}>
          <Text style={styles.logo}>Monedo</Text>
          <Text style={styles.subtitle}>
            {registerMode
              ? "Crie sua conta para organizar os estudos"
              : "Entre para continuar seus estudos"}
          </Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            editable={!busy}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="voce@example.com"
            style={styles.input}
            value={email}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            autoComplete={registerMode ? "new-password" : "current-password"}
            editable={!busy}
            onChangeText={setPassword}
            placeholder="Minimo de 8 caracteres"
            secureTextEntry
            style={styles.input}
            value={password}
          />

          <Pressable
            disabled={busy}
            onPress={submit}
            style={[styles.primaryButton, busy && styles.disabled]}
          >
            {busy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryText}>
                {registerMode ? "Criar conta" : "Entrar"}
              </Text>
            )}
          </Pressable>

          <Pressable
            disabled={busy}
            onPress={() => setRegisterMode((current) => !current)}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>
              {registerMode
                ? "Ja possui conta? Entrar"
                : "Ainda nao possui conta? Cadastre-se"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#EFF6FF",
    flex: 1,
  },
  keyboard: {
    flex: 1,
    justifyContent: "center",
    padding: 22,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    elevation: 3,
    padding: 24,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  logo: {
    color: "#2563EB",
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: "#64748B",
    fontSize: 15,
    marginBottom: 26,
    marginTop: 8,
    textAlign: "center",
  },
  label: {
    color: "#1E293B",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#F1F5F9",
    borderColor: "#CBD5E1",
    borderRadius: 10,
    borderWidth: 1,
    color: "#0F172A",
    fontSize: 16,
    height: 48,
    paddingHorizontal: 14,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#2563EB",
    borderRadius: 10,
    height: 48,
    justifyContent: "center",
    marginTop: 24,
  },
  disabled: {
    opacity: 0.65,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  linkButton: {
    alignItems: "center",
    marginTop: 18,
  },
  linkText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },
});
