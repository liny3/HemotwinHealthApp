import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function Suggestions() {
  const navigation = useNavigation();
  const [selectedStage, setSelectedStage] = useState(null);

  // Preload images (React Native does not support dynamic requires)
  const stageImages = {
    0: require("../../assets/Stage0.png"),
    1: require("../../assets/Stage1.png"),
    2: require("../../assets/Stage2.png"),
    3: require("../../assets/Stage3.png"),
    4: require("../../assets/Stage4.png"),
  };

  // Heart icon for buttons
  const heartIcon = require("../../assets/heart.png");

  // Header Image
  const headerImage = require("../../assets/Suggestionsdrop.png");

  // If a stage is selected, show the corresponding image
  if (selectedStage !== null) {
    return (
      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={() => setSelectedStage(null)} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Suggestions</Text>
        </TouchableOpacity>
        <Image source={stageImages[selectedStage]} style={styles.image} resizeMode="contain" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back to Home Button */}
      <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.homeButton}>
        <Text style={styles.backButtonText}>← Home</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Leukemia Suggestions</Text>
      <Image source={headerImage} style={styles.headerImage} resizeMode="contain" />


      {/* Leukemia Stage Buttons with Hearts */}
      <View style={styles.buttonContainer}>
        {[0, 1, 2, 3, 4].map((stage) => (
          <TouchableOpacity key={stage} onPress={() => setSelectedStage(stage)} style={styles.stageButton}>
            <Image source={heartIcon} style={styles.heartIcon} />
            <Text style={styles.stageText}>{stage}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "white",
    alignItems: "center",
    padding: 20,
  },
  homeButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 8,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 8,
    zIndex: 10,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  headerImage: {
    width: "100%",
    height: "50%",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#cd2f2e",
    marginBottom: 80,
    top:100,
    textAlign: "center",
    zIndex:9
  },
  subtitle: {
    fontSize: 16,
    color: "black",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  stageButton: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
  },
  heartIcon: {
    width: 80,
    height: 80,
  },
  stageText: {
    position: "absolute",
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  imageContainer: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    zIndex:5
  },
  image: {
    width: "90%",
    height: "90%",
  },
});