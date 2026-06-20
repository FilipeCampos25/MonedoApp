import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";
import {
  createAccountOption,
  deleteAccount,
  deleteAccountOption,
  getAccount,
  updateAccountOption,
  updatePreferences,
  updateProfile,
} from "../services/api";
import type { Account, AccountOption } from "../types/api";

type OptionKind = "categories" | "subjects";

export default function AccountScreen({ navigation }: { navigation: any }) {
  const { clearSession, token, updateUser } = useAuth();
  const [account, setAccount] = useState<Account | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [goal, setGoal] = useState(4 * 3600);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  const loadAccount = useCallback(async () => {
    if (!token) return;
    setError("");
    try {
      const data = await getAccount(token);
      setAccount(data);
      setUsername(data.username);
      setEmail(data.email || "");
      setGoal(data.daily_goal_seconds);
    } catch (requestError) {
      setError(messageFrom(requestError, "Não foi possível carregar sua conta."));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  async function saveProfile() {
    if (!token) return;
    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedUsername.length < 3) {
      setError("O nome de usuário precisa ter pelo menos 3 caracteres.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError("Informe um e-mail válido.");
      return;
    }
    setSavingProfile(true);
    setError("");
    try {
      const profile = await updateProfile(
        token,
        normalizedUsername,
        normalizedEmail,
      );
      updateUser(profile);
      setAccount((current) => current ? { ...current, ...profile } : current);
      setUsername(profile.username);
      setEmail(profile.email || "");
      Alert.alert("Perfil atualizado", "Seus dados foram salvos.");
    } catch (requestError) {
      setError(messageFrom(requestError, "Não foi possível salvar o perfil."));
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveGoal() {
    if (!token) return;
    setSavingGoal(true);
    setError("");
    try {
      await updatePreferences(token, goal);
      setAccount((current) => current
        ? { ...current, daily_goal_seconds: goal }
        : current);
      Alert.alert("Meta atualizada", "Sua meta diária foi salva.");
    } catch (requestError) {
      setError(messageFrom(requestError, "Não foi possível salvar a meta."));
    } finally {
      setSavingGoal(false);
    }
  }

  async function addOption(kind: OptionKind, name: string) {
    if (!token) return;
    const created = await createAccountOption(token, kind, name);
    setAccount((current) => current
      ? { ...current, [kind]: [...current[kind], created] }
      : current);
  }

  async function renameOption(
    kind: OptionKind,
    optionId: number,
    name: string,
  ) {
    if (!token) return;
    const updated = await updateAccountOption(token, kind, optionId, name);
    setAccount((current) => current
      ? {
          ...current,
          [kind]: current[kind].map((item) =>
            item.id === optionId ? updated : item),
        }
      : current);
  }

  async function removeOption(kind: OptionKind, optionId: number) {
    if (!token) return;
    await deleteAccountOption(token, kind, optionId);
    setAccount((current) => current
      ? {
          ...current,
          [kind]: current[kind].filter((item) => item.id !== optionId),
        }
      : current);
  }

  async function confirmDeleteAccount() {
    if (!token || password.length < 8) {
      setError("Informe sua senha atual para excluir a conta.");
      return;
    }
    setDeleting(true);
    setError("");
    try {
      await deleteAccount(token, password);
      setDeleteModal(false);
      await clearSession();
    } catch (requestError) {
      setError(messageFrom(requestError, "Não foi possível excluir a conta."));
      setDeleteModal(false);
    } finally {
      setDeleting(false);
      setPassword("");
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Voltar" onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={27} color="#2563EB" />
        </Pressable>
        <Text style={styles.headerTitle}>Minha conta</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!account?.email ? (
          <View style={styles.warning}>
            <Ionicons name="alert-circle-outline" size={22} color="#B45309" />
            <Text style={styles.warningText}>
              Complete seu e-mail para manter os dados da conta atualizados.
            </Text>
          </View>
        ) : null}

        <Section title="Perfil">
          <Field label="Nome de usuário">
            <TextInput
              autoCapitalize="none"
              onChangeText={setUsername}
              style={styles.input}
              value={username}
            />
          </Field>
          <Field label="E-mail">
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="email@exemplo.com"
              style={styles.input}
              value={email}
            />
          </Field>
          <PrimaryButton
            label="Salvar perfil"
            loading={savingProfile}
            onPress={() => void saveProfile()}
          />
        </Section>

        <Section title="Meta diária">
          <Text style={styles.goalValue}>{formatDuration(goal)}</Text>
          <View style={styles.goalControls}>
            <SmallButton
              label="− 30 min"
              onPress={() => setGoal((value) => Math.max(1800, value - 1800))}
            />
            <SmallButton
              label="+ 30 min"
              onPress={() => setGoal((value) => Math.min(43200, value + 1800))}
            />
          </View>
          <PrimaryButton
            label="Salvar meta"
            loading={savingGoal}
            onPress={() => void saveGoal()}
          />
        </Section>

        <OptionSection
          kind="categories"
          options={account?.categories || []}
          title="Categorias"
          onAdd={addOption}
          onDelete={removeOption}
          onRename={renameOption}
          onError={setError}
        />
        <OptionSection
          kind="subjects"
          options={account?.subjects || []}
          title="Matérias"
          onAdd={addOption}
          onDelete={removeOption}
          onRename={renameOption}
          onError={setError}
        />

        <View style={[styles.section, styles.dangerSection]}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>Zona de perigo</Text>
          <Text style={styles.helpText}>
            A exclusão remove permanentemente suas tarefas, sessões e preferências.
          </Text>
          <Pressable onPress={() => setDeleteModal(true)} style={styles.deleteButton}>
            <Text style={styles.deleteText}>Excluir minha conta</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={() => setDeleteModal(false)}
        transparent
        visible={deleteModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.sectionTitle}>Excluir conta?</Text>
            <Text style={styles.helpText}>
              Esta ação é definitiva. Informe sua senha atual para confirmar.
            </Text>
            <TextInput
              autoFocus
              onChangeText={setPassword}
              placeholder="Senha atual"
              secureTextEntry
              style={styles.input}
              value={password}
            />
            <Pressable
              disabled={deleting}
              onPress={() => void confirmDeleteAccount()}
              style={styles.deleteButton}
            >
              {deleting
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={styles.deleteText}>Excluir definitivamente</Text>}
            </Pressable>
            <Pressable
              disabled={deleting}
              onPress={() => {
                setDeleteModal(false);
                setPassword("");
              }}
              style={styles.cancelButton}
            >
              <Text style={styles.link}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function OptionSection({
  kind,
  options,
  title,
  onAdd,
  onDelete,
  onRename,
  onError,
}: {
  kind: OptionKind;
  options: AccountOption[];
  title: string;
  onAdd: (kind: OptionKind, name: string) => Promise<void>;
  onDelete: (kind: OptionKind, optionId: number) => Promise<void>;
  onRename: (kind: OptionKind, optionId: number, name: string) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [saving, setSaving] = useState(false);

  async function run(action: () => Promise<void>, fallback: string) {
    setSaving(true);
    onError("");
    try {
      await action();
    } catch (requestError) {
      onError(messageFrom(requestError, fallback));
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(option: AccountOption) {
    Alert.alert(
      `Excluir ${option.name}?`,
      "Registros históricos manterão este nome.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => void run(
            () => onDelete(kind, option.id),
            "Não foi possível excluir a opção.",
          ),
        },
      ],
    );
  }

  return (
    <Section title={title}>
      <View style={styles.addRow}>
        <TextInput
          editable={!saving}
          onChangeText={setNewName}
          onSubmitEditing={() => {
            if (!newName.trim()) return;
            void run(async () => {
              await onAdd(kind, newName);
              setNewName("");
            }, "Não foi possível adicionar a opção.");
          }}
          placeholder={`Nova ${kind === "categories" ? "categoria" : "matéria"}`}
          style={[styles.input, styles.addInput]}
          value={newName}
        />
        <Pressable
          accessibilityLabel={`Adicionar ${title}`}
          disabled={saving || !newName.trim()}
          onPress={() => void run(async () => {
            await onAdd(kind, newName);
            setNewName("");
          }, "Não foi possível adicionar a opção.")}
          style={[styles.iconButton, (!newName.trim() || saving) && styles.disabled]}
        >
          <Ionicons name="add" size={25} color="#FFFFFF" />
        </Pressable>
      </View>

      {options.length ? options.map((option) => (
        <View key={option.id} style={styles.optionRow}>
          {editingId === option.id ? (
            <TextInput
              autoFocus
              editable={!saving}
              onChangeText={setEditingName}
              style={[styles.input, styles.optionInput]}
              value={editingName}
            />
          ) : <Text style={styles.optionName}>{option.name}</Text>}
          {editingId === option.id ? (
            <>
              <Pressable
                accessibilityLabel={`Salvar ${option.name}`}
                disabled={saving || !editingName.trim()}
                onPress={() => void run(async () => {
                  await onRename(kind, option.id, editingName);
                  setEditingId(null);
                }, "Não foi possível renomear a opção.")}
                style={styles.rowAction}
              >
                <Ionicons name="checkmark" size={23} color="#16A34A" />
              </Pressable>
              <Pressable onPress={() => setEditingId(null)} style={styles.rowAction}>
                <Ionicons name="close" size={23} color="#64748B" />
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                accessibilityLabel={`Editar ${option.name}`}
                onPress={() => {
                  setEditingId(option.id);
                  setEditingName(option.name);
                }}
                style={styles.rowAction}
              >
                <Ionicons name="pencil-outline" size={20} color="#2563EB" />
              </Pressable>
              <Pressable
                accessibilityLabel={`Excluir ${option.name}`}
                onPress={() => confirmDelete(option)}
                style={styles.rowAction}
              >
                <Ionicons name="trash-outline" size={20} color="#DC2626" />
              </Pressable>
            </>
          )}
        </View>
      )) : (
        <Text style={styles.empty}>Nenhuma opção cadastrada.</Text>
      )}
    </Section>
  );
}

function Section({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Field({ label, children }: React.PropsWithChildren<{ label: string }>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function PrimaryButton({
  label,
  loading,
  onPress,
}: {
  label: string;
  loading: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable disabled={loading} onPress={onPress} style={styles.primaryButton}>
      {loading
        ? <ActivityIndicator color="#FFFFFF" />
        : <Text style={styles.primaryText}>{label}</Text>}
    </Pressable>
  );
}

function SmallButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.smallButton}>
      <Text style={styles.link}>{label}</Text>
    </Pressable>
  );
}

function messageFrom(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h${minutes ? ` ${minutes}min` : ""}`;
}

const styles = StyleSheet.create({
  root: { backgroundColor: "#F5F7FB", flex: 1 },
  centered: { alignItems: "center", backgroundColor: "#F5F7FB", flex: 1, justifyContent: "center" },
  header: { alignItems: "center", backgroundColor: "#FFFFFF", borderBottomColor: "#E2E8F0", borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", padding: 16 },
  headerTitle: { color: "#0F172A", fontSize: 20, fontWeight: "800" },
  headerSpacer: { width: 27 },
  content: { padding: 16, paddingBottom: 40 },
  section: { backgroundColor: "#FFFFFF", borderRadius: 16, marginBottom: 16, padding: 16 },
  sectionTitle: { color: "#0F172A", fontSize: 18, fontWeight: "800", marginBottom: 14 },
  field: { marginBottom: 13 },
  label: { color: "#334155", fontSize: 13, fontWeight: "700", marginBottom: 6 },
  input: { backgroundColor: "#F8FAFC", borderColor: "#CBD5E1", borderRadius: 10, borderWidth: 1, minHeight: 48, paddingHorizontal: 12 },
  primaryButton: { alignItems: "center", backgroundColor: "#2563EB", borderRadius: 10, justifyContent: "center", minHeight: 48 },
  primaryText: { color: "#FFFFFF", fontWeight: "800" },
  goalValue: { color: "#0F172A", fontSize: 30, fontWeight: "900", textAlign: "center" },
  goalControls: { flexDirection: "row", gap: 12, marginVertical: 18 },
  smallButton: { alignItems: "center", backgroundColor: "#EFF6FF", borderRadius: 10, flex: 1, padding: 12 },
  link: { color: "#2563EB", fontWeight: "700" },
  addRow: { alignItems: "center", flexDirection: "row", gap: 8, marginBottom: 10 },
  addInput: { flex: 1 },
  iconButton: { alignItems: "center", backgroundColor: "#2563EB", borderRadius: 10, height: 48, justifyContent: "center", width: 48 },
  optionRow: { alignItems: "center", borderTopColor: "#E2E8F0", borderTopWidth: 1, flexDirection: "row", minHeight: 50 },
  optionName: { color: "#0F172A", flex: 1, fontWeight: "600" },
  optionInput: { flex: 1, marginVertical: 6, minHeight: 40 },
  rowAction: { padding: 9 },
  warning: { alignItems: "center", backgroundColor: "#FEF3C7", borderRadius: 12, flexDirection: "row", marginBottom: 16, padding: 12 },
  warningText: { color: "#92400E", flex: 1, marginLeft: 9 },
  error: { backgroundColor: "#FEE2E2", borderRadius: 10, color: "#B91C1C", marginBottom: 14, padding: 11 },
  helpText: { color: "#64748B", lineHeight: 20, marginBottom: 14 },
  dangerSection: { borderColor: "#FECACA", borderWidth: 1 },
  dangerTitle: { color: "#B91C1C" },
  deleteButton: { alignItems: "center", backgroundColor: "#DC2626", borderRadius: 10, justifyContent: "center", minHeight: 48, paddingHorizontal: 12 },
  deleteText: { color: "#FFFFFF", fontWeight: "800" },
  modalBackdrop: { alignItems: "center", backgroundColor: "rgba(15,23,42,0.6)", flex: 1, justifyContent: "center", padding: 24 },
  modalCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 20, width: "100%" },
  cancelButton: { alignItems: "center", padding: 14 },
  empty: { color: "#64748B", paddingVertical: 12, textAlign: "center" },
  disabled: { opacity: 0.45 },
});
