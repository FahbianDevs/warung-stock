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
import { login } from "@/src/services/auth/authApi";

const LoginScreen = () => {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    identifier?: string;
    password?: string;
  }>({});

  const validate = () => {
    const nextErrors: { identifier?: string; password?: string } = {};
    const trimmed = identifier.trim();

    if (!trimmed) nextErrors.identifier = "Email/username tidak boleh kosong.";
    if (trimmed.includes("@")) {
      const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
      if (!okEmail) nextErrors.identifier = "Format email tidak valid.";
    }
    if (!password) nextErrors.password = "Password tidak boleh kosong.";

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async () => {
    setErrorMessage(null);
    if (!validate()) return;
    setIsLoading(true);
    try {
      await login({ identifier: identifier.trim(), password });

      // Navigate ke dashboard
      router.replace("/(app)/dashboard");
    } catch (e) {
      console.error("Login error:", e);

      const message =
        e instanceof Error ? e.message : "Terjadi error tidak terduga.";

      setErrorMessage(message || "Login gagal. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    router.push("/(auth)/register");
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

        {/* Title */}
        <Text style={styles.title}>Masuk ke Akun</Text>

        {/* Form Inputs */}
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email / Username"
            placeholderTextColor="#333"
            autoCapitalize="none"
            value={identifier}
            onChangeText={(v) => {
              setIdentifier(v);
              if (fieldErrors.identifier) {
                setFieldErrors((p) => ({ ...p, identifier: undefined }));
              }
            }}
          />
          {!!fieldErrors.identifier && (
            <Text style={styles.fieldError}>{fieldErrors.identifier}</Text>
          )}
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

          {!!errorMessage && <Text style={styles.formError}>{errorMessage}</Text>}

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.loginButtonText}>Memproses...</Text>
              </View>
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Belum punya akun? </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>Daftar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EBE5E4",
  },
  topBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "#23050C",
  },
  contentContainer: {
    flex: 1,
    paddingTop: 40,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    marginBottom: 30,
  },
  logoRed: {
    fontSize: 28,
    fontWeight: "900",
    color: "#D71920",
  },
  logoWhite: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#23050C",
    marginBottom: 30,
  },
  formContainer: {
    width: "85%",
    alignItems: "center",
  },
  input: {
    backgroundColor: "#FEF7F3",
    width: "100%",
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 8,
    fontSize: 14,
    color: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
  loginButton: {
    backgroundColor: "#23050C",
    width: "50%",
    height: 45,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  loginButtonText: {
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
  registerContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  registerText: {
    color: "#9E9396",
    fontSize: 14,
  },
  registerLink: {
    color: "#D71920",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default LoginScreen;
