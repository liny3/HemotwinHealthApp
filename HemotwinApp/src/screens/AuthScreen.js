import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, Alert, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, setDoc, doc, getDoc, db } from "../firebaseConfig";
import CustomButton from "../../components/CutomButton";
import * as ImagePicker from "expo-image-picker";

export default function AuthScreen({ navigation, route }) {
  const isSignUp = route?.params?.isSignUp || false;
  const [step, setStep] = useState(1);
  const [image, setImage] = useState(null);
  const [patientId, setPatientId] = useState(null);
  const [selectedSex, setSelectedSex] = useState("");
  const [ocrFeedbackReceived, setOcrFeedbackReceived] = useState(false); //  Track OCR completion
  const [loading, setLoading] = useState(false); //  Show loading indicator during OCR

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    sex: "",
    dob: "",
    ethnicity: "",
    weight: "",
    height: "",
    exercise: "",
    allergies: "",
    email: "",
    password: "",
  });

  const [healthData, setHealthData] = useState({
    wbc: 0,
    rbc: 0,
    platelets: 0,
    hemoglobin: 0,
  });

  //for gender buttons
  const handleSelectSex = (sex) => {
    setSelectedSex(sex);
    setForm((prevForm) => ({ ...prevForm, sex })); // Ensure form is updated 
  };

  //regarding the next button, ensuring fields have been filled in before users can move on
  const handleNextStep = () => {
    console.log("Form Data Before Next Step:", form); // Debugging
  
    if (step === 1) {
      // List required fields for step 1
      const requiredFields = ["firstName", "lastName", "sex", "dob", "ethnicity", "weight", "height", "exercise", "allergies"];
      
      // Check if any required field is empty
      const isFormIncomplete = requiredFields.some((field) => !form[field].trim());
      
      if (isFormIncomplete) {
        Alert.alert("Incomplete", "Please fill out all fields before proceeding.");
        return;
      }
    }
  
    if (step === 2 && !image) {
      Alert.alert("Upload Required", "Please upload a blood test image.");
      return;
    }
  
    setStep((prev) => prev + 1);
  };

  const handleBackStep = () => setStep((prev) => prev - 1);
//for blood test scan, users pick iamge from library
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setOcrFeedbackReceived(false); // Reset feedback state when a new image is selected
      extractText(result.assets[0].uri);
    }
  };

  const extractText = async (imageUri) => {
    try {
      setLoading(true); //  Show loading indicator
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
          "apikey": "K86648091188957", // Free API key from OCR space account, 2500? monthly request limit. Awesome.
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
            if (words[i].includes("-") || words[i].includes("/")) continue; //ensure numbers such as the normal range values aren't considered

  
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
        wbc: findValidNumber(["WBC", "White Blood Cell", "White Blood Cells"], 4000, 11000, 1000),    //Lower limit, upper limit, +/- leniency
        rbc: findValidNumber(["RBC", "Red Blood Cell", "Red Blood Cells"], 4.0, 6.5, 1.0),
        platelets: findValidNumber(["Platelets", "Platelet Count", "Platelet"], 150000, 410000, 10000),
        hemoglobin: findValidNumber(["Hemoglobin", "HGB", "HB"], 9.0, 18.5, 1.0),
      };
  
      console.log("Extracted Blood Test Data:", extractedData);
      setHealthData(extractedData);
      Alert.alert("Success", "Blood test data extracted successfully!");
    } catch (error) {
      console.error("OCR Error:", error);
      Alert.alert("Error", "Failed to extract text. Please enter manually.");
    }finally {
      setOcrFeedbackReceived(true); // Allow user to proceed after OCR feedback
      setLoading(false); // Hide loading indicator
    }
  };
    
  const handleSignUp = async () => {
    try {
      const normalizedEmail = form.email.toLowerCase(); // Convert to lowercase, make it easier for future processes/ standardisation
  
      // Check if the user already exists
      const existingUser = await getDoc(doc(db, "patients", normalizedEmail));
      if (existingUser.exists()) {
        Alert.alert("Error", "An account with this email already exists.");
        return;
      }
      let dob = form.dob.trim();
    const dobRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (!dobRegex.test(dob)) {
      Alert.alert("Invalid DOB", "Please enter your date of birth in the format dd/mm/yyyy.");
      return;
    }
  
      // Create user account in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, form.password);
      const user = userCredential.user;
      
      // Generate a unique patient ID
      const newPatientId = `HT${Math.floor(1000 + Math.random() * 9000)}`;
      setPatientId(newPatientId);
  
      // Save user data in Firestore under "patients" collection
      await setDoc(doc(db, "patients", normalizedEmail), { 
        ...form, 
        dob,
        email: normalizedEmail, // Ensure email is stored in lowercase
        patientId: newPatientId 
      });
  
      // Save health data in Firestore
      await setDoc(doc(db, "healthData", normalizedEmail), healthData);
  
      Alert.alert("Success", `Welcome ${form.firstName}! Your Patient ID is: ${newPatientId}`);
      navigation.navigate("Home");
    } catch (error) {
      Alert.alert("Sign-Up Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
             

      <ScrollView contentContainerStyle={styles.scrollView}>
      <TouchableOpacity onPress={() => navigation.navigate("Welcome")} style={styles.backButton}>
                                <Text style={styles.backButtonText}>← Back</Text>
                              </TouchableOpacity>
        <Text style={styles.title}>{isSignUp ? "Sign Up" : "Log In"}</Text>

        <View style={styles.formContainer}>
          {isSignUp ? (
            <>
              {step === 1 && (
                <>
                  <TextInput placeholder="First Name" style={styles.input} value={form.firstName} // Ensure controlled input
  onChangeText={(text) => setForm((prev) => ({ ...prev, firstName: text }))}  />
                  <TextInput placeholder="Last Name" style={styles.input} value={form.lastName} // Ensure controlled input
  onChangeText={(text) => setForm((prev) => ({ ...prev, lastName: text }))}  />
                 <TextInput
  placeholder="Date of Birth (dd/mm/yyyy)"
  style={styles.input}
  value={form.dob}
  onChangeText={(text) => {
    let formattedText = text.replace(/\D/g, ""); // Remove non-numeric characters
    
    // Auto-insert `/` at positions 2 and 5 (dd/mm/yyyy)
    if (formattedText.length > 2) {
      formattedText = `${formattedText.slice(0, 2)}/${formattedText.slice(2)}`;
    }
    if (formattedText.length > 5) {
      formattedText = `${formattedText.slice(0, 5)}/${formattedText.slice(5)}`;
    }

    // Limit to 10 characters (dd/mm/yyyy)
    if (formattedText.length <= 10) {
      setForm((prev) => ({ ...prev, dob: formattedText }));
    }
  }}
  maxLength={10} // Ensures users can't enter more than "dd/mm/yyyy"
  keyboardType="numeric"
/>
                  
                  <View style={styles.sexSelection}>
                    <CustomButton 
                      title="Male" 
                      onPress={() => handleSelectSex("Male")} 
                      style={[styles.sexButton, selectedSex === "Male" && styles.selectedSex]} 
                    />
                    <CustomButton 
                      title="Female" 
                      onPress={() => handleSelectSex("Female")} 
                      style={[styles.sexButton, selectedSex === "Female" && styles.selectedSex]} 
                    />
                  </View>

                  <TextInput placeholder="Ethnicity" style={styles.input} value={form.ethnicity} // Ensure controlled input
  onChangeText={(text) => setForm((prev) => ({ ...prev, ethnicity: text }))} />
                  <TextInput placeholder="Weight (kg)" style={styles.input} keyboardType="numeric" value={form.weight} // Ensure controlled input
  onChangeText={(text) => setForm((prev) => ({ ...prev, weight: text }))}  />
                  <TextInput placeholder="Height (cm)" style={styles.input} keyboardType="numeric" value={form.height} // Ensure controlled input
  onChangeText={(text) => setForm((prev) => ({ ...prev, height: text }))}  />
                  <TextInput placeholder="Exercise per week" style={styles.input} value={form.exercise} // Ensure controlled input
  onChangeText={(text) => setForm((prev) => ({ ...prev, exercise: text }))} />
                  <TextInput placeholder="Allergies" style={styles.input} value={form.allergies} // Ensure controlled input
  onChangeText={(text) => setForm((prev) => ({ ...prev, allergies: text }))}  />

                  <CustomButton title="Next" onPress={handleNextStep} />
                </>
              )}

              {step === 2 && (
                <>
                  <CustomButton title="Upload Blood Test" onPress={pickImage} />
            {image && <Image source={{ uri: image }} style={styles.image} />}
            {loading && <ActivityIndicator size="large" color="blue" />} 

            <CustomButton title="Next" onPress={() => setStep(3)} />
            <CustomButton title="Back" onPress={() => setStep(1)} />
                </>
              )}

              {step === 3 && (
                <>
                  <TextInput placeholder="Email" style={styles.input} onChangeText={(text) => setForm({ ...form, email: text })} />
                  <TextInput placeholder="Password" secureTextEntry style={styles.input} onChangeText={(text) => setForm({ ...form, password: text })} />
                  <CustomButton title="Sign Up" onPress={handleSignUp} />
                  <CustomButton title="Back" onPress={handleBackStep} />
                </>
              )}
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: "#f3f4f6",
  justifyContent: "center",
  },
  scrollView: {
  flexGrow: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
  },
  title: {
  fontSize: 24,
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: 20,
  },
  formContainer: {
  width: "100%",
  maxWidth: 350,
  backgroundColor: "white",
  padding: 20,
  borderRadius: 10,
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 5,
  elevation: 5,
  },
  input: {
  borderWidth: 1,
  borderColor: "#ccc",
  padding: 10,
  borderRadius: 5,
  marginBottom: 10,
  backgroundColor: "white",
  },
  sexSelection: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 10,
  },
  sexButton: {
  flex: 1,
  marginHorizontal: 5,
  backgroundColor: "#ddd",
  },
  selectedSex: {
  backgroundColor: "#b02a2a",
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