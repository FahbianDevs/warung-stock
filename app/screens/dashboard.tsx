import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// --- Komponen Reusable untuk Kartu ---
interface ActionCardProps {
  title: string;
  buttonText: string;
  iconEmoji: string;
}

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  buttonText,
  iconEmoji,
}) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardLeft}>
        <Text style={styles.cardTitle}>{title}</Text>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.cardRight}>
        {/* Placeholder untuk Ikon */}
        <Text style={styles.iconPlaceholder}>{iconEmoji}</Text>
      </View>
    </View>
  );
};

// --- Komponen Utama Dashboard ---
const Dashboard = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3EAEA" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuIconContainer}>
          {/* Hamburger Menu Placeholder */}
          <Text style={styles.menuIconText}>=</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Home</Text>
      </View>

      {/* Daftar Konten */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ActionCard
          title="Shall we start by creating a product?"
          buttonText="+ New Product"
          iconEmoji="🍷"
        />

        <ActionCard
          title="Start recording your purchase orders"
          buttonText="+ New Order"
          iconEmoji="📋"
        />

        <ActionCard
          title="Should we complete your employees' data?"
          buttonText="+ New User"
          iconEmoji="👩‍💼"
        />

        <ActionCard
          title="Should we complete your employees' data?"
          buttonText="+ New User"
          iconEmoji="📖"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3EAEA", // Warna latar belakang dasar
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  menuIconContainer: {
    marginRight: 15,
  },
  menuIconText: {
    fontSize: 24,
    color: "#8C2131", // Warna merah gelap/burgundy
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8C2131",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  // Style untuk ActionCard
  cardContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFBFB", // Krem sangat terang / putih
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  cardLeft: {
    flex: 1,
    justifyContent: "space-between",
    paddingRight: 10,
  },
  cardTitle: {
    fontSize: 12,
    color: "#333333",
    lineHeight: 16,
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: "#38121A", // Cokelat gelap/Burgundy
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignSelf: "flex-start",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  cardRight: {
    justifyContent: "center",
    alignItems: "center",
    width: 60,
  },
  iconPlaceholder: {
    fontSize: 40,
  },
});

export default Dashboard;
