import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../theme";

interface MenuItem {
  name: string;
  icon: string;
  route?: string;
}

interface CustomDrawerProps {
  [key: string]: any;
}

export default function CustomDrawer(props: CustomDrawerProps) {
  const router = useRouter();

  const menuItems: MenuItem[] = [
    { name: "Dashboard", icon: "home-outline", route: "dashboard" },
    { name: "Tambah Barang", icon: "add-circle-outline", route: "add-item" },
    { name: "Riwayat", icon: "time-outline", route: "history" },
    { name: "Pengaturan", icon: "settings-outline", route: "settings" },
  ];

  const handleMenuPress = (menuName: string, route?: string) => {
    if (route) {
      props.navigation.navigate(route);
      props.navigation.closeDrawer();
    } else if (menuName === "Logout") {
      handleLogout();
    } else {
      alert(`${menuName} coming soon!`);
      props.navigation.closeDrawer();
    }
  };

  const handleLogout = async () => {
    try {
      router.replace("/(auth)/logout");
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.primary }}>
      <DrawerContentScrollView {...props}>
        <View style={styles.header}>
          <Text style={styles.logoText}>WARUNG-STOCK</Text>
          <Text style={styles.userText}>Smart Inventory Management</Text>
        </View>
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.name, item.route)}
            >
              <Icon
                name={item.icon}
                size={22}
                color={COLORS.textLight}
                style={styles.icon}
              />
              <Text style={styles.menuText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </DrawerContentScrollView>

      {/* Logout Button at Bottom */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutMenuItem} onPress={handleLogout}>
          <Icon
            name="log-out"
            size={22}
            color={COLORS.textLight}
            style={styles.icon}
          />
          <Text style={styles.menuText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  logoText: {
    color: COLORS.textLight,
    fontSize: 24,
    fontWeight: "bold",
  },
  userText: {
    color: COLORS.textLight,
    fontSize: 14,
    opacity: 0.7,
    marginTop: 5,
  },
  menuContainer: {
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  logoutMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  icon: {
    marginRight: 15,
  },
  menuText: {
    color: COLORS.textLight,
    fontSize: 16,
  },
  footer: {
    paddingVertical: 10,
  },
});
