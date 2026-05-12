import { storage } from "@/src/services/storage";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function DashboardScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await storage.removeItem("userToken");
      router.replace("/(auth)/login");
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Welcome to WarungStock!</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EBE5E4",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#23050C",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#9E9396",
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: "#D71920",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
