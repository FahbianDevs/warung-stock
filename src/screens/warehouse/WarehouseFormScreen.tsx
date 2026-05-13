import React, { useState } from "react";
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "../../theme";

interface WarehouseFormScreenProps {
  route: any;
  navigation: any;
}

export default function WarehouseFormScreen({
  route,
  navigation,
}: WarehouseFormScreenProps) {
  const isEdit = route.params?.isEdit || false;
  const [modalVisible, setModalVisible] = useState(false);
  const [warehouseName, setWarehouseName] = useState(
    isEdit ? "Warehouse 1" : "",
  );
  const [street, setStreet] = useState(isEdit ? "Av. Sol" : "");
  const [city, setCity] = useState(isEdit ? "Lima" : "");
  const [district, setDistrict] = useState(isEdit ? "Chorrillos" : "");
  const [postalCode, setPostalCode] = useState(isEdit ? "1234" : "");
  const [country, setCountry] = useState(isEdit ? "Peru" : "");
  const [capacity, setCapacity] = useState(isEdit ? "10000" : "");

  const handleSave = () => {
    // TODO: Implementasi logika penyimpanan
    console.log("Warehouse saved:", {
      warehouseName,
      street,
      city,
      district,
      postalCode,
      country,
      capacity,
    });
    navigation.goBack();
  };

  const handleDelete = () => {
    // TODO: Implementasi logika penghapusan
    console.log("Warehouse deleted");
    setModalVisible(false);
    navigation.goBack();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ alignItems: "center", paddingBottom: 30 }}
    >
      {/* Gambar Preview */}
      <Image
        source={{ uri: "https://via.placeholder.com/300x150" }}
        style={styles.imagePreview}
      />
      <TouchableOpacity style={styles.imageBtn}>
        <Text style={styles.imageBtnText}>Select Image</Text>
      </TouchableOpacity>

      {/* Form Inputs */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Warehouse Name"
          value={warehouseName}
          onChangeText={setWarehouseName}
        />
        <TextInput
          style={styles.input}
          placeholder="Street"
          value={street}
          onChangeText={setStreet}
        />
        <TextInput
          style={styles.input}
          placeholder="City"
          value={city}
          onChangeText={setCity}
        />
        <TextInput
          style={styles.input}
          placeholder="District"
          value={district}
          onChangeText={setDistrict}
        />
        <TextInput
          style={styles.input}
          placeholder="Postal Code"
          value={postalCode}
          onChangeText={setPostalCode}
        />
        <TextInput
          style={styles.input}
          placeholder="Country"
          value={country}
          onChangeText={setCountry}
        />
        <TextInput
          style={styles.input}
          placeholder="Capacity"
          value={capacity}
          onChangeText={setCapacity}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>{isEdit ? "Save" : "Add"}</Text>
      </TouchableOpacity>

      {/* Tombol Hapus (Hanya saat edit) */}
      {isEdit && (
        <TouchableOpacity
          style={{ marginTop: 20 }}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{ color: COLORS.danger, fontWeight: "bold" }}>
            Delete Warehouse
          </Text>
        </TouchableOpacity>
      )}

      {/* Modal Hapus */}
      <Modal transparent={true} visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Are you sure you want to delete this warehouse?
            </Text>
            <TouchableOpacity
              style={styles.modalBtnDelete}
              onPress={handleDelete}
            >
              <Text style={styles.modalBtnTextLight}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalBtnCancel}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalBtnTextDark}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  imagePreview: { width: 200, height: 120, marginTop: 20, borderRadius: 8 },
  imageBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: -15,
    zIndex: 1,
  },
  imageBtnText: {
    color: COLORS.textLight,
    fontSize: 12,
    fontWeight: "bold",
  },
  formContainer: { width: "85%", marginTop: 20 },
  input: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    width: "40%",
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnText: {
    color: COLORS.textLight,
    fontWeight: "bold",
    fontSize: 16,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 280,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
  },
  modalText: {
    textAlign: "center",
    color: COLORS.textDark,
    fontWeight: "bold",
    marginBottom: 20,
    fontSize: 16,
  },
  modalBtnDelete: {
    backgroundColor: COLORS.danger,
    width: "100%",
    padding: 12,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 10,
  },
  modalBtnCancel: {
    backgroundColor: "#E0E0E0",
    width: "100%",
    padding: 12,
    borderRadius: 20,
    alignItems: "center",
  },
  modalBtnTextLight: { color: "white", fontWeight: "bold" },
  modalBtnTextDark: { color: "#333", fontWeight: "bold" },
});
