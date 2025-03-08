import React, { useState } from "react";
import { View, Text, ScrollView, Alert, StyleSheet, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import CustomButton from "../../components/CutomButton";

export default function OcrPlayground() {
  const [image, setImage] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [structuredData, setStructuredData] = useState(null);

  // ✅ Pick Image for OCR Testing
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

  // ✅ Extract Text from Image
  const extractText = async (imageUri) => {
    try {
      console.log("Processing image for OCR:", imageUri);

      let formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        name: "image.jpg",
        type: "image/jpeg",
      });
      formData.append("language", "eng");
      formData.append("isOverlayRequired", "false");

      const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        headers: { "apikey": "helloworld" },
        body: formData,
      });

      const result = await response.json();
      console.log("OCR API Response:", result);

      if (!result.ParsedResults || result.ParsedResults.length === 0) {
        throw new Error("No text detected in image.");
      }

      const extractedText = result.ParsedResults[0].ParsedText || "";
      console.log("Extracted Text:", extractedText);
      setExtractedText(extractedText);

      // ✅ Process the text to extract structured data
      processExtractedText(extractedText);

    } catch (error) {
      console.error("OCR Error:", error);
      Alert.alert("Error", "Failed to extract text. Please try again.");
    }
  };

  // ✅ Process extracted text row by row
  const processExtractedText = (text) => {
    const lines = text.split("\n").map((line) => line.trim());

    let extractedData = {
      wbc: "N/A",
      rbc: "N/A",
      platelets: "N/A",
      hemoglobin: "N/A",
    };

    // ✅ Look for test names and values in the same row
    lines.forEach((line) => {
      const words = line.split(/\s+/);

      // ✅ Extract number closest to the test name
      const extractValidNumber = (lineWords, keywords, min, max) => {
        let foundIndex = lineWords.findIndex((word) =>
          keywords.some((keyword) => word.toLowerCase().includes(keyword.toLowerCase()))
        );

        if (foundIndex !== -1) {
          for (let i = foundIndex + 1; i < lineWords.length; i++) {
            let cleanedNumber = lineWords[i].replace(/[^0-9.]/g, ""); // Remove non-numeric characters

            // ✅ Ignore reference ranges (e.g., "83 - 101")
            if (!isNaN(cleanedNumber) && cleanedNumber !== "" && !lineWords[i].includes("-")) {
              let number = parseFloat(cleanedNumber);
              if (number >= min && number <= max) {
                return number;
              }
            }
          }
        }
        return "N/A";
      };

      // ✅ Extract data row by row
      if (words.some((word) => ["wbc", "white blood cell"].some((kw) => word.toLowerCase().includes(kw)))) {
        extractedData.wbc = extractValidNumber(words, ["WBC", "White Blood Cell"], 4000, 11000);
      }
      if (words.some((word) => ["rbc", "red blood cell"].some((kw) => word.toLowerCase().includes(kw)))) {
        extractedData.rbc = extractValidNumber(words, ["RBC", "Red Blood Cell"], 4.0, 6.5);
      }
      if (words.some((word) => ["platelets", "plt"].some((kw) => word.toLowerCase().includes(kw)))) {
        extractedData.platelets = extractValidNumber(words, ["Platelets", "PLT"], 150000, 450000);
      }
      if (words.some((word) => ["hemoglobin", "hgb", "hb"].some((kw) => word.toLowerCase().includes(kw)))) {
        extractedData.hemoglobin = extractValidNumber(words, ["Hemoglobin", "HGB", "HB"], 9.0, 18.5);
      }
    });

    console.log("Structured Blood Test Data:", extractedData);
    setStructuredData(extractedData);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>OCR Playground</Text>
      
      <CustomButton title="Select Image for OCR" onPress={pickImage} color="blue" />
      
      {image && <Image source={{ uri: image }} style={styles.image} />}
      
      <Text style={styles.subtitle}>Extracted Raw Text:</Text>
      <ScrollView style={styles.textBox}>
        <Text style={styles.extractedText}>{extractedText || "No text extracted yet."}</Text>
      </ScrollView>

      <Text style={styles.subtitle}>Extracted Blood Test Data:</Text>
      <View style={styles.resultBox}>
        {structuredData ? (
          Object.entries(structuredData).map(([key, value]) => (
            <Text key={key} style={styles.resultText}>
              {key.toUpperCase()}: {value}
            </Text>
          ))
        ) : (
          <Text style={styles.resultText}>No structured data extracted yet.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", alignItems: "center", justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#cd2f2e" },
  subtitle: { fontSize: 18, fontWeight: "600", marginTop: 20, color: "gray" },
  image: { width: 250, height: 250, marginTop: 20, borderRadius: 10 },
  textBox: { width: "100%", height: 200, backgroundColor: "#f8f8f8", padding: 10, marginTop: 10, borderRadius: 10 },
  extractedText: { fontSize: 16, color: "#333" },
  resultBox: { width: "100%", backgroundColor: "#f0f0f0", padding: 15, marginTop: 10, borderRadius: 10 },
  resultText: { fontSize: 16, color: "#333", fontWeight: "600" },
});