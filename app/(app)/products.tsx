import { ProductListScreen } from "@/src/screens/products";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";

type DrawerNavigation = DrawerNavigationProp<any>;

export default function ProductsScreen() {
  const navigation = useNavigation<DrawerNavigation>();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return <ProductListScreen navigation={navigation} />;
}
