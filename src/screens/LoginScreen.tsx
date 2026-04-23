import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useState } from "react";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = () => {
    if (!email || !senha) {
      alert("Preencha todos os campos");
      return;
    }

    navigation.navigate("Home");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>ATLAS</Text>
      <Text style={styles.subtitle}>Faça login para continuar</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        placeholder="seu@email.com"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <Text style={styles.label}>Senha</Text>
      <TextInput
        placeholder="********"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <View style={styles.linksContainer}>
        <TouchableOpacity>
          <Text style={styles.link}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Create")}>
          <Text style={styles.link}>Criar conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  logo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2563eb",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    textAlign: "center",
    color: "#555",
    marginBottom: 30,
  },
  label: {
    marginBottom: 5,
    color: "#333",
  },
  input: {
    backgroundColor: "#e5e5e5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  linksContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  link: {
    color: "#2563eb",
  },
});
