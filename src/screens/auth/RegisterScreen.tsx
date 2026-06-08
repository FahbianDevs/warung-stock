import {
  AuthCard,
  AuthHeader,
  AuthTextInput,
  PasswordInput,
  PrimaryButton,
} from "@/src/components/auth";
import { login, register } from "@/src/services/auth/authApi";
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

type FieldErrors = {
  name?: string;
  businessName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  agreed?: string;
};

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [businessName, setBusinessName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [agreed, setAgreed] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});

  const validate = () => {
    const nextErrors: FieldErrors = {};
    if (!name.trim()) nextErrors.name = "Nama pengguna belum diisi.";
    if (!businessName.trim()) nextErrors.businessName = "Nama warung belum diisi.";
    if (!email.trim()) nextErrors.email = "Email belum diisi.";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Format email belum benar.";
    }
    if (phone.trim() && !/^[0-9+\-\s]{8,}$/.test(phone.trim())) {
      nextErrors.phone = "Nomor HP belum valid.";
    }
    if (!password) nextErrors.password = "Password belum diisi.";
    if (password && password.length < 6) nextErrors.password = "Password minimal 6 karakter.";
    if (!confirmPassword) nextErrors.confirmPassword = "Konfirmasi password belum diisi.";
    if (password && confirmPassword && password !== confirmPassword) {
      nextErrors.confirmPassword = "Konfirmasi password harus sama.";
    }
    if (!agreed) nextErrors.agreed = "Centang persetujuan untuk melanjutkan.";
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = async () => {
    setErrorMessage(null);
    if (!validate()) return;
    setIsLoading(true);
    try {
      const user = await register({
        identifier: email.trim(),
        password,
        name: name.trim(),
        businessName: businessName.trim(),
        phone: phone.trim(),
        role: "owner",
      });
      await login({ identifier: email.trim(), password });
      await storage.setItem("pendingBusinessSetupV1", JSON.stringify({ user, businessName: businessName.trim() }));
      alert("Akun berhasil dibuat.");
      router.replace("/(auth)/setup-business" as any);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Registrasi gagal. Silakan coba lagi.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (key: keyof FieldErrors) => {
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AuthHeader title="Buat Akun Warungmu" subtitle="Kelola stok lebih rapi mulai hari ini." compact />

          <AuthCard>
            <AuthTextInput label="Nama pengguna" icon="person-outline" placeholder="Contoh: Budi" value={name} error={fieldErrors.name} onChangeText={(value) => { setName(value); clearError("name"); }} />
            <AuthTextInput label="Nama warung/toko" icon="storefront-outline" placeholder="Contoh: Warung Bu Sari" value={businessName} error={fieldErrors.businessName} onChangeText={(value) => { setBusinessName(value); clearError("businessName"); }} />
            <AuthTextInput label="Email" icon="mail-outline" placeholder="warung@email.com" keyboardType="email-address" autoCapitalize="none" value={email} error={fieldErrors.email} onChangeText={(value) => { setEmail(value); clearError("email"); }} />
            <AuthTextInput label="Nomor HP opsional" icon="call-outline" placeholder="081234567890" keyboardType="phone-pad" value={phone} error={fieldErrors.phone} onChangeText={(value) => { setPhone(value); clearError("phone"); }} />
            <PasswordInput label="Password" placeholder="Minimal 6 karakter" value={password} error={fieldErrors.password} onChangeText={(value) => { setPassword(value); clearError("password"); }} />
            <PasswordInput label="Konfirmasi password" placeholder="Ulangi password" value={confirmPassword} error={fieldErrors.confirmPassword} onChangeText={(value) => { setConfirmPassword(value); clearError("confirmPassword"); }} />

            <TouchableOpacity style={styles.agreeRow} onPress={() => { setAgreed((current) => !current); clearError("agreed"); }} activeOpacity={0.85}>
              <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
                {agreed ? <Icon name="checkmark" size={15} color="#fff" /> : null}
              </View>
              <Text style={styles.agreeText}>Saya setuju dengan syarat penggunaan sederhana WARUNG-STOCK.</Text>
            </TouchableOpacity>
            {!!fieldErrors.agreed && <Text style={styles.fieldError}>{fieldErrors.agreed}</Text>}
            {!!errorMessage && <Text style={styles.formError}>{errorMessage}</Text>}

            <PrimaryButton title="Daftar" icon="person-add-outline" loading={isLoading} onPress={handleRegister} />
            <View style={styles.bottomRow}>
              <Text style={styles.mutedText}>Sudah punya akun? </Text>
              <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                <Text style={styles.linkText}>Masuk</Text>
              </TouchableOpacity>
            </View>
          </AuthCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flexGrow: 1, padding: 20, paddingBottom: 28, justifyContent: "center" },
  agreeRow: { flexDirection: "row", alignItems: "flex-start", gap: 9, marginBottom: 10 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.cardBg,
    marginTop: 1,
  },
  checkboxActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  agreeText: { flex: 1, color: COLORS.textMuted, fontSize: 12, fontWeight: "700", lineHeight: 18 },
  fieldError: { color: COLORS.danger, fontSize: 12, fontWeight: "700", marginBottom: 10 },
  formError: { color: COLORS.danger, fontSize: 13, fontWeight: "700", textAlign: "center", marginBottom: 12 },
  bottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 18 },
  mutedText: { color: COLORS.textMuted, fontSize: 13, fontWeight: "700" },
  linkText: { color: COLORS.primary, fontSize: 13, fontWeight: "900" },
});
