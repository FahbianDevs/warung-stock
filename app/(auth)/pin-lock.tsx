import { AuthCard, AuthHeader, PinInput, PrimaryButton, SecondaryButton } from "@/src/components/auth";
import { setLocalPin, verifyLocalPin } from "@/src/services/auth/authApi";
import { getSession } from "@/src/services/auth/session";
import { storage } from "@/src/services/storage";
import { COLORS } from "@/src/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StatusBar, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PinLockScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = React.useState<"create" | "confirm" | "unlock">(
    params.mode === "unlock" ? "unlock" : "create",
  );
  const [pin, setPin] = React.useState("");
  const [firstPin, setFirstPin] = React.useState("");
  const [userId, setUserId] = React.useState<number | string | null>(null);
  const [error, setError] = React.useState<string | undefined>();
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    getSession().then((session) => {
      if (session?.user?.id) setUserId(session.user.id);
    });
  }, []);

  const goDashboard = async () => {
    await storage.setItem("pinUnlockedV1", "true");
    router.replace("/(app)/dashboard");
  };

  const submit = async () => {
    if (pin.length !== 4) {
      setError("PIN harus 4 digit.");
      return;
    }
    setError(undefined);

    if (mode === "create") {
      setFirstPin(pin);
      setPin("");
      setMode("confirm");
      return;
    }

    if (mode === "confirm") {
      if (pin !== firstPin) {
        setError("Konfirmasi PIN belum sama.");
        setPin("");
        return;
      }
      setIsSaving(true);
      try {
        if (userId) await setLocalPin(userId, pin);
        await storage.setItem("pinEnabledV1", "true");
        goDashboard();
      } catch (e) {
        const message = e instanceof Error ? e.message : "Gagal menyimpan PIN.";
        setError(message);
      } finally {
        setIsSaving(false);
      }
      return;
    }

    if (userId && !(await verifyLocalPin(userId, pin))) {
      setError("PIN salah.");
      setPin("");
      return;
    }
    goDashboard();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#DCFCE7" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AuthHeader
          title={mode === "unlock" ? "Masukkan PIN" : mode === "confirm" ? "Konfirmasi PIN" : "Amankan Data Stok"}
          subtitle={mode === "unlock" ? "Masukkan PIN untuk membuka data stok warung." : "Buat PIN 4 digit agar data warungmu lebih aman."}
          compact
        />
        <AuthCard style={styles.card}>
          <Text style={styles.helper}>
            {mode === "unlock" ? "Data stok dilindungi di perangkat ini." : mode === "confirm" ? "Masukkan ulang PIN yang sama." : "PIN membantu melindungi data jika HP dipakai bersama."}
          </Text>
          <PinInput value={pin} onChangeText={(value) => { setPin(value); setError(undefined); }} error={error} />
          <PrimaryButton title={mode === "unlock" ? "Buka Aplikasi" : mode === "confirm" ? "Aktifkan PIN" : "Lanjut"} icon="shield-checkmark-outline" loading={isSaving} onPress={submit} style={styles.primary} />
          {mode === "unlock" ? null : <SecondaryButton title="Gunakan nanti" icon="time-outline" onPress={goDashboard} />}
        </AuthCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#DCFCE7" },
  content: { flexGrow: 1, padding: 20, justifyContent: "center" },
  card: { alignItems: "stretch" },
  helper: { color: COLORS.textMuted, fontSize: 14, fontWeight: "700", lineHeight: 21, textAlign: "center", marginBottom: 20 },
  primary: { marginTop: 22, marginBottom: 10 },
});
