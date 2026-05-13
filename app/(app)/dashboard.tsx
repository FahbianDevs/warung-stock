import { storage } from "@/src/services/storage";
import { COLORS } from "@/src/theme";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

type DrawerNavigation = DrawerNavigationProp<any>;

interface MenuCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

export default function DashboardScreen() {
  const navigation = useNavigation<DrawerNavigation>();
  const router = useRouter();

  const menuCards: MenuCard[] = [
    {
      id: "1",
      title: "Warehouse",
      description: "Manage your warehouses",
      icon: "business",
      route: "warehouse",
      color: "#FF6B6B",
    },
    {
      id: "2",
      title: "Products",
      description: "View all products",
      icon: "cube",
      route: "products",
      color: "#4ECDC4",
    },
    {
      id: "3",
      title: "Care Guides",
      description: "Product care information",
      icon: "medical",
      route: "careGuides",
      color: "#FFE66D",
    },
    {
      id: "4",
      title: "Orders",
      description: "Manage orders",
      icon: "cart",
      route: "orders",
      color: "#95E1D3",
    },
  ];

  const handleMenuPress = (route: string) => {
    if (route === "warehouse") {
      navigation.navigate("warehouse");
    } else if (route === "products") {
      navigation.navigate("products");
    } else if (route === "careGuides") {
      navigation.navigate("careGuides");
    } else {
      alert("Coming soon!");
    }
  };

  const handleLogout = async () => {
    try {
      await storage.removeItem("userToken");
      router.replace("/(auth)/login");
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  const handleMenuOpen = () => {
    navigation.openDrawer();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={handleMenuOpen}>
          <Icon name="menu" size={28} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>StockSip</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>

      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Welcome Back!</Text>
        <Text style={styles.welcomeSubtitle}>
          Manage your inventory efficiently
        </Text>
      </View>

      {/* Menu Cards */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardsGrid}>
          {menuCards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={styles.menuCard}
              onPress={() => handleMenuPress(card.route)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: card.color + "20" },
                ]}
              >
                <Icon name={card.icon} size={32} color={card.color} />
              </View>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardDescription}>{card.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>10</Text>
              <Text style={styles.statLabel}>Warehouses</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>256</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>1,250</Text>
              <Text style={styles.statLabel}>Total Stock</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.primary,
    paddingTop: 20,
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textLight,
  },
  logoutButton: {
    padding: 8,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    backgroundColor: COLORS.primary,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.textLight,
    marginBottom: 5,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  menuCard: {
    width: "48%",
    backgroundColor: COLORS.cardBg,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: "center",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 5,
    textAlign: "center",
  },
  cardDescription: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  statsSection: {
    marginTop: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
  },
});
