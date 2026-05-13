import React from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../theme";

interface Warehouse {
  id: string;
  name: string;
  location: string;
  image: string;
}

const DATA: Warehouse[] = [
  {
    id: "1",
    name: "Warehouse 1",
    location: "Av. Sol",
    image: "https://via.placeholder.com/150",
  },
  {
    id: "2",
    name: "Warehouse 2",
    location: "Av. Sol",
    image: "https://via.placeholder.com/150",
  },
  {
    id: "3",
    name: "Warehouse 3",
    location: "Av. Sol",
    image: "https://via.placeholder.com/150",
  },
  {
    id: "4",
    name: "Warehouse 4",
    location: "Av. Sol",
    image: "https://via.placeholder.com/150",
  },
];

interface WarehouseListScreenProps {
  navigation: any;
}

export default function WarehouseListScreen({
  navigation,
}: WarehouseListScreenProps) {
  const renderItem = ({ item }: { item: Warehouse }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>{item.location}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Max. Warehouses</Text>
          <View style={styles.countContainer}>
            <Icon name="home" size={16} color={COLORS.primary} />
            <Text style={styles.countText}>10</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.newButton}
          onPress={() => navigation.navigate("NewWarehouse")}
        >
          <Text style={styles.newButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  headerTitle: {
    fontSize: 12,
    color: COLORS.textDark,
    fontWeight: "bold",
  },
  countContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  countText: { marginLeft: 8, fontWeight: "bold", color: COLORS.primary },
  newButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  newButtonText: { color: COLORS.textLight, fontWeight: "bold" },
  listContainer: { paddingHorizontal: 10, paddingBottom: 20 },
  card: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    margin: 8,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: { width: "100%", height: 100 },
  cardInfo: { padding: 10 },
  cardTitle: { fontSize: 14, fontWeight: "bold", color: COLORS.textDark },
  cardSubtitle: { fontSize: 12, color: "#666", marginTop: 2 },
});
