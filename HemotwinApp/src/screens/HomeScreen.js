import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Animated, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
const MENU_WIDTH = width * 0.9; // 90% of screen width

export default function HomeScreen({ route }) {
  const navigation = useNavigation();
  const userId = route?.params?.userId || "Unknown";

  // State for menu animation
  const [menuOpen, setMenuOpen] = useState(false);
  const menuTranslate = new Animated.Value(menuOpen ? 0 : -MENU_WIDTH);

  // Function to toggle menu
  const toggleMenu = () => {
    Animated.timing(menuTranslate, {
      toValue: menuOpen ? -MENU_WIDTH : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setMenuOpen(!menuOpen);
  };

  return (
<View style={{ flex: 1, backgroundColor: "white" }}>      
      {/* Background Image */}
      <Image
        source={require("../../assets/drop.jpg")}
        style={styles.backgroundImage}
      />
      
      <View style={styles.appTitleContainer}>
        <Text style={styles.appTitle}>MY HEMATWIN</Text>
      </View>

      {/* Menu Button (Top Left) */}
      <TouchableOpacity onPress={toggleMenu} style={styles.menuIcon}>
        <Image source={require("../../assets/hamburger.png")} style={styles.menuImage} />
      </TouchableOpacity>

      {/* Expandable Menu */}
      <Animated.View
        style={[
          styles.menuContainer,
          { transform: [{ translateX: menuTranslate }] },
        ]}
      >
        {/* Close Button (Same Menu Button) */}
        <TouchableOpacity onPress={toggleMenu} style={styles.menuIcon} color="black">
          <Image source={require("../../assets/hamburger.png")} style={styles.menuImage} />
        </TouchableOpacity>

        {/* Navigation Buttons in the Menu */}
        <View style={styles.menuItemsContainer}>
          <TouchableOpacity onPress={() => { toggleMenu(); navigation.navigate("Profile", { userId }); }} style={styles.menuButton}>
            <Text style={styles.menuText}>My Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { toggleMenu(); navigation.navigate("HealthData", { userId }); }} style={styles.menuButton}>
            <Text style={styles.menuText}>My Health Data</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { toggleMenu(); navigation.navigate("RiskAssessment", { userId }); }} style={styles.menuButton}>
            <Text style={styles.menuText}>Risk Assessment</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { toggleMenu(); navigation.navigate("ActionSuggestions", { userId }); }} style={styles.menuButton}>
            <Text style={styles.menuText}>Action Suggestions</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Button (Bottom Left) */}
        <TouchableOpacity onPress={() => navigation.navigate("Settings")} style={styles.settingsButton}>
  <Image source={require("../../assets/setting.png")} style={styles.settingsImage} />
  <Text style={styles.menuText}>Settings</Text>
</TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = {
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  appTitleContainer: {
    position: "absolute",
    bottom: 100,
    width: "80%",
    backgroundColor: "#cd2f2e",
    paddingVertical: 20,
    borderRadius: 10,
    alignSelf: "center",
    alignItems: "center",
    zIndex: 5,
  },
  appTitle: {
    color: "white",
    fontSize: 40,
    fontWeight: "bold",
    zIndex: 5,
  },
  menuIcon: {
    position: "absolute",
    top: 35,
    left: 20,
    zIndex: 10,
  },
  menuImage: {
    width: 40,
    height: 40,
    tintColor:"#a2272c",
  },
  menuContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: MENU_WIDTH,
    height: "100%",
    backgroundColor: "#df797b", // Updated menu background color
    padding: 20,
    zIndex: 9,
  },
  menuItemsContainer: {
    marginTop: 95, // Moves the menu list down below the menu button
  },
  menuButton: {
    backgroundColor: "#cd2f2e", // Rectangle color
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom:18, // Space between buttons
    borderRadius: 10,
    alignItems: "center",
  },
  menuText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  settingsButton: {
    position: "absolute",
    bottom: 40,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  settingsImage: {
    width: 60,
    height: 60,
    tintColor: "#cd2f2e",
  },
};