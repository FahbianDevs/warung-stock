import { CustomDrawer } from "@/src/screens/components";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Drawer } from "expo-router/drawer";

const Stack = createNativeStackNavigator();

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
        name="warehouse"
        options={{
          title: "Warehouse",
        }}
      />
      <Drawer.Screen
        name="products"
        options={{
          title: "Products",
        }}
      />
      <Drawer.Screen
        name="careGuides"
        options={{
          title: "Care Guides",
        }}
      />
    </Drawer>
  );
}
