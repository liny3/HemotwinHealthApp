import React from "react";
import { View, Text, Alert, TouchableOpacity, StyleSheet , Image} from "react-native";
import { useNavigation } from "@react-navigation/native";
import CustomButton from "../../components/CutomButton"; // Ensure correct import



export default function HealthDataMenu() {
  const navigation = useNavigation();
  const blood = require("../../assets/bloodkid.png"); // Make sure you have a red heart icon in your assets folder


  return (
    <View style={styles.container}>
      {/* Back to Home Button (Top Left) */}
      <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Home</Text>
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>My Health Data</Text>
            <Image source={blood} style={styles.blood} resizeMode="contain" />
      

      {/* Menu Buttons */}
      <CustomButton title="Blood Test Results" onPress={() => navigation.navigate("BloodTest")} color="#cd2f2e" />
      <CustomButton title="Medication" onPress={() => Alert.alert("Work in Progress", "This feature is still under development.")} color="blue" />
      <CustomButton title="Medical History" onPress={() => Alert.alert("Work in Progress", "This feature is still under development.")} color="gray" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 30,
    fontWeight: "bold",
    color: "#cd2f2e",
    marginBottom: 10,
    textAlign: "center",
  },
  blood:{
    marginBottom:10,
    width:"30%",
    height:"20%"
  }
});