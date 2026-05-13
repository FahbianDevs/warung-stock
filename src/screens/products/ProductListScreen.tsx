import React, { useState } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "../../theme";

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
}

const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Vino Blanco",
    price: "S/. 10.00",
    image: "https://via.placeholder.com/50",
  },
  {
    id: "2",
    name: "Vino Tinto",
    price: "S/. 20.00",
    image: "https://via.placeholder.com/50",
  },
  {
    id: "3",
    name: "Whisky Blanco",
    price: "S/. 30.00",
    image: "https://via.placeholder.com/50",
  },
];

interface ProductListScreenProps {
  navigation: any;
}

export default function ProductListScreen({
  navigation,
}: ProductListScreenProps) {
  const [activeTab, setActiveTab] = useState<"Items" | "Stock">("Items");

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => navigation.navigate("EditProduct", { item })}
    >
      <View style={styles.leftRow}>
        <Image source={{ uri: item.image }} style={styles.productThumb} />
        <Text style={styles.productName}>{item.name}</Text>
      </View>
      <Text style={styles.productPrice}>{item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Products (9)</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate("EditProduct", { isNew: true })}
        >
          <Text style={styles.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Items" && styles.activeTab]}
          onPress={() => setActiveTab("Items")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Items" && styles.activeTabText,
            ]}
          >
            Items
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Stock" && styles.activeTab]}
          onPress={() => setActiveTab("Stock")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Stock" && styles.activeTabText,
            ]}
          >
            Stock
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "Items" ? (
        <FlatList
          data={PRODUCTS}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.stockView}>
          <Text style={styles.stockLabel}>Current Stock</Text>
          <Text style={styles.stockNumber}>0</Text>
          <View style={styles.stockLine} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textDark,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  addBtnText: {
    color: COLORS.textLight,
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.textDark,
  },
  tabText: {
    color: COLORS.grayText,
    fontWeight: "bold",
  },
  activeTabText: {
    color: COLORS.textDark,
  },
  list: {
    paddingVertical: 10,
  },
  productItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  productThumb: {
    width: 40,
    height: 60,
    marginRight: 15,
    resizeMode: "contain",
  },
  productName: {
    fontSize: 16,
    color: "#333",
  },
  productPrice: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  stockView: {
    alignItems: "center",
    marginTop: 50,
  },
  stockLabel: {
    color: COLORS.textGray,
    fontSize: 18,
  },
  stockNumber: {
    color: COLORS.textDark,
    fontSize: 100,
    fontWeight: "bold",
  },
  stockLine: {
    height: 2,
    width: 100,
    backgroundColor: COLORS.textDark,
  },
});
