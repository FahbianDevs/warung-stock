import React, { useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "../../theme";

interface EditProductScreenProps {
  route: any;
  navigation: any;
}

export default function EditProductScreen({
  route,
  navigation,
}: EditProductScreenProps) {
  const item = route.params?.item;
  const isNew = route.params?.isNew || false;

  const [productName, setProductName] = useState(item?.name || "");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState(item?.price || "");
  const [stock, setStock] = useState("");

  const handleSave = () => {
    // TODO: Implementasi logika penyimpanan produk
    console.log("Product saved:", {
      productName,
      brand,
      category,
      price,
      stock,
    });
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>{isNew ? "New Product" : productName}</Text>

        {/* Image Picker Area */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: "https://via.placeholder.com/150x200",
            }}
            style={styles.mainImage}
          />
          <TouchableOpacity style={styles.selectBtn}>
            <Text style={styles.selectBtnText}>Select Image</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Product Name"
            value={productName}
            onChangeText={setProductName}
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Brand"
            value={brand}
            onChangeText={setBrand}
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Category"
            value={category}
            onChangeText={setCategory}
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Price (S/.)"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Stock Quantity"
            value={stock}
            onChangeText={setStock}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{isNew ? "Add" : "Save"}</Text>
        </TouchableOpacity>

        {!isNew && (
          <TouchableOpacity style={{ marginTop: 20, marginBottom: 20 }}>
            <Text
              style={{
                color: COLORS.danger,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Delete Product
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  mainImage: {
    width: 120,
    height: 180,
    borderRadius: 10,
    resizeMode: "contain",
  },
  selectBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginTop: -15,
    zIndex: 1,
  },
  selectBtnText: {
    color: COLORS.textLight,
    fontSize: 12,
    fontWeight: "bold",
  },
  form: {
    width: "100%",
    marginBottom: 20,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    color: "#333",
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    width: "50%",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnText: {
    color: COLORS.textLight,
    fontWeight: "bold",
    fontSize: 16,
  },
});
