import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { register } from "@/src/services/auth/authApi";

const RegisterScreen = () => {
  const router = useRouter();
  const [role, setRole] = useState("owner"); // 'owner' | 'supplier'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const nextErrors: typeof fieldErrors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) nextErrors.name = "Nama tidak boleh kosong.";
    if (!trimmedEmail) nextErrors.email = "Email tidak boleh kosong.";
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = "Format email tidak valid.";
    }
    if (!password) nextErrors.password = "Password tidak boleh kosong.";
    if (!confirmPassword) nextErrors.confirmPassword = "Konfirmasi password wajib diisi.";
    if (password && confirmPassword && password !== confirmPassword) {
      nextErrors.confirmPassword = "Konfirmasi password tidak sama.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = async () => {
    setErrorMessage(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register({
        identifier: email.trim(),
        password,
        name: name.trim(),
        role,
      });
      router.replace("/(auth)/login");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Registrasi gagal.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#23050C" />

      {/* Background Gelap di Bagian Atas */}
      <View style={styles.topBackground} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.contentContainer}
      >
        {/* Header / Logo */}
        <View style={styles.header}>
          <Text style={styles.logoRed}>WARUNG</Text>
          <Text style={styles.logoWhite}>-STOCK</Text>
        </View>

        {/* Role Selection */}
        <View style={styles.roleContainer}>
          <Text style={styles.roleLabel}>Pilih peran *</Text>
          <View style={styles.roleButtonsRow}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "owner" && styles.roleButtonActive,
              ]}
              onPress={() => setRole("owner")}
            >
              <Text style={styles.roleButtonText}>Pemilik{"\n"}Warung</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "supplier" && styles.roleButtonActive,
              ]}
              onPress={() => setRole("supplier")}
            >
              <Text style={styles.roleButtonText}>Supplier</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Inputs */}
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nama"
            placeholderTextColor="#333"
            value={name}
            onChangeText={(v) => {
              setName(v);
              if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: undefined }));
            }}
          />
          {!!fieldErrors.name && <Text style={styles.fieldError}>{fieldErrors.name}</Text>}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#333"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
            }}
          />
          {!!fieldErrors.email && <Text style={styles.fieldError}>{fieldErrors.email}</Text>}
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#000"
            secureTextEntry
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (fieldErrors.password) {
                setFieldErrors((p) => ({ ...p, password: undefined }));
              }
            }}
          />
          {!!fieldErrors.password && (
            <Text style={styles.fieldError}>{fieldErrors.password}</Text>
          )}
          <TextInput
            style={styles.input}
            placeholder="Konfirmasi password"
            placeholderTextColor="#000"
            secureTextEntry
            value={confirmPassword}
            onChangeText={(v) => {
              setConfirmPassword(v);
              if (fieldErrors.confirmPassword) {
                setFieldErrors((p) => ({ ...p, confirmPassword: undefined }));
              }
            }}
          />
          {!!fieldErrors.confirmPassword && (
            <Text style={styles.fieldError}>{fieldErrors.confirmPassword}</Text>
          )}

          {!!errorMessage && <Text style={styles.formError}>{errorMessage}</Text>}

          {/* Sign Up Button */}
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.signUpButtonText}>Memproses...</Text>
              </View>
            ) : (
              <Text style={styles.signUpButtonText}>Daftar</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EBE5E4", // Latar belakang abu-abu/pink muda di bawah
  },
  topBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%", // Menyesuaikan potongan background di tengah layar
    backgroundColor: "#23050C", // Latar belakang merah marun gelap
  },
  contentContainer: {
    flex: 1,
    paddingTop: 40,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    marginBottom: 40,
  },
  logoRed: {
    fontSize: 28,
    fontWeight: "900",
    color: "#D71920", // Warna merah Stock
  },
  logoWhite: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF", // Warna putih Sip
  },
  roleContainer: {
    width: "80%",
    marginBottom: 40,
  },
  roleLabel: {
    color: "#9E9396",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
  roleButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  roleButton: {
    backgroundColor: "#3E1C24",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 15,
    width: "48%",
    alignItems: "center",
    justifyContent: "center",
  },
  roleButtonActive: {
    backgroundColor: "#572733", // Sedikit lebih terang jika dipilih
  },
  roleButtonText: {
    color: "#9E9396",
    fontSize: 12,
    textAlign: "center",
  },
  formContainer: {
    width: "85%",
    alignItems: "center",
  },
  input: {
    backgroundColor: "#FEF7F3", // Putih gading
    width: "100%",
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 8,
    fontSize: 14,
    color: "#000",
    // Shadow untuk iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // Elevation untuk Android
    elevation: 3,
  },
  fieldError: {
    width: "100%",
    color: "#D71920",
    fontSize: 12,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  formError: {
    width: "100%",
    color: "#D71920",
    fontSize: 13,
    marginBottom: 10,
    paddingHorizontal: 10,
    textAlign: "center",
  },
  signUpButton: {
    backgroundColor: "#23050C",
    width: "50%",
    height: 45,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  signUpButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default RegisterScreen;
