import { WarehouseListScreen } from "@/src/screens/warehouse";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { useWindowDimensions } from "react-native";

type DrawerNavigation = DrawerNavigationProp<any>;

export default function WarehouseScreen() {
  const navigation = useNavigation<DrawerNavigation>();
  useWindowDimensions();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return <WarehouseListScreen navigation={navigation} />;
}
