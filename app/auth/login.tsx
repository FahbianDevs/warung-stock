import { LoginScreen } from "@/src/screens/auth";
import React from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginPage() {
  return <LoginScreen />;
}
const Login = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Latar Belakang Terbagi */}
      <View style={styles.topBackground} />
      <View style={styles.bottomBackground} />

      <View style={styles.contentContainer}>
        {/* Bagian Atas: Logo & Judul */}
        <View style={styles.headerContainer}>
          <View style={styles.logoPlaceholder}>
            {/* Placeholder untuk logo V dan gelas koktail */}
            <Text style={styles.logoText}>🍸</Text>
          </View>
          <Text style={styles.title}>
            <Text style={styles.titleRed}>Stock</Text>
            <Text style={styles.titleWhite}>Sip</Text>
          </Text>
        </View>

        {/* Bagian Bawah: Form Input */}
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#A9A9A9"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#A9A9A9"
            secureTextEntry
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mainButton}>
            <Text style={styles.mainButtonText}>Sign In</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Dont you have an account? </Text>
            <TouchableOpacity>
              <Text style={styles.signupText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3EAEA", // Warna terang dasar
  },
  topBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "60%",
    backgroundColor: "#260811", // Warna cokelat gelap/burgundy
  },
  bottomBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "#F3EAEA",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 50,
    marginTop: 40,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  logoText: {
    fontSize: 50,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
  },
  titleRed: {
    color: "#D30000", // Merah
  },
  titleWhite: {
    color: "#FFFFFF",
  },
  formContainer: {
    width: "100%",
  },
  input: {
    backgroundColor: "#FFF8F8",
    borderRadius: 25,
    height: 50,
    paddingHorizontal: 20,
    marginBottom: 15,
    fontSize: 14,
    color: "#333",
    // Shadow ringan untuk input
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  forgotPassword: {
    alignSelf: "flex-start",
    marginLeft: 10,
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#D30000",
    fontSize: 10,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  mainButton: {
    backgroundColor: "#260811",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
    alignSelf: "center",
    width: "60%",
  },
  mainButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#555",
    fontSize: 12,
  },
  signupText: {
    color: "#D30000",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default Login;
