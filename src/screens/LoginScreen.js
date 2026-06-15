import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { COLORS, SHADOW } from '../styles/theme';

export function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.loginSafeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        style={styles.loginKeyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.loginCenter}>
          <View style={styles.loginCard}>
            <Text style={styles.loginTitle}>ATLAS</Text>
            <Text style={styles.loginSubtitle}>Fa\u00e7a login para continuar</Text>

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              placeholderTextColor={COLORS.lightMuted}
              style={styles.textInput}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={[styles.inputLabel, styles.inputLabelSpacing]}>Senha</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="********"
              placeholderTextColor={COLORS.lightMuted}
              style={styles.textInput}
              secureTextEntry
            />

            <Pressable
              style={styles.primaryButton}
              onPress={() =>
                onLogin({
                  email,
                  password,
                })
              }
            >
              <Text style={styles.primaryButtonText}>Entrar</Text>
            </Pressable>

            <View style={styles.loginLinksRow}>
              <Pressable>
                <Text style={styles.linkText}>Esqueceu a senha?</Text>
              </Pressable>
              <Pressable>
                <Text style={styles.linkText}>Criar conta</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loginSafeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loginKeyboard: {
    flex: 1,
  },
  loginCenter: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  loginCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 22,
    ...SHADOW,
  },
  loginTitle: {
    textAlign: 'center',
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 6,
  },
  loginSubtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: '#3E4960',
    marginBottom: 22,
  },
  inputLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputLabelSpacing: {
    marginTop: 10,
  },
  textInput: {
    height: 40,
    borderRadius: 6,
    backgroundColor: COLORS.input,
    paddingHorizontal: 12,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.input,
  },
  primaryButton: {
    height: 38,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  loginLinksRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '500',
  },
});
