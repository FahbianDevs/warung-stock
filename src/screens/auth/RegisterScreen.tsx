import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const RegisterScreen = () => {
  const [role, setRole] = useState("owner"); // 'owner' | 'supplier'

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
          <Text style={styles.logoRed}>Stock</Text>
          <Text style={styles.logoWhite}>Sip</Text>
        </View>

        {/* Role Selection */}
        <View style={styles.roleContainer}>
          <Text style={styles.roleLabel}>Choose your role *</Text>
          <View style={styles.roleButtonsRow}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "owner" && styles.roleButtonActive,
              ]}
              onPress={() => setRole("owner")}
            >
              <Text style={styles.roleButtonText}>Liquor Store{"\n"}Owner</Text>
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
            placeholder="Usuario"
            placeholderTextColor="#333"
          />
          <TextInput
            style={styles.input}
            placeholder="usuario@example.com"
            placeholderTextColor="#333"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="••••••••••••"
            placeholderTextColor="#000"
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="••••••••••••"
            placeholderTextColor="#000"
            secureTextEntry
          />

          {/* Sign Up Button */}
          <TouchableOpacity style={styles.signUpButton}>
            <Text style={styles.signUpButtonText}>Sign Up</Text>
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
    marginBottom: 15,
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
  },
});

export default RegisterScreen;
