import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import CustomButton from "../../components/CutomButton"; 

export default function LeukemiaRiskMenu() {
  const navigation = useNavigation();
  const blood = require("../../assets/bloodkid.png"); 


  return (
    <View style={styles.container}>
      {/* Back to Home Button */}
      <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Home</Text>
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Leukemia Risk Assessment</Text>
                  <Image source={blood} style={styles.blood} resizeMode="contain" />
      

      {/* Navigation Buttons */}
      <CustomButton title="Leukemia Information" onPress={() => navigation.navigate("LeukemiaInfo")} color="blue" />
      <CustomButton title="My Risk Assessment" onPress={() => navigation.navigate("MyRiskAssessment")} color="#cd2f2e" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#cd2f2e",
    marginBottom: 20,
    textAlign: "center",
  },
  blood:{
    marginBottom:10,
    width:"30%",
    height:"20%"
  }
});