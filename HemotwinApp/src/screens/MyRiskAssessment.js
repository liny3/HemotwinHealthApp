import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, Alert, StyleSheet,TouchableOpacity } from "react-native";
import { db, doc, getDoc, auth } from "../firebaseConfig";
import CustomButton from "../../components/CutomButton";
import { useNavigation } from "@react-navigation/native";

export default function MyRiskAssessment() {
  const navigation = useNavigation();
  const userEmail = auth.currentUser?.email?.toLowerCase();
  const [profile, setProfile] = useState(null);
  const [healthData, setHealthData] = useState({});
  const [riskLevel, setRiskLevel] = useState("Unknown");
  const [riskExplanation, setRiskExplanation] = useState([]);
  const [leukemiaStage, setLeukemiaStage] = useState("");
  const [leukemiaType, setLeukemiaType] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!userEmail) {
        Alert.alert("Error", "User email not found.");
        return;
      }

      try {
        const profileSnap = await getDoc(doc(db, "patients", userEmail));
        if (profileSnap.exists()) {
          setProfile(profileSnap.data());
        }

        const healthSnap = await getDoc(doc(db, "healthData", userEmail));
        if (healthSnap.exists()) {
          setHealthData(healthSnap.data());
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to load data.");
      }
    };

    fetchData();
  }, [userEmail]);

  const calculateRisk = () => {
    if (!profile || !healthData.wbc || !healthData.rbc || !healthData.platelets || !healthData.hemoglobin) {
      Alert.alert("Error", "Missing patient or health data.");
      return;
    }

    const dob = profile?.dob;
    const gender = profile?.sex?.toLowerCase();
    const [day, month, year] = dob.split("/").map(Number);
    const birthYear = year > 30 ? 1900 + year : 2000 + year;
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;

    const normalRanges = {
      wbc: gender === "male" ? [5000, 10000] : [4500, 11000],
      rbc: gender === "male" ? [4.7, 6.1] : [4.2, 5.4],
      platelets: [150000, 400000],
      hemoglobin: gender === "male" ? [14, 18] : [12, 16],
    };

    let risk = "Low";
    let explanation = [];

    // Check WBC
    if (healthData.wbc > 100000) {
      risk = "High";
      explanation.push(`WBC: ${healthData.wbc} (Above 100,000 - Very High)`);
    } else if (healthData.wbc > 50000) {
      risk = "Medium";
      explanation.push(`WBC: ${healthData.wbc} (Above 50,000 - Elevated)`);
    } else {
      explanation.push(`WBC: ${healthData.wbc} (Normal Range: ${normalRanges.wbc[0]} - ${normalRanges.wbc[1]})`);
    }

    // Check RBC
    if (healthData.rbc < normalRanges.rbc[0]) {
      risk = "High";
      explanation.push(`RBC: ${healthData.rbc} (Below Normal: ${normalRanges.rbc[0]} - ${normalRanges.rbc[1]})`);
    } else {
      explanation.push(`RBC: ${healthData.rbc} (Normal Range: ${normalRanges.rbc[0]} - ${normalRanges.rbc[1]})`);
    }

    // Check Platelets
    if (healthData.platelets < normalRanges.platelets[0]) {
      risk = "High";
      explanation.push(`Platelets: ${healthData.platelets} (Below Normal: ${normalRanges.platelets[0]} - ${normalRanges.platelets[1]})`);
    } else {
      explanation.push(`Platelets: ${healthData.platelets} (Normal Range: ${normalRanges.platelets[0]} - ${normalRanges.platelets[1]})`);
    }

    // Check Hemoglobin
    if (healthData.hemoglobin < normalRanges.hemoglobin[0]) {
      risk = "High";
      explanation.push(`Hemoglobin: ${healthData.hemoglobin} (Below Normal: ${normalRanges.hemoglobin[0]} - ${normalRanges.hemoglobin[1]})`);
    } else {
      explanation.push(`Hemoglobin: ${healthData.hemoglobin} (Normal Range: ${normalRanges.hemoglobin[0]} - ${normalRanges.hemoglobin[1]})`);
    }

    setRiskLevel(risk);
    setRiskExplanation(explanation);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

<TouchableOpacity onPress={() => navigation.navigate("RiskAssessment")} style={styles.backButton}>
      <Text style={styles.backButtonText}>← Risk Assessment</Text>
    </TouchableOpacity>

      <Text style={styles.title}>My Risk Assessment</Text>

      <Text style={styles.label}>Leukemia Stage (if applicable):</Text>
      <TextInput style={styles.input} value={leukemiaStage} onChangeText={setLeukemiaStage} placeholder="Enter stage (e.g., 1, 2, 3, 4)" />

      <Text style={styles.label}>Leukemia Type (if applicable):</Text>
      <TextInput style={styles.input} value={leukemiaType} onChangeText={setLeukemiaType} placeholder="Enter type (e.g., AML, CLL)" />


      <Text style={styles.riskText}>Risk Level: {riskLevel}</Text>

      {riskExplanation.length > 0 && (
        <View style={styles.explanationBox}>
          <Text style={styles.explanationTitle}>Risk Explanation:</Text>
          {riskExplanation.map((item, index) => (
            <Text key={index} style={styles.explanationText}>{item}</Text>
          ))}
        </View>
      )}

<CustomButton title="Calculate Risk" onPress={calculateRisk} color="#cd2f2e" />

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
  title: {
    top:100,
    fontSize: 24,
    fontWeight: "bold",
    color: "#cd2f2e",
    marginBottom: 100,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 30,
    color: "black",
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  riskText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#cd2f2e",
    marginTop: 20,
    textAlign: "center",
  },
  explanationBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f8d7da",
    borderRadius: 8,
    width: "100%",
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#721c24",
  },
  explanationText: {
    fontSize: 16,
    color: "#721c24",
    marginTop: 5,
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
});