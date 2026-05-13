import React, { useState } from "react";
import {
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../theme";

interface GuideItem {
  id: string;
  name: string;
  type: string;
  minTemp: string;
  maxTemp: string;
  notes: string;
  image: string;
}

const GUIDES_DATA: GuideItem[] = [
  {
    id: "1",
    name: "Vino Blanco",
    type: "Vino",
    minTemp: "10° C",
    maxTemp: "30° C",
    notes: "No apilar junto a otros productos",
    image: "https://via.placeholder.com/50",
  },
  {
    id: "2",
    name: "Vino Tinto",
    type: "Vino",
    minTemp: "12° C",
    maxTemp: "25° C",
    notes: "Mantener en lugar oscuro",
    image: "https://via.placeholder.com/50",
  },
  {
    id: "3",
    name: "Whisky Blanco",
    type: "Whisky",
    minTemp: "15° C",
    maxTemp: "28° C",
    notes: "Almacenar en lugar seco",
    image: "https://via.placeholder.com/50",
  },
];

interface CareGuidesScreenProps {
  navigation: any;
}

export default function CareGuidesScreen({
  navigation,
}: CareGuidesScreenProps) {
  const [selectedGuide, setSelectedGuide] = useState<GuideItem | null>(null);
  const [searchText, setSearchText] = useState("");

  const filteredGuides = GUIDES_DATA.filter((guide) =>
    guide.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  const renderItem = ({ item }: { item: GuideItem }) => (
    <View style={styles.listItem}>
      <View style={styles.itemLeft}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        <Text style={styles.itemName}>{item.name}</Text>
      </View>
      <TouchableOpacity onPress={() => setSelectedGuide(item)}>
        <Text style={styles.seeGuideBtn}>See Guide</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header & Search */}
      <View style={styles.header}>
        <Text style={styles.title}>Care Guides ({GUIDES_DATA.length})</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Icon name="search-outline" size={20} color={COLORS.grayText} />
          <TextInput
            placeholder="Search"
            style={styles.searchInput}
            placeholderTextColor={COLORS.grayText}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => navigation.navigate("GuideForm")}
        >
          <Text style={styles.newBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filteredGuides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        scrollEnabled={false}
      />

      {/* Modal View Guide */}
      <Modal visible={!!selectedGuide} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedGuide && (
              <>
                <Image
                  source={{ uri: selectedGuide.image }}
                  style={styles.modalImage}
                />
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setSelectedGuide(null)}
                >
                  <Icon name="close" size={24} color="#333" />
                </TouchableOpacity>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Product Name</Text>
                  <Text style={styles.infoValue}>{selectedGuide.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Type</Text>
                  <Text style={styles.infoValue}>{selectedGuide.type}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Comments</Text>
                  <Text style={styles.infoValue}>{selectedGuide.notes}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Min. Temperature</Text>
                  <Text style={styles.infoValue}>{selectedGuide.minTemp}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Max. Temperature</Text>
                  <Text style={styles.infoValue}>{selectedGuide.maxTemp}</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginLeft: 10,
  },
  searchRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    marginRight: 15,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  newBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  newBtnText: {
    color: COLORS.textLight,
    fontWeight: "bold",
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemImage: {
    width: 30,
    height: 50,
    resizeMode: "contain",
    marginRight: 15,
  },
  itemName: {
    fontSize: 16,
    color: "#333",
  },
  seeGuideBtn: {
    color: COLORS.textDark,
    fontWeight: "bold",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "80%",
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 20,
    alignItems: "flex-start",
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: 15,
    right: 15,
  },
  modalImage: {
    width: 60,
    height: 100,
    alignSelf: "center",
    marginBottom: 20,
    resizeMode: "contain",
  },
  infoRow: {
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: "#444",
  },
});
