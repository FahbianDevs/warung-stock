import { AuthCard, AuthHeader, AuthTextInput, PrimaryButton, SecondaryButton } from "@/src/components/auth";
import { COLORS } from "@/src/theme";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StatusBar, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = React.useState("");
  const [error, setError] = React.useState<string | undefined>();
  const [success, setSuccess] = React.useState<string | undefined>();

  const submit = () => {
    setSuccess(undefined);
    const trimmed = identifier.trim();
    if (!trimmed) {
      setError("Email atau nomor HP belum diisi.");
      return;
    }
    if (trimmed.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Format email belum benar.");
      return;
    }
    setError(undefined);
    setSuccess("Instruksi pemulihan akun telah dikirim. Untuk versi offline, ini masih simulasi UI dan membutuhkan backend/API agar benar-benar mengirim reset password.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AuthHeader
          title="Lupa Password?"
          subtitle="Masukkan email atau nomor HP untuk pemulihan akun."
          compact
        />
        <AuthCard>
          <AuthTextInput
            label="Email atau nomor HP"
            icon="mail-outline"
            placeholder="warung@email.com / 081234567890"
            value={identifier}
            error={error}
            onChangeText={(value) => {
              setIdentifier(value);
              setError(undefined);
              setSuccess(undefined);
            }}
            autoCapitalize="none"
          />
          {!!success && <Text style={styles.success}>{success}</Text>}
          <PrimaryButton title="Kirim Instruksi" icon="send-outline" onPress={submit} />
          <SecondaryButton title="Kembali ke Login" icon="arrow-back-outline" style={styles.backBtn} onPress={() => router.replace("/(auth)/login")} />
        </AuthCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flexGrow: 1, padding: 20, justifyContent: "center" },
  success: { color: COLORS.success, fontSize: 13, fontWeight: "800", lineHeight: 20, marginBottom: 14 },
  backBtn: { marginTop: 10 },
});
