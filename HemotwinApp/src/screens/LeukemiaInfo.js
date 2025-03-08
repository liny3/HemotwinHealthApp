import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import CustomButton from "../../components/CutomButton"; // Ensure correct import

const images = [
  require("../../assets/1.png"),
  require("../../assets/2.png"),
  require("../../assets/3.png"),
  require("../../assets/4.png"),
  require("../../assets/5.png"),
];

export default function LeukemiaInfo() {
  const navigation = useNavigation();
  const [index, setIndex] = useState(0);

  const nextImage = () => {
    if (index < images.length - 1) setIndex(index + 1);
  };

  const prevImage = () => {
    if (index > 0) setIndex(index - 1);
  };

  return (
    <View style={styles.container}>
    {/* Background Image */}
    <Image source={images[index]} style={styles.image} resizeMode="contain" />

    {/* Risk Assessment Back Button */}
    <TouchableOpacity onPress={() => navigation.navigate("RiskAssessment")} style={styles.backButton}>
      <Text style={styles.backButtonText}>← Risk Assessment</Text>
    </TouchableOpacity>

    {/* Navigation Buttons */}
    <View style={styles.buttonContainer}>
      <View style={{ flex: 1, marginRight: 10 }}>
        <CustomButton title="← Previous" onPress={prevImage} disabled={index === 0} color="black" />
      </View>
      <View style={{ flex: 1, marginLeft: 10 }}>
        <CustomButton title="Next →" onPress={nextImage} disabled={index === images.length - 1} color="black" />
      </View>
    </View>
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    position: "absolute",
    bottom: 10,
    width: "90%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 30,
    flexDirection: "row",
    width: "90%",
    justifyContent: "space-between",
    paddingHorizontal: 20, // Adds spacing to the sides
  },
});
