import {
  AuthCard,
  AuthHeader,
  AuthTextInput,
  PasswordInput,
  PrimaryButton,
  SocialDemoButton,
} from "@/src/components/auth";
import { login, loginDemo } from "@/src/services/auth/authApi";
import { storage } from "@/src/services/storage";
import { COLORS } from "@/src/theme";
import { useRouter } from "expo-router";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";

const REMEMBER_KEY = "auth.remember_identifier_v1";

export default function LoginScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<{ identifier?: string; password?: string }>({});

  React.useEffect(() => {
    storage.getItem(REMEMBER_KEY).then((saved) => {
      if (saved) setIdentifier(saved);
    });
  }, []);

  const validate = () => {
    const nextErrors: typeof fieldErrors = {};
    const trimmed = identifier.trim();
    if (!trimmed) nextErrors.identifier = "Email atau username belum diisi.";
    if (trimmed.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      nextErrors.identifier = "Format email belum benar.";
    }
    if (!password) nextErrors.password = "Password belum diisi.";
    if (password && password.length < 6) nextErrors.password = "Password minimal 6 karakter.";
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async () => {
    setErrorMessage(null);
    if (!validate()) return;
    setIsLoading(true);
    try {
      await login({ identifier: identifier.trim(), password });
      if (remember) {
        await storage.setItem(REMEMBER_KEY, identifier.trim());
      } else {
        await storage.removeItem(REMEMBER_KEY);
      }
      router.replace("/(app)/dashboard");
    } catch (e) {
      console.error("Login error:", e);
      const message = e instanceof Error ? e.message : "Login gagal. Silakan coba lagi.";
      setErrorMessage(message || "Akun tidak ditemukan atau password salah.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await loginDemo();
      router.replace("/(app)/dashboard");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Mode demo gagal dibuka.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#DCFCE7" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <AuthHeader
              title="Selamat datang kembali"
              subtitle="Masuk untuk melanjutkan pengelolaan stok warungmu."
            />
            <View style={styles.illustration}>
              <Icon name="storefront-outline" size={34} color={COLORS.primary} />
              <Icon name="basket-outline" size={26} color={COLORS.secondary} />
              <Icon name="receipt-outline" size={24} color={COLORS.warning} />
            </View>
          </View>

          <AuthCard>
            <AuthTextInput
              label="Email atau username"
              icon="person-outline"
              placeholder="contoh: warungbudi@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={identifier}
              error={fieldErrors.identifier}
              onChangeText={(value) => {
                setIdentifier(value);
                setFieldErrors((current) => ({ ...current, identifier: undefined }));
              }}
            />
            <PasswordInput
              label="Password"
              placeholder="Masukkan password"
              value={password}
              error={fieldErrors.password}
              onChangeText={(value) => {
                setPassword(value);
                setFieldErrors((current) => ({ ...current, password: undefined }));
              }}
            />

            <View style={styles.optionRow}>
              <TouchableOpacity style={styles.rememberRow} onPress={() => setRemember((current) => !current)} activeOpacity={0.85}>
                <View style={[styles.checkbox, remember && styles.checkboxActive]}>
                  {remember ? <Icon name="checkmark" size={15} color="#fff" /> : null}
                </View>
                <Text style={styles.optionText}>Ingat saya</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password" as any)}>
                <Text style={styles.linkText}>Lupa password?</Text>
              </TouchableOpacity>
            </View>

            {!!errorMessage && <Text style={styles.formError}>{errorMessage}</Text>}

            <PrimaryButton title="Masuk" icon="log-in-outline" loading={isLoading} onPress={handleLogin} />
            <View style={{ height: 10 }} />
            <SocialDemoButton title="Coba Mode Demo" onPress={handleDemo} disabled={isLoading} />

            <View style={styles.bottomRow}>
              <Text style={styles.mutedText}>Belum punya akun? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text style={styles.linkText}>Daftar sekarang</Text>
              </TouchableOpacity>
            </View>
          </AuthCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#DCFCE7" },
  content: { flexGrow: 1, padding: 20, paddingBottom: 28, justifyContent: "center" },
  hero: { marginBottom: 8 },
  illustration: {
    alignSelf: "center",
    marginTop: -4,
    marginBottom: 12,
    width: 128,
    height: 46,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.72)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  optionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  rememberRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.cardBg,
  },
  checkboxActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionText: { color: COLORS.textMuted, fontSize: 13, fontWeight: "700" },
  linkText: { color: COLORS.primary, fontSize: 13, fontWeight: "900" },
  formError: { color: COLORS.danger, fontSize: 13, fontWeight: "700", textAlign: "center", marginBottom: 12 },
  bottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 18 },
  mutedText: { color: COLORS.textMuted, fontSize: 13, fontWeight: "700" },
});
