import { RegisterScreen } from "@/src/screens/auth";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RegisterPage() {
  return <RegisterScreen />;
}
const Register = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Latar Belakang Terbagi */}
      <View style={styles.topBackground} />
      <View style={styles.bottomBackground} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Bagian Atas: Judul */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>
            <Text style={styles.titleRed}>Stock</Text>
            <Text style={styles.titleWhite}>Sip</Text>
          </Text>
        </View>

        {/* Bagian Tengah: Form Input */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionLabel}>User info</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#A9A9A9"
          />
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
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#A9A9A9"
            secureTextEntry
          />
        </View>

        {/* Bagian Bawah: Tombol */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.mainButton}>
            <Text style={styles.mainButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3EAEA",
  },
  topBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "60%",
    backgroundColor: "#260811",
  },
  bottomBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "#F3EAEA",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 30,
    justifyContent: "space-between",
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: "center",
    marginTop: 80,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  titleRed: {
    color: "#D30000",
  },
  titleWhite: {
    color: "#FFFFFF",
  },
  formContainer: {
    width: "100%",
  },
  sectionLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 10,
  },
  input: {
    backgroundColor: "#FFF8F8",
    borderRadius: 25,
    height: 50,
    paddingHorizontal: 20,
    marginBottom: 15,
    fontSize: 14,
    color: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  mainButton: {
    backgroundColor: "#260811",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    width: "60%",
  },
  mainButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Register;
