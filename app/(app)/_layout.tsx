import { CustomDrawer } from "@/src/screens/components";
import { Drawer } from "expo-router/drawer";

export default function AppLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerType: "front",
      }}
      drawerContent={(props) => <CustomDrawer {...props} />}
    >
      <Drawer.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
        }}
      />
      <Drawer.Screen
        name="add-item"
        options={{
          title: "Tambah Barang",
        }}
      />
      <Drawer.Screen
        name="history"
        options={{
          title: "Riwayat Masuk/Keluar",
        }}
      />
      <Drawer.Screen
        name="statistics"
        options={{
          title: "Statistik",
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: "Pengaturan",
        }}
      />
    </Drawer>
  );
}
