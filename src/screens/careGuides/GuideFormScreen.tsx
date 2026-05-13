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
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../theme";

interface GuideFormScreenProps {
  route: any;
  navigation: any;
}

export default function GuideFormScreen({
  route,
  navigation,
}: GuideFormScreenProps) {
  const isEdit = route?.params?.isEdit || false;
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const [productName, setProductName] = useState(isEdit ? "Vino Tinto" : "");
  const [guideType, setGuideType] = useState(isEdit ? "Vino" : "");
  const [comments, setComments] = useState(isEdit ? "No apilar" : "");
  const [minTemp, setMinTemp] = useState(isEdit ? "10" : "");
  const [maxTemp, setMaxTemp] = useState(isEdit ? "30" : "");

  const handleSave = () => {
    // TODO: Implementasi logika penyimpanan
    console.log("Guide saved:", {
      productName,
      guideType,
      comments,
      minTemp,
      maxTemp,
    });
    navigation.goBack();
  };

  const handleDelete = () => {
    // TODO: Implementasi logika penghapusan
    console.log("Guide deleted");
    setDeleteModalVisible(false);
    navigation.goBack();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.backBtn}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEdit ? "Vino Tinto" : "New Guide"}
          </Text>
        </View>
        {isEdit && (
          <TouchableOpacity onPress={() => setDeleteModalVisible(true)}>
            <Icon name="trash-outline" size={24} color={COLORS.border} />
          </TouchableOpacity>
        )}
      </View>

      {/* Image Preview */}
      <View style={styles.imageSection}>
        <Image
          source={{
            uri: "https://via.placeholder.com/150",
          }}
          style={styles.mainImage}
        />
        {!isEdit && (
          <TouchableOpacity style={styles.selectImageBtn}>
            <Text style={styles.selectImageText}>Select Image</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Form Inputs */}
      <View style={styles.formContainer}>
        {/* Product Dropdown */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Select Product"
            value={productName}
            onChangeText={setProductName}
            editable={!isEdit}
            placeholderTextColor={COLORS.grayText}
          />
          {!isEdit && (
            <Icon
              name="chevron-down"
              size={20}
              color="#999"
              style={styles.dropdownIcon}
            />
          )}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Type"
          value={guideType}
          onChangeText={setGuideType}
          placeholderTextColor={COLORS.grayText}
        />
        <TextInput
          style={styles.input}
          placeholder="Comments"
          value={comments}
          onChangeText={setComments}
          placeholderTextColor={COLORS.grayText}
        />
        <TextInput
          style={styles.input}
          placeholder="Min. Temperature"
          value={minTemp}
          onChangeText={setMinTemp}
          keyboardType="numeric"
          placeholderTextColor={COLORS.grayText}
        />
        <TextInput
          style={styles.input}
          placeholder="Max. Temperature"
          value={maxTemp}
          onChangeText={setMaxTemp}
          keyboardType="numeric"
          placeholderTextColor={COLORS.grayText}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
        <Text style={styles.submitBtnText}>{isEdit ? "Save" : "Add"}</Text>
      </TouchableOpacity>

      {/* Delete Confirmation Modal */}
      <Modal transparent visible={deleteModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Are you sure you want to delete this care guide?
            </Text>
            <TouchableOpacity
              style={styles.modalBtnDelete}
              onPress={handleDelete}
            >
              <Text style={styles.modalBtnTextLight}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalBtnCancel}
              onPress={() => setDeleteModalVisible(false)}
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 40,
  },
  headerRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginLeft: 10,
  },
  imageSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  mainImage: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
  },
  selectImageBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: -15,
    zIndex: 1,
  },
  selectImageText: {
    color: COLORS.textLight,
    fontSize: 12,
    fontWeight: "bold",
  },

  formContainer: {
    width: "85%",
  },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  dropdownIcon: {
    position: "absolute",
    right: 15,
  },
  input: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 15,
    fontSize: 14,
    color: "#333",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 20,
  },
  submitBtnText: {
    color: COLORS.textLight,
    fontWeight: "bold",
    fontSize: 16,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: 300,
    backgroundColor: COLORS.cardBg,
    borderRadius: 25,
    padding: 25,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
  },
  modalBtnDelete: {
    backgroundColor: COLORS.danger,
    width: "100%",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 10,
  },
  modalBtnCancel: {
    backgroundColor: "#E8E8E8",
    width: "100%",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
  },
  modalBtnTextLight: {
    color: COLORS.textLight,
    fontWeight: "bold",
    fontSize: 14,
  },
  modalBtnTextDark: {
    color: "#555",
    fontWeight: "bold",
    fontSize: 14,
  },
});
