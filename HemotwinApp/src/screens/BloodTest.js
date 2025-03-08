import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, Alert, ActivityIndicator, TouchableOpacity, StyleSheet, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { db, doc, getDoc, setDoc, auth } from "../firebaseConfig";
import CustomButton from "../../components/CutomButton"; 
import { useNavigation } from "@react-navigation/native";

export default function MyHealthData() {
  const navigation = useNavigation();
  const userEmail = auth.currentUser?.email?.toLowerCase();
  const [profile, setProfile] = useState(null);
  const [healthData, setHealthData] = useState({
    wbc: "",
    rbc: "",
    platelets: "",
    hemoglobin: "",
  });

  const [loading, setLoading] = useState(true);

  // ✅ Fetch profile & health data from Firestore
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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userEmail]);

  // ✅ Get normal reference ranges based on age and sex
  const getReferenceRange = (key) => {
    if (!profile) return "Loading...";
    const { sex, dob } = profile;
    if (!dob) return "N/A";

    const [day, month, year] = dob.split("/").map(Number);
    const currentYear = new Date().getFullYear();
    const birthYear = year > 30 ? 1900 + year : 2000 + year;
    const age = currentYear - birthYear;

    const isChild = age < 18;
    const isMale = sex?.toLowerCase() === "male";

    if (key === "wbc") return isChild ? "5,000 - 10,000 K/uL" : isMale ? "5,000 - 10,000 K/uL" : "4,500 - 11,000 K/uL";
    if (key === "rbc") return isChild ? "4.0 - 5.5 M/uL" : isMale ? "4.7 - 6.1 M/uL" : "4.2 - 5.4 M/uL";
    if (key === "platelets") return "150,000 - 400,000 K/uL";
    if (key === "hemoglobin") return isChild ? "9.5 - 15.5 g/dL" : isMale ? "14 - 18 g/dL" : "12 - 16 g/dL";

    return "N/A";
  };


  const [image, setImage] = useState(null);
// ✅ Pick Image for OCR
const pickImage = async () => {
  let result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    base64: false,
    quality: 1,
  });

  if (!result.canceled) {
    setImage(result.assets[0].uri);
    extractText(result.assets[0].uri);
  }
};

// ✅ Extract Text from Image & Compare with Old Values
const extractText = async (imageUri) => {
  try {
    console.log("Processing image for OCR:", imageUri);

    // Convert image URI to a format OCR.Space can recognize
    let formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      name: "image.jpg",
      type: "image/jpeg",
    });
    formData.append("language", "eng"); // Set language
    formData.append("isOverlayRequired", "false");

    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        "apikey": "K86648091188957", // Free API key (low limits)
      },
      body: formData,
    });

    const result = await response.json();

    if (!result.ParsedResults || result.ParsedResults.length === 0) {
      throw new Error("No text detected in image.");
    }

    const extractedText = result.ParsedResults[0].ParsedText || "";
    console.log("Extracted Text:", extractedText);

    // Process extracted text
    const words = extractedText.split(/\s+/);

    // Function to find the closest valid number within a range
    const findValidNumber = (keywords, min, max, tolerance = 0) => {
      const index = words.findIndex((word) =>
        keywords.some((keyword) => word.toLowerCase().includes(keyword.toLowerCase()))
      );

      if (index !== -1) {
        for (let i = index + 1; i < words.length; i++) {
          const cleanedNumber = words[i].replace(/[^0-9.]/g, ""); // Remove non-numeric characters
          if (words[i].includes("-") || words[i].includes("/")) continue;


          if (!isNaN(cleanedNumber) && cleanedNumber !== "") {
            const number = parseFloat(cleanedNumber);

            // Allow values within the range +/- tolerance
            if (number >= min - tolerance && number <= max + tolerance) {
              return number;
            }
          }
        }
      }
      return 0; // Default to 0 if no valid number is found
    };

    // Extract and validate blood test values
    const extractedData = {
      wbc: findValidNumber(["WBC", "White Blood Cell", "White Blood Cells"], 4000, 11000, 1000),
      rbc: findValidNumber(["RBC", "Red Blood Cell", "Red Blood Cells"], 4.0, 6.5, 1.0),
      platelets: findValidNumber(["Platelets", "Platelet Count", "Platelet"], 150000, 410000, 10000),
      hemoglobin: findValidNumber(["Hemoglobin", "HGB", "HB"], 9.0, 18.5, 1.0),
    };

    console.log("Extracted Blood Test Data:", extractedData);

    // ✅ Compare extracted values with current values
    if (JSON.stringify(extractedData) !== JSON.stringify(healthData)) {
      console.log("Changes detected. Updating Firestore...");
      await saveHealthData(extractedData);
    } else {
      console.log("No changes detected. Firestore update skipped.");
      Alert.alert("Info", "No changes detected in blood test results.");
    }
  } catch (error) {
    console.error("OCR Error:", error);
    Alert.alert("Error", "Failed to extract text. Please enter manually.");
  }
};

// ✅ Save Health Data to Firestore if changes are detected
const saveHealthData = async (newData) => {
  try {
    await setDoc(doc(db, "healthData", userEmail), newData);
    setHealthData(newData);
    Alert.alert("Success", "Health data updated!");
  } catch (error) {
    Alert.alert("Error", error.message);
  }
};

if (loading) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="red" />
      <Text>Loading Health Data...</Text>
    </View>
  );
}

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 30, fontWeight: "bold", color: "#cd2f2e", marginBottom: 50, top:40 }}>My Blood Test Results</Text>
      <Text style={{ fontSize: 20, color: "#e47971", marginBottom: 20 }}>The scanning process might be inaccurate. If so, please manually input your data below.</Text>

      {["wbc", "rbc", "platelets", "hemoglobin"].map((key) => (
        <View key={key} style={{ width: "100%", marginBottom: 15 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 5, color: "gray" }}>CBC: {key.toUpperCase()}</Text>
          <TextInput style={{ borderWidth: 1, borderColor: "#cd2f2e", borderRadius: 10, padding: 10, fontSize: 16, backgroundColor: "#f8f8f8" }} placeholder={`Enter ${key}`} value={healthData[key]?.toString() || ""} onChangeText={(text) => setHealthData({ ...healthData, [key]: text })} />
          <Text style={{ fontSize: 12, color: "gray", marginTop: 3 }}>Normal Range For Age: {getReferenceRange(key)}</Text>
        </View>
      ))}

<CustomButton title="Update Results" onPress={() => saveHealthData(healthData)} color="#cd2f2e" />
<CustomButton title="Update Blood Scan" onPress={pickImage} color="blue" />

                  {image && <Image source={{ uri: image }} style={styles.image} />}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", alignItems: "center", justifyContent: "center", padding: 20 },
  backButton: { position: "absolute", top: 40, left: 20, backgroundColor: "rgba(0,0,0,0.6)", padding: 10, borderRadius: 8,  zIndex:9},
  backButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});